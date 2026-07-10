use serde::{Deserialize, Serialize};
use crate::ssh::snapshots::Snapshot;
use super::execute_on_server;

#[derive(Debug, Serialize, Deserialize)]
pub struct SnapshotInput {
    pub server_id: String,
    pub snapshot_id: Option<String>,
    pub snapshot_name: Option<String>,
}

#[tauri::command]
pub async fn create_snapshot(input: SnapshotInput) -> Result<Snapshot, String> {
    let snapshot_name = input.snapshot_name.unwrap_or_else(|| {
        format!("snapshot-{}", chrono::Utc::now().format("%Y%m%d-%H%M%S"))
    });
    
    // Batch all system info into a single SSH call
    let batch_cmd = r#"echo "===HOSTNAME==="; hostname; echo "===KERNEL==="; uname -r; echo "===UPTIME==="; uptime -p 2>/dev/null || uptime; echo "===PACKAGES==="; dpkg -l 2>/dev/null | awk '/^ii/ {print $2, $3}' || rpm -qa --queryformat '%{NAME} %{VERSION}\n' 2>/dev/null || true; echo "===SERVICES==="; systemctl list-unit-files --type=service --no-pager 2>/dev/null | awk 'NR>1 {print $1, $2, $3}' || true; echo "===NETWORK==="; ip addr show 2>/dev/null || ifconfig 2>/dev/null || true; echo "===DISK==="; df -h 2>/dev/null || true"#;
    
    let output = execute_on_server(&input.server_id, batch_cmd).await?;
    
    let sections: Vec<&str> = output.split("===").collect();
    let mut hostname = String::new();
    let mut kernel = String::new();
    let mut uptime = String::new();
    let mut packages_output = String::new();
    let mut services_output = String::new();
    let mut network_output = String::new();
    let mut disk_output = String::new();
    
    for (i, section) in sections.iter().enumerate() {
        let content = sections.get(i + 1).unwrap_or(&"").trim();
        match *section {
            "HOSTNAME" => hostname = content.to_string(),
            "KERNEL" => kernel = content.to_string(),
            "UPTIME" => uptime = content.to_string(),
            "PACKAGES" => packages_output = content.to_string(),
            "SERVICES" => services_output = content.to_string(),
            "NETWORK" => network_output = content.to_string(),
            "DISK" => disk_output = content.to_string(),
            _ => {}
        }
    }
    
    let packages = crate::ssh::snapshots::parse_packages(&packages_output);
    let services = crate::ssh::snapshots::parse_services(&services_output);
    let network = crate::ssh::snapshots::parse_network(&network_output);
    let disk = crate::ssh::snapshots::parse_disk(&disk_output);
    
    let snapshot = Snapshot {
        id: uuid::Uuid::new_v4().to_string(),
        name: snapshot_name,
        created_at: chrono::Utc::now().to_rfc3339(),
        server_id: input.server_id,
        hostname,
        kernel,
        uptime,
        packages,
        services,
        network,
        disk,
    };
    
    Ok(snapshot)
}

#[tauri::command]
pub async fn compare_snapshots(input: SnapshotInput) -> Result<SnapshotComparison, String> {
    let _snapshot1 = create_snapshot(SnapshotInput {
        server_id: input.server_id.clone(),
        snapshot_id: None,
        snapshot_name: Some("current".to_string()),
    }).await?;
    
    Ok(SnapshotComparison {
        snapshot1_id: "current".to_string(),
        snapshot2_id: input.snapshot_id.unwrap_or_default(),
        packages_diff: vec![],
        services_diff: vec![],
        network_diff: vec![],
        disk_diff: vec![],
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SnapshotComparison {
    pub snapshot1_id: String,
    pub snapshot2_id: String,
    pub packages_diff: Vec<String>,
    pub services_diff: Vec<String>,
    pub network_diff: Vec<String>,
    pub disk_diff: Vec<String>,
}
