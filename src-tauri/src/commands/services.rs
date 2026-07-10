use serde::{Deserialize, Serialize};
use crate::ssh::services::ServiceInfo;
use super::execute_on_server;
use super::validation::validate_service_name;

#[derive(Debug, Serialize, Deserialize)]
pub struct ListServicesInput {
    pub server_id: String,
    pub filter: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceActionInput {
    pub server_id: String,
    pub service_name: String,
    pub action: String,
}

#[tauri::command]
pub async fn list_services(input: ListServicesInput) -> Result<Vec<ServiceInfo>, String> {
    let cmd = match &input.filter {
        Some(filter) => format!("systemctl list-units --type=service --all | grep -i {} || true", filter),
        None => "systemctl list-units --type=service --all".to_string(),
    };
    
    let output = execute_on_server(&input.server_id, &cmd).await?;
    let services = crate::ssh::services::parse_systemctl_list(&output);
    Ok(services)
}

#[tauri::command]
pub async fn get_service_status(input: ServiceActionInput) -> Result<String, String> {
    validate_service_name(&input.service_name)?;
    let cmd = format!("systemctl is-active {}", input.service_name);
    let output = execute_on_server(&input.server_id, &cmd).await?;
    Ok(output.trim().to_string())
}

#[tauri::command]
pub async fn service_action(input: ServiceActionInput) -> Result<(), String> {
    let valid_actions = ["start", "stop", "restart", "enable", "disable"];
    if !valid_actions.contains(&input.action.as_str()) {
        return Err(format!("Invalid action: {}", input.action));
    }
    validate_service_name(&input.service_name)?;
    
    let cmd = format!("sudo systemctl {} {}", input.action, input.service_name);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn get_service_logs(input: ListServicesInput, service_name: String, lines: Option<i32>) -> Result<String, String> {
    validate_service_name(&service_name)?;
    let tail_lines = lines.unwrap_or(100);
    let cmd = format!("journalctl -u {} --no-pager -n {}", service_name, tail_lines);
    let output = execute_on_server(&input.server_id, &cmd).await?;
    Ok(output)
}
