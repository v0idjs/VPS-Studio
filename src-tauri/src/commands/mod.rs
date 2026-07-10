use std::process::Command;

pub mod command_library;
pub mod cron;
pub mod dashboard;
pub mod docker;
pub mod files;
pub mod firewall;
pub mod logs;
pub mod packages;
pub mod processes;
pub mod servers;
pub mod services;
pub mod settings;
pub mod snapshots;
pub mod ssh_keys;
pub mod terminal;
pub mod validation;
pub mod workspaces;

pub struct CommandResult {
    pub output: String,
    pub success: bool,
}

fn execute_on_server_sync(server_id: &str, command: &str) -> Result<String, String> {
    let output = Command::new("ssh")
        .args([server_id, command])
        .output()
        .map_err(|e| format!("Failed to execute SSH command: {}", e))?;
    
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Command failed: {}", stderr));
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

fn execute_on_server_sync_with_status(server_id: &str, command: &str) -> Result<CommandResult, String> {
    let output = Command::new("ssh")
        .args([server_id, command])
        .output()
        .map_err(|e| format!("Failed to execute SSH command: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let success = output.status.success();
    
    Ok(CommandResult { output: stdout, success })
}

pub async fn execute_on_server(server_id: &str, command: &str) -> Result<String, String> {
    let server_id = server_id.to_string();
    let command = command.to_string();
    
    tokio::task::spawn_blocking(move || {
        execute_on_server_sync(&server_id, &command)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

pub async fn execute_on_server_with_status(server_id: &str, command: &str) -> Result<CommandResult, String> {
    let server_id = server_id.to_string();
    let command = command.to_string();
    
    tokio::task::spawn_blocking(move || {
        execute_on_server_sync_with_status(&server_id, &command)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
