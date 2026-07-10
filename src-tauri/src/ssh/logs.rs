use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub service: String,
    pub message: String,
    pub pid: Option<String>,
}

pub fn parse_journalctl_output(output: &str) -> Vec<LogEntry> {
    let mut entries = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        
        let entry = LogEntry {
            timestamp: extract_timestamp(line),
            level: extract_level(line),
            service: extract_service(line),
            message: line.to_string(),
            pid: extract_pid(line),
        };
        entries.push(entry);
    }
    
    entries
}

pub fn parse_syslog_output(output: &str) -> Vec<LogEntry> {
    let mut entries = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        
        let entry = LogEntry {
            timestamp: extract_syslog_timestamp(line),
            level: "info".to_string(),
            service: extract_syslog_service(line),
            message: line.to_string(),
            pid: None,
        };
        entries.push(entry);
    }
    
    entries
}

fn extract_timestamp(line: &str) -> String {
    if let Some(pos) = line.find(' ') {
        line[..pos].to_string()
    } else {
        line.to_string()
    }
}

fn extract_level(line: &str) -> String {
    let lower = line.to_lowercase();
    if lower.contains("error") || lower.contains("err]") {
        "error".to_string()
    } else if lower.contains("warn") {
        "warn".to_string()
    } else if lower.contains("debug") {
        "debug".to_string()
    } else {
        "info".to_string()
    }
}

fn extract_service(line: &str) -> String {
    if let Some(start) = line.find("]: ") {
        let before = &line[..start];
        if let Some(pos) = before.rfind('[') {
            before[pos+1..].to_string()
        } else if let Some(pos) = before.rfind(' ') {
            before[pos+1..].to_string()
        } else {
            before.to_string()
        }
    } else {
        "system".to_string()
    }
}

fn extract_pid(line: &str) -> Option<String> {
    if let Some(start) = line.find('[') {
        if let Some(end) = line[start..].find(']') {
            let content = &line[start+1..start+end];
            if content.chars().all(|c| c.is_numeric()) {
                return Some(content.to_string());
            }
        }
    }
    None
}

fn extract_syslog_timestamp(line: &str) -> String {
    let parts: Vec<&str> = line.splitn(3, ' ').collect();
    if parts.len() >= 2 {
        format!("{} {}", parts[0], parts[1])
    } else {
        line.to_string()
    }
}

fn extract_syslog_service(line: &str) -> String {
    if let Some(start) = line.find("]: ") {
        let before = &line[..start];
        if let Some(pos) = before.rfind(' ') {
            before[pos+1..].to_string()
        } else {
            before.to_string()
        }
    } else {
        "system".to_string()
    }
}
