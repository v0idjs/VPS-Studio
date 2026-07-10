use crate::db::queries::dashboard as dashboard_queries;
use crate::db::queries::dashboard::{RecentActivity, ServerStats};
use crate::db::DbState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardData {
    pub servers: Vec<ServerStats>,
    pub recent_activity: Vec<RecentActivity>,
    pub total_servers: i64,
    pub online_servers: i64,
    pub offline_servers: i64,
}

#[tauri::command]
pub fn get_server_stats(
    state: State<'_, DbState>,
    server_id: String,
) -> Result<ServerStats, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let stats = dashboard_queries::get_server_stats(&conn, &server_id)
        .map_err(|e| e.to_string())?;
    Ok(stats)
}

#[tauri::command]
pub fn get_recent_activity(
    state: State<'_, DbState>,
    limit: Option<i64>,
) -> Result<Vec<RecentActivity>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(50);
    let activities = dashboard_queries::get_recent_activity(&conn, limit)
        .map_err(|e| e.to_string())?;
    Ok(activities)
}

#[tauri::command]
pub fn get_server_activity(
    state: State<'_, DbState>,
    server_id: String,
    limit: Option<i64>,
) -> Result<Vec<RecentActivity>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(50);
    let activities = dashboard_queries::get_server_activity(&conn, &server_id, limit)
        .map_err(|e| e.to_string())?;
    Ok(activities)
}

#[tauri::command]
pub fn get_dashboard_data(state: State<'_, DbState>) -> Result<DashboardData, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let servers = dashboard_queries::get_all_server_stats(&conn)
        .map_err(|e| e.to_string())?;

    let recent_activity = dashboard_queries::get_recent_activity(&conn, 20)
        .map_err(|e| e.to_string())?;

    let total_servers: i64 = conn
        .query_row("SELECT COUNT(*) FROM servers", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let online_servers: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM servers WHERE status = 'online'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let offline_servers = total_servers - online_servers;

    Ok(DashboardData {
        servers,
        recent_activity,
        total_servers,
        online_servers,
        offline_servers,
    })
}

#[tauri::command]
pub fn insert_activity_event(
    state: State<'_, DbState>,
    server_id: String,
    activity_type: String,
    message: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    dashboard_queries::insert_activity_event(&conn, &server_id, &activity_type, &message)
        .map_err(|e| e.to_string())?;
    Ok(())
}
