use serde::{Deserialize, Serialize};
use crate::ssh::workspaces::Workspace;
use super::execute_on_server;
use super::validation::sanitize_filename;

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkspaceInput {
    pub server_id: String,
    pub workspace_id: Option<String>,
    pub workspace_name: Option<String>,
    pub description: Option<String>,
    pub server_ids: Option<Vec<String>>,
    pub color: Option<String>,
}

#[tauri::command]
pub async fn list_workspaces(input: WorkspaceInput) -> Result<Vec<Workspace>, String> {
    let output = execute_on_server(&input.server_id, "cat ~/.vps-studio/workspaces/*.workspace 2>/dev/null || true").await?;
    let workspaces = crate::ssh::workspaces::parse_workspace_list(&output);
    Ok(workspaces)
}

#[tauri::command]
pub async fn save_workspace(input: WorkspaceInput) -> Result<Workspace, String> {
    let workspace_name = input.workspace_name.ok_or("Workspace name required")?;
    let description = input.description.unwrap_or_default();
    let server_ids = input.server_ids.unwrap_or_default();
    let color = input.color.unwrap_or_else(|| "#3b82f6".to_string());
    
    let safe_name = sanitize_filename(&workspace_name)?;
    
    // Validate color format
    if !color.starts_with('#') || color.len() != 7 || !color[1..].chars().all(|c| c.is_ascii_hexdigit()) {
        return Err("Invalid color format".to_string());
    }
    
    let cmd = format!(
        "mkdir -p ~/.vps-studio/workspaces && printf '%s\\n' '{}|{}|{}|{}' > ~/.vps-studio/workspaces/{}.workspace",
        workspace_name.replace('\'', "'\\''"),
        description.replace('\'', "'\\''"),
        server_ids.join(","),
        color,
        safe_name
    );
    execute_on_server(&input.server_id, &cmd).await?;
    
    let workspace = Workspace {
        id: uuid::Uuid::new_v4().to_string(),
        name: workspace_name,
        description,
        server_ids,
        color,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(workspace)
}

#[tauri::command]
pub async fn delete_workspace(input: WorkspaceInput) -> Result<(), String> {
    let workspace_name = input.workspace_name.ok_or("Workspace name required")?;
    let safe_name = sanitize_filename(&workspace_name)?;
    let cmd = format!("rm -f ~/.vps-studio/workspaces/{}.workspace", safe_name);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn assign_server_to_workspace(input: WorkspaceInput) -> Result<(), String> {
    let workspace_name = input.workspace_name.ok_or("Workspace name required")?;
    let server_ids = input.server_ids.ok_or("Server IDs required")?;
    
    let safe_name = sanitize_filename(&workspace_name)?;
    let workspace_file = format!("~/.vps-studio/workspaces/{}.workspace", safe_name);
    let cmd = format!(
        "printf '%s\\n' '{}|{}|{}|{}' > {}",
        workspace_name.replace('\'', "'\\''"),
        "",
        server_ids.join(","),
        "#3b82f6",
        workspace_file
    );
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}
