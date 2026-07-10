use serde::{Deserialize, Serialize};
use crate::notifications::rules::NotificationRule;
use crate::commands::execute_on_server;
use crate::commands::validation::sanitize_filename;

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationInput {
    pub server_id: String,
    pub rule_id: Option<String>,
    pub rule_name: Option<String>,
    pub event_type: Option<String>,
    pub condition: Option<String>,
    pub server_ids: Option<Vec<String>>,
    pub enabled: Option<bool>,
}

#[tauri::command]
pub async fn list_notification_rules(input: NotificationInput) -> Result<Vec<NotificationRule>, String> {
    let output = execute_on_server(&input.server_id, "cat ~/.vps-studio/notifications/*.rule 2>/dev/null || true").await?;
    let rules = crate::notifications::rules::parse_notification_rules(&output);
    Ok(rules)
}

#[tauri::command]
pub async fn save_notification_rule(input: NotificationInput) -> Result<NotificationRule, String> {
    let rule_name = input.rule_name.ok_or("Rule name required")?;
    let event_type = input.event_type.ok_or("Event type required")?;
    let condition = input.condition.unwrap_or_default();
    let server_ids = input.server_ids.unwrap_or_default();
    
    let safe_name = sanitize_filename(&rule_name)?;
    
    // Validate event_type and condition
    if !event_type.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-') {
        return Err("Invalid event type".to_string());
    }
    if condition.contains(';') || condition.contains('|') || condition.contains('`') || condition.contains('$') {
        return Err("Invalid condition".to_string());
    }
    
    let cmd = format!(
        "mkdir -p ~/.vps-studio/notifications && printf '%s\\n' '{}|{}|{}|{}' > ~/.vps-studio/notifications/{}.rule",
        rule_name.replace('\'', "'\\''"),
        event_type,
        condition.replace('\'', "'\\''"),
        server_ids.join(","),
        safe_name
    );
    execute_on_server(&input.server_id, &cmd).await?;
    
    let rule = NotificationRule {
        id: uuid::Uuid::new_v4().to_string(),
        name: rule_name,
        event_type,
        condition,
        server_ids,
        enabled: input.enabled.unwrap_or(true),
        notify_desktop: true,
        notify_sound: false,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(rule)
}

#[tauri::command]
pub async fn delete_notification_rule(input: NotificationInput) -> Result<(), String> {
    let rule_name = input.rule_name.ok_or("Rule name required")?;
    let safe_name = sanitize_filename(&rule_name)?;
    let cmd = format!("rm -f ~/.vps-studio/notifications/{}.rule", safe_name);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn trigger_notification(_input: NotificationInput) -> Result<(), String> {
    // In a real implementation, this would trigger a desktop notification
    Ok(())
}
