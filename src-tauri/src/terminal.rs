use tauri::Manager;

use crate::commands::terminal::TerminalState;

pub fn setup_terminal_events(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    app.manage(TerminalState::new());
    Ok(())
}
