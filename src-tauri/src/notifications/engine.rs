use crate::db::DbState;
use tauri::State;

pub fn check_notification_rules(
    _state: &State<'_, DbState>,
    _server_id: &str,
    _metric: &str,
    _value: f64,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    // TODO: Implement notification rule checking
    Ok(vec![])
}

pub fn send_notification(
    _title: &str,
    _body: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // TODO: Implement desktop notification sending
    Ok(())
}
