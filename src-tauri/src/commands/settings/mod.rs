use serde::{Deserialize, Serialize};

pub mod commands;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub default_ssh_port: u16,
    pub polling_interval: u32,
    pub theme: String,
    pub language: String,
    pub show_tooltips: bool,
    pub compact_mode: bool,
    pub auto_connect: bool,
    pub max_terminal_lines: u32,
    pub font_size: u32,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            default_ssh_port: 22,
            polling_interval: 30,
            theme: "dark".to_string(),
            language: "en".to_string(),
            show_tooltips: true,
            compact_mode: false,
            auto_connect: false,
            max_terminal_lines: 1000,
            font_size: 14,
        }
    }
}

pub fn parse_settings(output: &str) -> AppSettings {
    let mut settings = AppSettings::default();
    
    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        
        if let Some((key, value)) = line.split_once('=') {
            match key.trim() {
                "default_ssh_port" => settings.default_ssh_port = value.trim().parse().unwrap_or(22),
                "polling_interval" => settings.polling_interval = value.trim().parse().unwrap_or(30),
                "theme" => settings.theme = value.trim().to_string(),
                "language" => settings.language = value.trim().to_string(),
                "show_tooltips" => settings.show_tooltips = value.trim() == "true",
                "compact_mode" => settings.compact_mode = value.trim() == "true",
                "auto_connect" => settings.auto_connect = value.trim() == "true",
                "max_terminal_lines" => settings.max_terminal_lines = value.trim().parse().unwrap_or(1000),
                "font_size" => settings.font_size = value.trim().parse().unwrap_or(14),
                _ => {}
            }
        }
    }
    
    settings
}
