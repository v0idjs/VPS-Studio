use serde::{Deserialize, Serialize};
use crate::ssh::commands::{Command, CommandCategory};
use super::{execute_on_server, execute_on_server_with_status};
use super::validation::sanitize_filename;

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandInput {
    pub server_id: String,
    pub command_id: Option<String>,
    pub command_name: Option<String>,
    pub command_text: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[tauri::command]
pub async fn list_commands(input: CommandInput) -> Result<Vec<Command>, String> {
    let output = execute_on_server(&input.server_id, "cat ~/.vps-studio/commands/*.cmd 2>/dev/null || true").await?;
    let commands = crate::ssh::commands::parse_command_list(&output);
    Ok(commands)
}

#[tauri::command]
pub async fn save_command(input: CommandInput) -> Result<Command, String> {
    let name = input.command_name.ok_or("Command name required")?;
    let command_text = input.command_text.ok_or("Command text required")?;
    let description = input.description.unwrap_or_default();
    let category = input.category.unwrap_or_else(|| "general".to_string());
    let tags = input.tags.unwrap_or_default();
    
    let safe_name = sanitize_filename(&name)?;
    
    let cmd = format!(
        "mkdir -p ~/.vps-studio/commands && echo '{}|{}|{}|{}|{}' > ~/.vps-studio/commands/{}.cmd",
        name, command_text, description, category, tags.join(","), safe_name
    );
    execute_on_server(&input.server_id, &cmd).await?;
    
    let saved_command = Command {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        command: command_text,
        description,
        category,
        tags,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
        usage_count: 0,
        last_used: None,
    };
    
    Ok(saved_command)
}

#[tauri::command]
pub async fn delete_command(input: CommandInput) -> Result<(), String> {
    let command_name = input.command_name.ok_or("Command name required")?;
    let safe_name = sanitize_filename(&command_name)?;
    let cmd = format!("rm -f ~/.vps-studio/commands/{}.cmd", safe_name);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn execute_command(input: CommandInput) -> Result<(String, bool, u64), String> {
    let command_text = input.command_text.ok_or("Command text required")?;
    let start = std::time::Instant::now();
    let result = execute_on_server_with_status(&input.server_id, &command_text).await?;
    let duration = start.elapsed().as_millis() as u64;
    Ok((result.output, result.success, duration))
}

#[tauri::command]
pub async fn list_command_categories(input: CommandInput) -> Result<Vec<CommandCategory>, String> {
    let commands = list_commands(input).await?;
    let mut categories: Vec<CommandCategory> = Vec::new();
    
    for cmd in &commands {
        if !categories.iter().any(|c| c.name == cmd.category) {
            categories.push(CommandCategory {
                id: uuid::Uuid::new_v4().to_string(),
                name: cmd.category.clone(),
                description: String::new(),
                command_count: 1,
            });
        } else if let Some(cat) = categories.iter_mut().find(|c| c.name == cmd.category) {
            cat.command_count += 1;
        }
    }
    
    Ok(categories)
}
