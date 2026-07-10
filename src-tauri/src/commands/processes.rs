use serde::{Deserialize, Serialize};
use crate::ssh::processes::ProcessInfo;
use super::execute_on_server;
use super::validation::validate_signal;

#[derive(Debug, Serialize, Deserialize)]
pub struct ListProcessesInput {
    pub server_id: String,
    pub filter: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KillProcessInput {
    pub server_id: String,
    pub pid: i64,
    pub signal: Option<String>,
}

#[tauri::command]
pub async fn list_processes(input: ListProcessesInput) -> Result<Vec<ProcessInfo>, String> {
    let cmd = match &input.filter {
        Some(filter) => format!("ps aux --sort=-%cpu | grep -i {} || true", filter),
        None => "ps aux --sort=-%cpu".to_string(),
    };
    
    let output = execute_on_server(&input.server_id, &cmd).await?;
    let processes = crate::ssh::processes::parse_ps_output(&output);
    Ok(processes)
}

#[tauri::command]
pub async fn kill_process(input: KillProcessInput) -> Result<(), String> {
    let signal = input.signal.unwrap_or_else(|| "SIGTERM".to_string());
    validate_signal(&signal)?;
    let cmd = format!("kill -{} {}", signal, input.pid);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}
