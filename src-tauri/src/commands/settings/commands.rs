use serde::{Deserialize, Serialize};
use crate::commands::settings::AppSettings;
use crate::commands::execute_on_server;
use super::super::validation::validate_settings_key;

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingsInput {
    pub server_id: Option<String>,
    pub key: Option<String>,
    pub value: Option<String>,
}

#[tauri::command]
pub async fn load_settings(input: SettingsInput) -> Result<AppSettings, String> {
    let server_id = input.server_id.ok_or("Server ID required")?;
    let output = execute_on_server(&server_id, "cat ~/.vps-studio/settings.conf 2>/dev/null || true").await?;
    let settings = crate::commands::settings::parse_settings(&output);
    Ok(settings)
}

#[tauri::command]
pub async fn save_settings(input: SettingsInput) -> Result<(), String> {
    let server_id = input.server_id.ok_or("Server ID required")?;
    let key = input.key.ok_or("Key required")?;
    let value = input.value.ok_or("Value required")?;
    
    validate_settings_key(&key)?;
    
    // Value: block shell metacharacters
    if value.contains(';') || value.contains('|') || value.contains('`') || value.contains('$') || value.contains('\n') {
        return Err("Invalid settings value".to_string());
    }
    
    let cmd = format!(
        "mkdir -p ~/.vps-studio && (grep -v '^{}=' ~/.vps-studio/settings.conf 2>/dev/null; printf '%s\\n' '{}={}') > ~/.vps-studio/settings.conf",
        key, key, value.replace('\'', "'\\''")
    );
    execute_on_server(&server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn export_data(input: SettingsInput) -> Result<String, String> {
    let server_id = input.server_id.ok_or("Server ID required")?;
    let output = execute_on_server(&server_id, "tar -czf - -C ~ .vps-studio 2>/dev/null | base64").await?;
    Ok(output)
}

#[tauri::command]
pub async fn import_data(input: SettingsInput) -> Result<(), String> {
    let server_id = input.server_id.ok_or("Server ID required")?;
    let data = input.value.ok_or("Data required")?;
    
    if data.is_empty() {
        return Err("Import data cannot be empty".to_string());
    }
    
    // Validate base64: only allow valid base64 characters
    let trimmed = data.trim();
    if !trimmed.chars().all(|c| c.is_ascii_alphanumeric() || c == '+' || c == '/' || c == '=' || c == '\n' || c == '\r') {
        return Err("Invalid import data: not valid base64".to_string());
    }
    
    let cmd = format!("printf '%s' '{}' | base64 -d | tar -xzf - -C ~ 2>/dev/null", trimmed.replace('\'', "'\\''"));
    execute_on_server(&server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn backup_database(input: SettingsInput) -> Result<String, String> {
    let server_id = input.server_id.ok_or("Server ID required")?;
    let output = execute_on_server(&server_id, "sqlite3 ~/.vps-studio/vps-studio.db '.dump' 2>/dev/null || true").await?;
    Ok(output)
}

#[tauri::command]
pub async fn restore_database(input: SettingsInput) -> Result<(), String> {
    let server_id = input.server_id.ok_or("Server ID required")?;
    let data = input.value.ok_or("Database dump required")?;
    
    if data.is_empty() {
        return Err("Database dump cannot be empty".to_string());
    }
    
    // Validate SQL dump: basic safety check
    if data.contains('; DROP') || data.contains('; DELETE') || data.contains('-- ') {
        return Err("Invalid database dump: potentially destructive SQL".to_string());
    }
    
    let cmd = format!("printf '%s' '{}' | sqlite3 ~/.vps-studio/vps-studio.db 2>/dev/null", data.replace('\'', "'\\''"));
    execute_on_server(&server_id, &cmd).await?;
    Ok(())
}
