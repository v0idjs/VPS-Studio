use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageInfo {
    pub name: String,
    pub version: String,
    pub description: String,
    pub status: String,
}

pub fn parse_apt_list(output: &str) -> Vec<PackageInfo> {
    let mut packages = Vec::new();
    
    for line in output.lines() {
        if let Some(pos) = line.find('/') {
            let name = &line[..pos];
            let rest = &line[pos + 1..];
            let parts: Vec<&str> = rest.split_whitespace().collect();
            if parts.len() >= 2 {
                let package = PackageInfo {
                    name: name.to_string(),
                    version: parts[0].to_string(),
                    description: parts[1..].join(" "),
                    status: "installed".to_string(),
                };
                packages.push(package);
            }
        }
    }
    
    packages
}

pub fn parse_apt_installed(output: &str) -> Vec<PackageInfo> {
    let mut packages = Vec::new();
    
    for line in output.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 {
            let package = PackageInfo {
                name: parts[0].to_string(),
                version: parts[1].to_string(),
                description: parts[2..].join(" "),
                status: "installed".to_string(),
            };
            packages.push(package);
        }
    }
    
    packages
}
