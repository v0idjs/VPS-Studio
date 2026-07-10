use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SSHKey {
    pub id: String,
    pub name: String,
    pub key_type: String,
    pub public_key: String,
    pub fingerprint: String,
    pub created_at: String,
    pub comment: String,
}

pub fn parse_ssh_keygen_list(output: &str) -> Vec<SSHKey> {
    let mut keys = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || !line.starts_with("ssh-") {
            continue;
        }
        
        let parts: Vec<&str> = line.splitn(3, ' ').collect();
        if parts.len() >= 2 {
            let key_type = parts[0].to_string();
            let public_key = parts[1].to_string();
            let comment = if parts.len() > 2 { parts[2].to_string() } else { String::new() };
            
            let key = SSHKey {
                id: uuid::Uuid::new_v4().to_string(),
                name: comment.clone(),
                key_type,
                public_key,
                fingerprint: String::new(),
                created_at: chrono::Utc::now().to_rfc3339(),
                comment,
            };
            keys.push(key);
        }
    }
    
    keys
}
