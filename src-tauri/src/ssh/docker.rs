use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DockerContainer {
    pub id: String,
    pub image: String,
    pub command: String,
    pub created: String,
    pub status: String,
    pub ports: String,
    pub names: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DockerImage {
    pub id: String,
    pub repository: String,
    pub tag: String,
    pub created: String,
    pub size: String,
}

pub fn parse_docker_ps(output: &str) -> Vec<DockerContainer> {
    let mut containers = Vec::new();
    
    for line in output.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 7 {
            let container = DockerContainer {
                id: parts[0].to_string(),
                image: parts[1].to_string(),
                command: parts[2].to_string(),
                created: parts[3..5].join(" "),
                status: parts[5].to_string(),
                ports: parts[6].to_string(),
                names: parts[7..].join(" "),
            };
            containers.push(container);
        }
    }
    
    containers
}

pub fn parse_docker_images(output: &str) -> Vec<DockerImage> {
    let mut images = Vec::new();
    
    for line in output.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 7 {
            let image = DockerImage {
                id: parts[2].to_string(),
                repository: parts[0].to_string(),
                tag: parts[1].to_string(),
                created: parts[3..5].join(" "),
                size: parts[6].to_string(),
            };
            images.push(image);
        }
    }
    
    images
}
