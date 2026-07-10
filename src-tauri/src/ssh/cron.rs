use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CronJob {
    pub id: String,
    pub schedule: String,
    pub command: String,
    pub enabled: bool,
}

pub fn parse_crontab(output: &str) -> Vec<CronJob> {
    let mut jobs = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        
        let parts: Vec<&str> = line.splitn(5, ' ').collect();
        if parts.len() >= 5 {
            let enabled = !parts[0].starts_with("@disabled");
            let schedule = format!("{} {} {} {} {}", parts[0], parts[1], parts[2], parts[3], parts[4]);
            let command = if parts.len() > 5 { parts[5..].join(" ") } else { String::new() };
            
            let job = CronJob {
                id: uuid::Uuid::new_v4().to_string(),
                schedule,
                command,
                enabled,
            };
            jobs.push(job);
        }
    }
    
    jobs
}
