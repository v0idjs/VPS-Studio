use serde::{Deserialize, Serialize};
use crate::ssh::firewall::FirewallRule;
use super::execute_on_server;
use super::validation::{validate_port, validate_protocol, validate_ip};

#[derive(Debug, Serialize, Deserialize)]
pub struct FirewallInput {
    pub server_id: String,
    pub action: Option<String>,
    pub protocol: Option<String>,
    pub port: Option<String>,
    pub from_ip: Option<String>,
    pub to_ip: Option<String>,
    pub rule_number: Option<u32>,
}

#[tauri::command]
pub async fn list_firewall_rules(input: FirewallInput) -> Result<Vec<FirewallRule>, String> {
    let output = execute_on_server(&input.server_id, "ufw status numbered 2>/dev/null || iptables -L -n --line-numbers 2>/dev/null || true").await?;
    
    let rules = if output.contains("Status") {
        crate::ssh::firewall::parse_ufw_status(&output)
    } else {
        crate::ssh::firewall::parse_iptables_rules(&output)
    };
    
    Ok(rules)
}

#[tauri::command]
pub async fn add_firewall_rule(input: FirewallInput) -> Result<(), String> {
    let protocol = input.protocol.unwrap_or_else(|| "tcp".to_string());
    let port = input.port.ok_or("Port required")?;
    let from_ip = input.from_ip.unwrap_or_else(|| "any".to_string());
    
    validate_port(&port)?;
    validate_protocol(&protocol)?;
    validate_ip(&from_ip)?;
    
    let cmd = if from_ip == "any" || from_ip == "anywhere" {
        format!("ufw allow {}/{}", port, protocol)
    } else {
        format!("ufw allow from {} to any port {} proto {}", from_ip, port, protocol)
    };
    
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn delete_firewall_rule(input: FirewallInput) -> Result<(), String> {
    let rule_number = input.rule_number.ok_or("Rule number required")?;
    
    let cmd = format!("ufw delete {}", rule_number);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn enable_firewall(input: FirewallInput) -> Result<(), String> {
    execute_on_server(&input.server_id, "ufw --force enable").await?;
    Ok(())
}

#[tauri::command]
pub async fn disable_firewall(input: FirewallInput) -> Result<(), String> {
    execute_on_server(&input.server_id, "ufw disable").await?;
    Ok(())
}
