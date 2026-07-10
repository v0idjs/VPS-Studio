use serde::{Deserialize, Serialize};
use crate::ssh::cron::CronJob;
use super::execute_on_server;
use super::validation::{validate_cron_schedule, validate_cron_command};

#[derive(Debug, Serialize, Deserialize)]
pub struct CronJobInput {
    pub server_id: String,
    pub schedule: Option<String>,
    pub command: Option<String>,
    pub job_id: Option<String>,
}

#[tauri::command]
pub async fn list_cron_jobs(input: CronJobInput) -> Result<Vec<CronJob>, String> {
    let output = execute_on_server(&input.server_id, "crontab -l 2>/dev/null || true").await?;
    let jobs = crate::ssh::cron::parse_crontab(&output);
    Ok(jobs)
}

#[tauri::command]
pub async fn add_cron_job(input: CronJobInput) -> Result<(), String> {
    let schedule = input.schedule.ok_or("Schedule required")?;
    let command = input.command.ok_or("Command required")?;
    
    validate_cron_schedule(&schedule)?;
    validate_cron_command(&command)?;
    
    let new_line = format!("{} {}", schedule, command);
    let cmd = format!("(crontab -l 2>/dev/null; printf '%s\\n' '{}') | crontab -", new_line.replace('\'', "'\\''"));
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}

#[tauri::command]
pub async fn remove_cron_job(input: CronJobInput) -> Result<(), String> {
    let job_id = input.job_id.ok_or("Job ID required")?;
    
    // job_id should be a line number or the exact cron line — validate it's safe
    if job_id.contains(';') || job_id.contains('|') || job_id.contains('`') || job_id.contains('$') {
        return Err("Invalid job ID".to_string());
    }
    
    let cmd = format!("crontab -l 2>/dev/null | grep -vF '{}' | crontab -", job_id.replace('\'', "'\\''"));
    execute_on_server(&input.server_id, &cmd).await?;
    Ok(())
}
