use serde::{Deserialize, Serialize};
use crate::ssh::keys::SSHKey;
use super::execute_on_server;
use super::validation::{validate_key_type, validate_key_name};

#[derive(Debug, Serialize, Deserialize)]
pub struct SSHKeyInput {
    pub server_id: String,
    pub key_name: Option<String>,
    pub key_type: Option<String>,
    pub key_bits: Option<u32>,
    pub key_path: Option<String>,
    pub public_key: Option<String>,
}

#[tauri::command]
pub async fn list_ssh_keys(input: SSHKeyInput) -> Result<Vec<SSHKey>, String> {
    let output = execute_on_server(
        &input.server_id,
        "for f in ~/.ssh/*.pub; do [ -f \"$f\" ] && echo \"$(basename \"$f\")|$(head -1 \"$f\")\"; done 2>/dev/null || true"
    ).await?;
    let mut keys = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || !line.contains('|') {
            continue;
        }
        let parts: Vec<&str> = line.splitn(2, '|').collect();
        let name = parts[0].to_string();
        let key_line = parts[1];
        
        let key_parts: Vec<&str> = key_line.splitn(3, ' ').collect();
        if key_parts.len() >= 2 {
            let key = SSHKey {
                id: uuid::Uuid::new_v4().to_string(),
                name,
                key_type: key_parts[0].to_string(),
                public_key: key_parts[1].to_string(),
                fingerprint: String::new(),
                created_at: chrono::Utc::now().to_rfc3339(),
                comment: if key_parts.len() > 2 { key_parts[2].to_string() } else { String::new() },
            };
            keys.push(key);
        }
    }
    
    Ok(keys)
}

#[tauri::command]
pub async fn generate_ssh_key(input: SSHKeyInput) -> Result<SSHKey, String> {
    let key_name = input.key_name.unwrap_or_else(|| "id_rsa".to_string());
    let key_type = input.key_type.unwrap_or_else(|| "rsa".to_string());
    let key_bits = input.key_bits.unwrap_or(4096);
    
    validate_key_type(&key_type)?;
    validate_key_name(&key_name)?;
    
    let key_path = format!("~/.ssh/{}", key_name);
    
    let cmd = format!(
        "ssh-keygen -t {} -b {} -f {} -N \"\" -C \"{}\"",
        key_type, key_bits, key_path, key_name
    );
    execute_on_server(&input.server_id, &cmd).await?;
    
    let pub_output = execute_on_server(&input.server_id, &format!("cat {}.pub", key_path)).await?;
    let key_lines: Vec<&str> = pub_output.lines().collect();
    if key_lines.is_empty() {
        return Err("Failed to read generated key".to_string());
    }
    
    let key_parts: Vec<&str> = key_lines[0].splitn(3, ' ').collect();
    let key = SSHKey {
        id: uuid::Uuid::new_v4().to_string(),
        name: key_name,
        key_type: key_parts[0].to_string(),
        public_key: key_parts[1].to_string(),
        fingerprint: String::new(),
        created_at: chrono::Utc::now().to_rfc3339(),
        comment: if key_parts.len() > 2 { key_parts[2].to_string() } else { String::new() },
    };
    
    Ok(key)
}

#[tauri::command]
pub async fn import_ssh_key(input: SSHKeyInput) -> Result<SSHKey, String> {
    let key_name = input.key_name.unwrap_or_else(|| "id_rsa".to_string());
    let public_key = input.public_key.ok_or("Public key required")?;
    
    validate_key_name(&key_name)?;
    
    // Validate public key format: must start with a known key type
    if !public_key.starts_with("ssh-") && !public_key.starts_with("ecdsa-") {
        return Err("Invalid public key format".to_string());
    }
    
    let key_path = format!("~/.ssh/{}.pub", key_name);
    
    let cmd = format!("printf '%s\\n' '{}' > {}", public_key.replace('\'', "'\\''"), key_path);
    execute_on_server(&input.server_id, &cmd).await?;
    
    let key = SSHKey {
        id: uuid::Uuid::new_v4().to_string(),
        name: key_name,
        key_type: "imported".to_string(),
        public_key,
        fingerprint: String::new(),
        created_at: chrono::Utc::now().to_rfc3339(),
        comment: String::new(),
    };
    
    Ok(key)
}

#[tauri::command]
pub async fn export_ssh_key(input: SSHKeyInput) -> Result<String, String> {
    let key_name = input.key_name.ok_or("Key name required")?;
    validate_key_name(&key_name)?;
    let key_path = format!("~/.ssh/{}.pub", key_name);
    
    let output = execute_on_server(&input.server_id, &format!("cat {}", key_path)).await?;
    Ok(output)
}

#[tauri::command]
pub async fn delete_ssh_key(input: SSHKeyInput) -> Result<(), String> {
    let key_name = input.key_name.ok_or("Key name required")?;
    validate_key_name(&key_name)?;
    let key_path = format!("~/.ssh/{}", key_name);
    
    let cmd = format!("rm -f {} {}.pub", key_path, key_path);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}
