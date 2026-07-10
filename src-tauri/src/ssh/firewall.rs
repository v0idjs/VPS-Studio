use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallRule {
    pub id: String,
    pub number: u32,
    pub action: String,
    pub protocol: String,
    pub from_ip: String,
    pub to_ip: String,
    pub port: String,
    pub direction: String,
    pub enabled: bool,
    pub comment: String,
}

pub fn parse_ufw_status(output: &str) -> Vec<FirewallRule> {
    let mut rules = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with("Status") || line.starts_with("To") || line.starts_with("--") {
            continue;
        }
        
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            let rule = FirewallRule {
                id: uuid::Uuid::new_v4().to_string(),
                number: rules.len() as u32 + 1,
                action: parts[0].to_string(),
                protocol: if parts.len() > 1 { parts[1].to_string() } else { "any".to_string() },
                from_ip: if parts.len() > 2 { parts[2].to_string() } else { "anywhere".to_string() },
                to_ip: if parts.len() > 3 { parts[3].to_string() } else { "anywhere".to_string() },
                port: if parts.len() > 4 { parts[4].to_string() } else { "any".to_string() },
                direction: "in".to_string(),
                enabled: !line.contains("(disabled)"),
                comment: if parts.len() > 5 { parts[5..].join(" ") } else { String::new() },
            };
            rules.push(rule);
        }
    }
    
    rules
}

pub fn parse_iptables_rules(output: &str) -> Vec<FirewallRule> {
    let mut rules = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || !line.contains("ACCEPT") {
            continue;
        }
        
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 4 {
            let rule = FirewallRule {
                id: uuid::Uuid::new_v4().to_string(),
                number: rules.len() as u32 + 1,
                action: "ALLOW".to_string(),
                protocol: if parts.len() > 1 { parts[1].to_string() } else { "any".to_string() },
                from_ip: if parts.len() > 3 { parts[3].to_string() } else { "anywhere".to_string() },
                to_ip: "anywhere".to_string(),
                port: "any".to_string(),
                direction: "in".to_string(),
                enabled: true,
                comment: String::new(),
            };
            rules.push(rule);
        }
    }
    
    rules
}
