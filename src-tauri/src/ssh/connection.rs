use ssh2::Session;
use std::io::Read;
use std::net::TcpStream;
use std::path::PathBuf;

pub struct SshConnection {
    pub(crate) session: Session,
}

fn known_hosts_path() -> PathBuf {
    let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("vps-studio");
    std::fs::create_dir_all(&path).ok();
    path.push("known_hosts");
    path
}

impl SshConnection {
    pub fn new(host: &str, port: u16) -> Result<Self, Box<dyn std::error::Error>> {
        let tcp = TcpStream::connect(format!("{}:{}", host, port))?;
        let mut session = Session::new()?;
        session.set_tcp_stream(tcp);
        session.handshake()?;

        let kh_path = known_hosts_path();
        let mut known_hosts = session.known_hosts();
        if kh_path.exists() {
            known_hosts.read_file(&kh_path).ok();
        }

        Ok(Self { session })
    }

    pub fn authenticate_password(
        &mut self,
        username: &str,
        password: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.session.userauth_password(username, password)?;
        Ok(())
    }

    pub fn authenticate_key(
        &mut self,
        username: &str,
        key_path: &str,
        passphrase: Option<&str>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.session
            .userauth_pubkey_file(username, None, std::path::Path::new(key_path), passphrase)?;
        Ok(())
    }

    pub fn execute_command(&self, command: &str) -> Result<String, Box<dyn std::error::Error>> {
        let mut channel = self.session.channel_session()?;
        channel.exec(command)?;
        let mut output = String::new();
        channel.read_to_string(&mut output)?;
        channel.wait_close()?;
        Ok(output)
    }

    pub fn is_authenticated(&self) -> bool {
        self.session.authenticated()
    }
}
