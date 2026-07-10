use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Command {
    pub id: String,
    pub name: String,
    pub command: String,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
    pub usage_count: u32,
    pub last_used: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandCategory {
    pub id: String,
    pub name: String,
    pub description: String,
    pub command_count: u32,
}

pub fn parse_command_list(output: &str) -> Vec<Command> {
    let mut commands = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        
        let parts: Vec<&str> = line.splitn(2, '|').collect();
        if parts.len() >= 2 {
            let command = Command {
                id: uuid::Uuid::new_v4().to_string(),
                name: parts[0].trim().to_string(),
                command: parts[1].trim().to_string(),
                description: String::new(),
                category: "general".to_string(),
                tags: vec![],
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
                usage_count: 0,
                last_used: None,
            };
            commands.push(command);
        }
    }
    
    commands
}
