use regex::Regex;

lazy_static::lazy_static! {
    static ref RE_SERVICE_NAME: Regex = Regex::new(r"^[a-zA-Z0-9._@-]+$").unwrap();
    static ref RE_CONTAINER_ID: Regex = Regex::new(r"^[a-zA-Z0-9]{12,64}$").unwrap();
    static ref RE_IMAGE_NAME: Regex = Regex::new(r"^[a-zA-Z0-9._:/-]+$").unwrap();
    static ref RE_KEY_TYPE: Regex = Regex::new(r"^(rsa|ed25519|ecdsa|dsa)$").unwrap();
    static ref RE_KEY_NAME: Regex = Regex::new(r"^[a-zA-Z0-9._-]+$").unwrap();
    static ref RE_PROTOCOL: Regex = Regex::new(r"^(tcp|udp)$").unwrap();
    static ref RE_PORT: Regex = Regex::new(r"^[0-9]{1,5}$").unwrap();
    static ref RE_IP: Regex = Regex::new(r"^([0-9]{1,3}\.){3}[0-9]{1,3}(/[0-9]{1,2})?$").unwrap();
    static ref RE_SIGNAL: Regex = Regex::new(r"^(SIGHUP|SIGINT|SIGQUIT|SIGKILL|SIGTERM|SIGUSR1|SIGUSR2|SIGSTOP|SIGCONT|[1-9]|1[0-5])$").unwrap();
    static ref RE_LOG_SOURCE: Regex = Regex::new(r"^[a-zA-Z0-9._-]+$").unwrap();
    static ref RE_HOSTNAME: Regex = Regex::new(r"^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}$|^([0-9]{1,3}\.){3}[0-9]{1,3}$").unwrap();
    static ref RE_PACKAGE_NAME: Regex = Regex::new(r"^[a-zA-Z0-9][a-zA-Z0-9._+\-]*$").unwrap();
    static ref RE_CRON_SCHEDULE: Regex = Regex::new(r"^[\w@ \-*/,\./]+$").unwrap();
    static ref RE_CRON_COMMAND: Regex = Regex::new(r"^[\w@ \-./=]+$").unwrap();
    static ref RE_SETTINGS_KEY: Regex = Regex::new(r"^[a-zA-Z0-9._-]+$").unwrap();
    static ref RE_LOG_LEVEL: Regex = Regex::new(r"^(emerg|alert|crit|err|warning|notice|info|debug)$").unwrap();
}

pub fn validate_service_name(name: &str) -> Result<(), String> {
    if RE_SERVICE_NAME.is_match(name) {
        Ok(())
    } else {
        Err(format!("Invalid service name: {}", name))
    }
}

pub fn validate_container_id(id: &str) -> Result<(), String> {
    if RE_CONTAINER_ID.is_match(id) {
        Ok(())
    } else {
        Err(format!("Invalid container ID: {}", id))
    }
}

pub fn validate_image_name(name: &str) -> Result<(), String> {
    if RE_IMAGE_NAME.is_match(name) {
        Ok(())
    } else {
        Err(format!("Invalid image name: {}", name))
    }
}

pub fn validate_key_type(key_type: &str) -> Result<(), String> {
    if RE_KEY_TYPE.is_match(key_type) {
        Ok(())
    } else {
        Err(format!("Invalid key type: {}. Must be rsa, ed25519, ecdsa, or dsa", key_type))
    }
}

pub fn validate_key_name(name: &str) -> Result<(), String> {
    if RE_KEY_NAME.is_match(name) {
        Ok(())
    } else {
        Err(format!("Invalid key name: {}", name))
    }
}

pub fn validate_protocol(protocol: &str) -> Result<(), String> {
    if RE_PROTOCOL.is_match(protocol) {
        Ok(())
    } else {
        Err(format!("Invalid protocol: {}. Must be tcp or udp", protocol))
    }
}

pub fn validate_port(port: &str) -> Result<(), String> {
    if RE_PORT.is_match(port) {
        Ok(())
    } else {
        Err(format!("Invalid port: {}", port))
    }
}

pub fn validate_ip(ip: &str) -> Result<(), String> {
    if ip == "any" || ip == "anywhere" || RE_IP.is_match(ip) {
        Ok(())
    } else {
        Err(format!("Invalid IP address: {}", ip))
    }
}

pub fn validate_signal(signal: &str) -> Result<(), String> {
    if RE_SIGNAL.is_match(signal) {
        Ok(())
    } else {
        Err(format!("Invalid signal: {}", signal))
    }
}

pub fn validate_log_source(source: &str) -> Result<(), String> {
    if RE_LOG_SOURCE.is_match(source) {
        Ok(())
    } else {
        Err(format!("Invalid log source: {}", source))
    }
}

pub fn validate_hostname(host: &str) -> Result<(), String> {
    if RE_HOSTNAME.is_match(host) {
        Ok(())
    } else {
        Err(format!("Invalid hostname: {}", host))
    }
}

pub fn sanitize_filename(name: &str) -> Result<String, String> {
    let sanitized = name.to_lowercase().replace(' ', "_");
    if sanitized.contains('/') || sanitized.contains('\\') || sanitized.contains("..") {
        return Err(format!("Invalid filename: {} contains path traversal", name));
    }
    if sanitized.is_empty() {
        return Err("Filename cannot be empty".to_string());
    }
    Ok(sanitized)
}

pub fn validate_package_name(name: &str) -> Result<(), String> {
    if RE_PACKAGE_NAME.is_match(name) {
        Ok(())
    } else {
        Err(format!("Invalid package name: {}", name))
    }
}

pub fn validate_cron_schedule(schedule: &str) -> Result<(), String> {
    if RE_CRON_SCHEDULE.is_match(schedule) {
        Ok(())
    } else {
        Err(format!("Invalid cron schedule: {}", schedule))
    }
}

pub fn validate_cron_command(command: &str) -> Result<(), String> {
    if RE_CRON_COMMAND.is_match(command) && !command.contains(';') && !command.contains('|') && !command.contains('`') && !command.contains('$') {
        Ok(())
    } else {
        Err(format!("Invalid cron command: {}", command))
    }
}

pub fn validate_settings_key(key: &str) -> Result<(), String> {
    if RE_SETTINGS_KEY.is_match(key) {
        Ok(())
    } else {
        Err(format!("Invalid settings key: {}", key))
    }
}

pub fn validate_log_level(level: &str) -> Result<(), String> {
    if RE_LOG_LEVEL.is_match(level) {
        Ok(())
    } else {
        Err(format!("Invalid log level: {}", level))
    }
}
