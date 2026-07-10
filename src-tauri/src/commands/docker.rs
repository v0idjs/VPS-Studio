use serde::{Deserialize, Serialize};
use crate::ssh::docker::{DockerContainer, DockerImage};
use super::execute_on_server;
use super::validation::{validate_container_id, validate_image_name};

#[derive(Debug, Serialize, Deserialize)]
pub struct DockerActionInput {
    pub server_id: String,
    pub container_id: Option<String>,
    pub image_name: Option<String>,
}

#[tauri::command]
pub async fn list_docker_containers(input: DockerActionInput) -> Result<Vec<DockerContainer>, String> {
    let output = execute_on_server(&input.server_id, "docker ps -a --format 'table {{.ID}}\\t{{.Image}}\\t{{.Command}}\\t{{.CreatedAt}}\\t{{.Status}}\\t{{.Ports}}\\t{{.Names}}'").await?;
    let containers = crate::ssh::docker::parse_docker_ps(&output);
    Ok(containers)
}

#[tauri::command]
pub async fn list_docker_images(input: DockerActionInput) -> Result<Vec<DockerImage>, String> {
    let output = execute_on_server(&input.server_id, "docker images --format 'table {{.Repository}}\\t{{.Tag}}\\t{{.ID}}\\t{{.CreatedAt}}\\t{{.Size}}'").await?;
    let images = crate::ssh::docker::parse_docker_images(&output);
    Ok(images)
}

async fn docker_action(input: DockerActionInput, action: &str) -> Result<(), String> {
    let container_id = input.container_id.ok_or("Container ID required")?;
    validate_container_id(&container_id)?;
    let cmd = format!("docker {} {}", action, container_id);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn docker_container_action(input: DockerActionInput) -> Result<(), String> {
    docker_action(input, "start").await
}

#[tauri::command]
pub async fn docker_stop_container(input: DockerActionInput) -> Result<(), String> {
    docker_action(input, "stop").await
}

#[tauri::command]
pub async fn docker_restart_container(input: DockerActionInput) -> Result<(), String> {
    docker_action(input, "restart").await
}

#[tauri::command]
pub async fn docker_remove_container(input: DockerActionInput) -> Result<(), String> {
    docker_action(input, "rm -f").await
}

#[tauri::command]
pub async fn docker_pull_image(input: DockerActionInput) -> Result<(), String> {
    let image_name = input.image_name.ok_or("Image name required")?;
    validate_image_name(&image_name)?;
    let cmd = format!("docker pull {}", image_name);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn docker_remove_image(input: DockerActionInput) -> Result<(), String> {
    let image_name = input.image_name.ok_or("Image name required")?;
    validate_image_name(&image_name)?;
    let cmd = format!("docker rmi -f {}", image_name);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn docker_get_logs(input: DockerActionInput, lines: Option<i32>) -> Result<String, String> {
    let container_id = input.container_id.ok_or("Container ID required")?;
    validate_container_id(&container_id)?;
    let tail_lines = lines.unwrap_or(100);
    let cmd = format!("docker logs --tail {} {}", tail_lines, container_id);
    let output = execute_on_server(&input.server_id, &cmd).await?;
    Ok(output)
}
