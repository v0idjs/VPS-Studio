use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub description: String,
    pub server_ids: Vec<String>,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
}

pub fn parse_workspace_list(output: &str) -> Vec<Workspace> {
    let mut workspaces = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        
        let parts: Vec<&str> = line.split('|').collect();
        if parts.len() >= 3 {
            let workspace = Workspace {
                id: uuid::Uuid::new_v4().to_string(),
                name: parts[0].trim().to_string(),
                description: parts[1].trim().to_string(),
                server_ids: parts[2].trim().split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect(),
                color: if parts.len() > 3 { parts[3].trim().to_string() } else { "#3b82f6".to_string() },
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
            };
            workspaces.push(workspace);
        }
    }
    
    workspaces
}
