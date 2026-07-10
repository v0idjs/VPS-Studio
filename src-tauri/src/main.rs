mod commands;
mod db;
mod notifications;
mod ssh;
mod terminal;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            db::initialize(&app_handle)?;
            terminal::setup_terminal_events(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Server commands
            commands::servers::add_server,
            commands::servers::update_server,
            commands::servers::delete_server,
            commands::servers::list_servers,
            commands::servers::search_servers,
            commands::servers::test_server_connection,
            commands::servers::get_server,
            commands::servers::get_server_status,
            // Dashboard commands
            commands::dashboard::get_server_stats,
            commands::dashboard::get_recent_activity,
            commands::dashboard::get_server_activity,
            commands::dashboard::get_dashboard_data,
            commands::dashboard::insert_activity_event,
            // Terminal commands
            commands::terminal::create_terminal_session,
            commands::terminal::close_terminal_session,
            commands::terminal::list_terminal_sessions,
            commands::terminal::send_terminal_input,
            commands::terminal::resize_terminal,
            // File commands
            commands::files::list_directory,
            commands::files::read_file,
            commands::files::write_file,
            commands::files::delete_file,
            commands::files::rename_file,
            commands::files::create_directory,
            commands::files::download_file,
            commands::files::upload_file,
            commands::files::get_file_bookmarks,
            commands::files::add_file_bookmark,
            commands::files::remove_file_bookmark,
            // Process commands
            commands::processes::list_processes,
            commands::processes::kill_process,
            // Service commands
            commands::services::list_services,
            commands::services::service_action,
            commands::services::get_service_logs,
            commands::services::get_service_status,
            // Docker commands
            commands::docker::list_docker_containers,
            commands::docker::list_docker_images,
            commands::docker::docker_container_action,
            commands::docker::docker_stop_container,
            commands::docker::docker_restart_container,
            commands::docker::docker_remove_container,
            commands::docker::docker_pull_image,
            commands::docker::docker_remove_image,
            commands::docker::docker_get_logs,
            // Package commands
            commands::packages::list_packages,
            commands::packages::search_packages,
            commands::packages::install_package,
            commands::packages::remove_package,
            // Cron commands
            commands::cron::list_cron_jobs,
            commands::cron::add_cron_job,
            commands::cron::remove_cron_job,
            // SSH Key commands
            commands::ssh_keys::list_ssh_keys,
            commands::ssh_keys::generate_ssh_key,
            commands::ssh_keys::import_ssh_key,
            commands::ssh_keys::export_ssh_key,
            commands::ssh_keys::delete_ssh_key,
            // Firewall commands
            commands::firewall::list_firewall_rules,
            commands::firewall::add_firewall_rule,
            commands::firewall::delete_firewall_rule,
            commands::firewall::enable_firewall,
            commands::firewall::disable_firewall,
            // Log commands
            commands::logs::read_logs,
            // Snapshot commands
            commands::snapshots::create_snapshot,
            commands::snapshots::compare_snapshots,
            // Command library commands
            commands::command_library::list_commands,
            commands::command_library::save_command,
            commands::command_library::delete_command,
            commands::command_library::execute_command,
            commands::command_library::list_command_categories,
            // Notification commands
            notifications::commands::list_notification_rules,
            notifications::commands::save_notification_rule,
            notifications::commands::delete_notification_rule,
            notifications::commands::trigger_notification,
            // Workspace commands
            commands::workspaces::list_workspaces,
            commands::workspaces::save_workspace,
            commands::workspaces::delete_workspace,
            commands::workspaces::assign_server_to_workspace,
            // Settings commands
            commands::settings::commands::load_settings,
            commands::settings::commands::save_settings,
            commands::settings::commands::export_data,
            commands::settings::commands::import_data,
            commands::settings::commands::backup_database,
            commands::settings::commands::restore_database,
        ])
        .run(tauri::generate_context!())
        .expect("error while running VPS Studio");
}
