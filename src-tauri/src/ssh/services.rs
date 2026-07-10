use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceInfo {
    pub name: String,
    pub description: String,
    pub status: String,
    pub active_state: String,
    pub sub_state: String,
    pub load_state: String,
    pub pid: Option<i64>,
    pub memory: Option<String>,
    pub cpu: Option<String>,
}

pub fn parse_systemctl_list(output: &str) -> Vec<ServiceInfo> {
    let mut services = Vec::new();
    
    for line in output.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 4 {
            let service = ServiceInfo {
                name: parts[0].to_string(),
                description: parts[1..].join(" "),
                status: parts[1].to_string(),
                active_state: parts[2].to_string(),
                sub_state: parts[3].to_string(),
                load_state: if parts.len() > 4 { parts[4].to_string() } else { "loaded".to_string() },
                pid: None,
                memory: None,
                cpu: None,
            };
            services.push(service);
        }
    }
    
    services
}
