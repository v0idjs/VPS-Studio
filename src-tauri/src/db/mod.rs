pub mod crypto;
pub mod keychain;
pub mod migrations;
pub mod queries;

use rusqlite::Connection;
use std::sync::Mutex;
use tauri::AppHandle;
use tauri::Manager;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

pub fn initialize(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&app_dir)?;

    let db_path = app_dir.join("vps-studio.db");
    let conn = Connection::open(&db_path)?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&db_path, std::fs::Permissions::from_mode(0o600));
    }

    conn.execute_batch("PRAGMA journal_mode=WAL;")?;
    conn.execute_batch("PRAGMA foreign_keys=ON;")?;

    migrations::run_migrations(&conn)?;

    let state = DbState {
        conn: Mutex::new(conn),
    };
    app.manage(state);

    Ok(())
}
