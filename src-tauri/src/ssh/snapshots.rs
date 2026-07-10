use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub server_id: String,
    pub hostname: String,
    pub kernel: String,
    pub uptime: String,
    pub packages: Vec<PackageSnapshot>,
    pub services: Vec<ServiceSnapshot>,
    pub network: Vec<NetworkSnapshot>,
    pub disk: Vec<DiskSnapshot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageSnapshot {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceSnapshot {
    pub name: String,
    pub status: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkSnapshot {
    pub interface: String,
    pub ip: String,
    pub mac: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskSnapshot {
    pub device: String,
    pub mount: String,
    pub size: String,
    pub used: String,
    pub available: String,
}

pub fn parse_packages(output: &str) -> Vec<PackageSnapshot> {
    let mut packages = Vec::new();
    for line in output.lines() {
        let parts: Vec<&str> = line.splitn(2, ' ').collect();
        if parts.len() == 2 {
            packages.push(PackageSnapshot {
                name: parts[0].to_string(),
                version: parts[1].to_string(),
            });
        }
    }
    packages
}

pub fn parse_services(output: &str) -> Vec<ServiceSnapshot> {
    let mut services = Vec::new();
    for line in output.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 4 {
            services.push(ServiceSnapshot {
                name: parts[0].to_string(),
                status: parts[2].to_string(),
                enabled: parts[1] == "enabled",
            });
        }
    }
    services
}

pub fn parse_network(output: &str) -> Vec<NetworkSnapshot> {
    let mut interfaces = Vec::new();
    let mut current_iface = String::new();
    
    for line in output.lines() {
        if !line.starts_with(' ') && !line.starts_with('\t') {
            let parts: Vec<&str> = line.splitn(2, ':').collect();
            if !parts.is_empty() {
                current_iface = parts[0].trim().to_string();
            }
        } else if line.contains("inet ") {
            let parts: Vec<&str> = line.trim().split_whitespace().collect();
            if let Some(ip_pos) = parts.iter().position(|&x| x == "inet") {
                let ip = parts.get(ip_pos + 1).unwrap_or(&"").split('/').next().unwrap_or("").to_string();
                interfaces.push(NetworkSnapshot {
                    interface: current_iface.clone(),
                    ip,
                    mac: String::new(),
                });
            }
        }
    }
    interfaces
}

pub fn parse_disk(output: &str) -> Vec<DiskSnapshot> {
    let mut disks = Vec::new();
    for line in output.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 6 {
            disks.push(DiskSnapshot {
                device: parts[0].to_string(),
                size: parts[1].to_string(),
                used: parts[2].to_string(),
                available: parts[3].to_string(),
                mount: parts[5].to_string(),
            });
        }
    }
    disks
}
