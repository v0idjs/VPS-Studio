use serde::{Deserialize, Serialize};
use crate::ssh::packages::PackageInfo;
use super::execute_on_server;
use super::validation::{validate_package_name, validate_service_name};

#[derive(Debug, Serialize, Deserialize)]
pub struct PackageActionInput {
    pub server_id: String,
    pub package_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListPackagesInput {
    pub server_id: String,
    pub filter: Option<String>,
}

#[tauri::command]
pub async fn list_packages(input: ListPackagesInput) -> Result<Vec<PackageInfo>, String> {
    let cmd = match &input.filter {
        Some(filter) if !filter.is_empty() => {
            validate_service_name(filter)?;
            format!("dpkg -l | grep -i '{}' || true", filter)
        }
        _ => "dpkg -l | grep '^ii'".to_string(),
    };
    
    let output = execute_on_server(&input.server_id, &cmd).await?;
    let packages = crate::ssh::packages::parse_apt_installed(&output);
    Ok(packages)
}

#[tauri::command]
pub async fn search_packages(input: ListPackagesInput) -> Result<Vec<PackageInfo>, String> {
    let query = input.filter.unwrap_or_default();
    validate_service_name(&query)?;
    let cmd = format!("apt-cache search '{}' | head -50", query);
    let output = execute_on_server(&input.server_id, &cmd).await?;
    let packages = crate::ssh::packages::parse_apt_list(&output);
    Ok(packages)
}

#[tauri::command]
pub async fn install_package(input: PackageActionInput) -> Result<(), String> {
    validate_package_name(&input.package_name)?;
    let cmd = format!("sudo apt-get install -y '{}'", input.package_name);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn remove_package(input: PackageActionInput) -> Result<(), String> {
    validate_package_name(&input.package_name)?;
    let cmd = format!("sudo apt-get remove -y '{}'", input.package_name);
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn update_packages(input: PackageActionInput) -> Result<(), String> {
    let cmd = "sudo apt-get update && sudo apt-get upgrade -y".to_string();
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}
