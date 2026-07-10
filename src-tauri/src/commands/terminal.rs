use crate::db::queries::servers::get_server_by_id;
use crate::db::DbState;
use serde::{Deserialize, Serialize};
use ssh2::Session;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::sync::mpsc::{self, Sender};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalSession {
    pub id: String,
    pub server_id: String,
    pub server_name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTerminalSessionInput {
    pub server_id: String,
}

pub struct TerminalState {
    pub sessions: Mutex<HashMap<String, TerminalSession>>,
    pub input_senders: Mutex<HashMap<String, Sender<String>>>,
    pub stop_flags: Mutex<HashMap<String, Sender<()>>>,
}

impl TerminalState {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
            input_senders: Mutex::new(HashMap::new()),
            stop_flags: Mutex::new(HashMap::new()),
        }
    }
}

#[tauri::command]
pub fn create_terminal_session(
    state: State<'_, DbState>,
    terminal_state: State<'_, TerminalState>,
    input: CreateTerminalSessionInput,
    app: AppHandle,
) -> Result<TerminalSession, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let server = get_server_by_id(&conn, &input.server_id).map_err(|e| e.to_string())?;

    let session_id = Uuid::new_v4().to_string();
    let session = TerminalSession {
        id: session_id.clone(),
        server_id: server.id.clone(),
        server_name: server.name.clone(),
        host: server.host.clone(),
        port: server.port,
        username: server.username.clone(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    let host = server.host.clone();
    let port = server.port;
    let username = server.username.clone();
    let auth_type = server.auth_type.clone();
    let password = server.password.clone();
    let private_key = server.private_key.clone();
    let passphrase = server.passphrase.clone();
    drop(conn);

    let (input_tx, input_rx) = mpsc::channel::<String>();
    let (stop_tx, stop_rx) = mpsc::channel::<()>();

    let sid = session_id.clone();
    let app_clone = app.clone();

    std::thread::spawn(move || {
        match run_ssh_pty(&host, port, &username, &auth_type, password.as_deref(), private_key.as_deref(), passphrase.as_deref(), input_rx, stop_rx, &app_clone, &sid) {
            Ok(()) => {}
            Err(e) => {
                let _ = app_clone.emit(
                    &format!("terminal:data:{}", sid),
                    serde_json::json!({ "data": format!("\r\n\x1b[31m{}\x1b[0m\r\n", e) }),
                );
            }
        }
    });

    let mut sessions = terminal_state.sessions.lock().map_err(|e| e.to_string())?;
    sessions.insert(session_id.clone(), session.clone());

    let mut senders = terminal_state.input_senders.lock().map_err(|e| e.to_string())?;
    senders.insert(session_id.clone(), input_tx);

    let mut stops = terminal_state.stop_flags.lock().map_err(|e| e.to_string())?;
    stops.insert(session_id.clone(), stop_tx);

    app.emit("terminal:session_created", &session)
        .map_err(|e| e.to_string())?;

    Ok(session)
}

fn run_ssh_pty(
    host: &str,
    port: u16,
    username: &str,
    auth_type: &str,
    password: Option<&str>,
    private_key: Option<&str>,
    passphrase: Option<&str>,
    input_rx: mpsc::Receiver<String>,
    stop_rx: mpsc::Receiver<()>,
    app: &AppHandle,
    session_id: &str,
) -> Result<(), String> {
    let addr = format!("{}:{}", host, port);
    let tcp = TcpStream::connect(&addr).map_err(|e| format!("SSH connect failed: {}", e))?;
    let mut sess = Session::new().map_err(|e| format!("Session creation failed: {}", e))?;
    sess.set_tcp_stream(tcp);
    sess.handshake().map_err(|e| format!("SSH handshake failed: {}", e))?;

    match auth_type {
        "password" => {
            let pw = password.unwrap_or("");
            sess.userauth_password(username, pw)
                .map_err(|e| format!("Password auth failed: {}", e))?;
        }
        "key" | "key_with_passphrase" => {
            let key_path = private_key.unwrap_or("");
            let pass = passphrase.filter(|p| !p.is_empty());
            sess.userauth_pubkey_file(username, None, std::path::Path::new(key_path), pass)
                .map_err(|e| format!("Key auth failed: {}", e))?;
        }
        _ => {
            return Err(format!("Unknown auth type: {}", auth_type));
        }
    }

    if !sess.authenticated() {
        return Err("SSH authentication failed".to_string());
    }

    let mut channel = sess.channel_session().map_err(|e| format!("Channel open failed: {}", e))?;
    channel.request_pty("xterm-256color", None, Some((80, 24, 0, 0)))
        .map_err(|e| format!("PTY request failed: {}", e))?;
    channel.shell().map_err(|e| format!("Shell open failed: {}", e))?;

    let mut read_buf = [0u8; 4096];
    let channel_clone = std::sync::Arc::new(std::sync::Mutex::new(channel));

    let chan_for_read = channel_clone.clone();
    let sid_owned = session_id.to_string();
    let app_for_read = app.clone();

    let read_handle = std::thread::spawn(move || {
        loop {
            let mut ch = chan_for_read.lock().unwrap();
            match ch.read(&mut read_buf) {
                Ok(0) => break,
                Ok(n) => {
                    let data = String::from_utf8_lossy(&read_buf[..n]).to_string();
                    let _ = app_for_read.emit(
                        &format!("terminal:data:{}", sid_owned),
                        serde_json::json!({ "data": data }),
                    );
                }
                Err(_) => break,
            }
        }
    });

    loop {
        if stop_rx.try_recv().is_ok() {
            break;
        }

        match input_rx.recv_timeout(std::time::Duration::from_millis(50)) {
            Ok(data) => {
                let mut ch = channel_clone.lock().unwrap();
                let _ = ch.write_all(data.as_bytes());
                let _ = ch.flush();
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {}
            Err(mpsc::RecvTimeoutError::Disconnected) => break,
        }
    }

    let _ = read_handle.join();
    Ok(())
}

#[tauri::command]
pub fn close_terminal_session(
    terminal_state: State<'_, TerminalState>,
    session_id: String,
    app: AppHandle,
) -> Result<(), String> {
    if let Some(sender) = terminal_state.input_senders.lock().map_err(|e| e.to_string())?.remove(&session_id) {
        drop(sender);
    }
    if let Some(stop_sender) = terminal_state.stop_flags.lock().map_err(|e| e.to_string())?.remove(&session_id) {
        let _ = stop_sender.send(());
    }
    terminal_state.sessions.lock().map_err(|e| e.to_string())?.remove(&session_id);
    app.emit("terminal:session_closed", &session_id)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_terminal_sessions(
    terminal_state: State<'_, TerminalState>,
) -> Result<Vec<TerminalSession>, String> {
    let sessions = terminal_state.sessions.lock().map_err(|e| e.to_string())?;
    Ok(sessions.values().cloned().collect())
}

#[tauri::command]
pub fn send_terminal_input(
    terminal_state: State<'_, TerminalState>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    let senders = terminal_state.input_senders.lock().map_err(|e| e.to_string())?;
    let sender = senders.get(&session_id).ok_or("Terminal session not found")?;
    sender.send(data).map_err(|e| format!("Failed to send input: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn resize_terminal(
    _session_id: String,
    _cols: u32,
    _rows: u32,
    _app: AppHandle,
) -> Result<(), String> {
    Ok(())
}
