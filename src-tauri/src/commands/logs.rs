use serde::{Deserialize, Serialize};
use crate::ssh::logs::LogEntry;
use super::execute_on_server;
use super::validation::{validate_log_source, validate_log_level, validate_service_name};

#[derive(Debug, Serialize, Deserialize)]
pub struct LogInput {
    pub server_id: String,
    pub source: Option<String>,
    pub service: Option<String>,
    pub lines: Option<u32>,
    pub level: Option<String>,
    pub search: Option<String>,
    pub follow: Option<bool>,
}

#[tauri::command]
pub async fn read_logs(input: LogInput) -> Result<Vec<LogEntry>, String> {
    let source = input.source.unwrap_or_else(|| "journalctl".to_string());
    let lines = input.lines.unwrap_or(100);
    let search = input.search.unwrap_or_default();
    
    let cmd = match source.as_str() {
        "journalctl" => {
            let service = input.service.unwrap_or_default();
            let level = input.level.unwrap_or_default();
            let mut parts = vec!["journalctl".to_string(), "-n".to_string(), lines.to_string(), "--no-pager".to_string()];
            if !service.is_empty() {
                validate_service_name(&service)?;
                parts.push(format!("-u '{}'", service));
            }
            if !level.is_empty() {
                validate_log_level(&level)?;
                parts.push(format!("--priority='{}'", level));
            }
            if !search.is_empty() {
                parts.push(format!("--grep='{}'", search));
            }
            parts.join(" ")
        },
        "syslog" => format!("tail -n {} /var/log/syslog 2>/dev/null || tail -n {} /var/log/messages 2>/dev/null", lines, lines),
        "auth" => format!("tail -n {} /var/log/auth.log 2>/dev/null || tail -n {} /var/log/secure 2>/dev/null", lines, lines),
        "nginx" => format!("tail -n {} /var/log/nginx/access.log 2>/dev/null", lines),
        "nginx_error" => format!("tail -n {} /var/log/nginx/error.log 2>/dev/null", lines),
        _ => {
            validate_log_source(&source)?;
            format!("tail -n {} /var/log/{} 2>/dev/null", lines, source)
        },
    };
    
    let output = execute_on_server(&input.server_id, &cmd).await?;
    
    let entries = if source == "journalctl" {
        crate::ssh::logs::parse_journalctl_output(&output)
    } else {
        crate::ssh::logs::parse_syslog_output(&output)
    };
    
    Ok(entries)
}
