use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationRule {
    pub id: String,
    pub name: String,
    pub event_type: String,
    pub condition: String,
    pub server_ids: Vec<String>,
    pub enabled: bool,
    pub notify_desktop: bool,
    pub notify_sound: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationEntry {
    pub id: String,
    pub rule_id: String,
    pub server_id: String,
    pub event_type: String,
    pub message: String,
    pub severity: String,
    pub timestamp: String,
    pub read: bool,
}

pub fn parse_notification_rules(output: &str) -> Vec<NotificationRule> {
    let mut rules = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        
        let parts: Vec<&str> = line.split('|').collect();
        if parts.len() >= 4 {
            let rule = NotificationRule {
                id: uuid::Uuid::new_v4().to_string(),
                name: parts[0].trim().to_string(),
                event_type: parts[1].trim().to_string(),
                condition: parts[2].trim().to_string(),
                server_ids: parts[3].trim().split(',').map(|s| s.trim().to_string()).collect(),
                enabled: true,
                notify_desktop: true,
                notify_sound: false,
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
            };
            rules.push(rule);
        }
    }
    
    rules
}
