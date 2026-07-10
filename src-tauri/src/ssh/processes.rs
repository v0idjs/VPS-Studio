use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: i64,
    pub user: String,
    pub cpu: f64,
    pub mem: f64,
    pub vsz: i64,
    pub rss: i64,
    pub stat: String,
    pub start: String,
    pub time: String,
    pub command: String,
}

pub fn parse_ps_output(output: &str) -> Vec<ProcessInfo> {
    let mut processes = Vec::new();
    
    for line in output.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 11 {
            let process = ProcessInfo {
                pid: parts[0].parse().unwrap_or(0),
                user: parts[1].to_string(),
                cpu: parts[2].parse().unwrap_or(0.0),
                mem: parts[3].parse().unwrap_or(0.0),
                vsz: parts[4].parse().unwrap_or(0),
                rss: parts[5].parse().unwrap_or(0),
                stat: parts[7].to_string(),
                start: parts[8].to_string(),
                time: parts[9].to_string(),
                command: parts[10..].join(" "),
            };
            processes.push(process);
        }
    }
    
    processes
}
