use super::connection::SshConnection;
use serde::{Deserialize, Serialize};
use ssh2::Sftp;
use std::io::Read;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub permissions: String,
    pub modified: String,
}

pub struct SftpClient {
    sftp: Sftp,
}

impl SftpClient {
    pub fn new(conn: &SshConnection) -> Result<Self, Box<dyn std::error::Error>> {
        let sftp = conn.session.sftp()?;
        Ok(Self { sftp })
    }

    pub fn list_directory(&self, path: &str) -> Result<Vec<FileInfo>, Box<dyn std::error::Error>> {
        let entries = self.sftp.readdir(std::path::Path::new(path))?;
        let mut files: Vec<FileInfo> = Vec::new();

        for entry in entries {
            let (dir_path, metadata) = entry;
            let name = dir_path.to_string_lossy().to_string();
            let is_dir = metadata.is_dir();
            let size = metadata.size.unwrap_or(0);
            let permissions = format!("{:o}", metadata.perm.unwrap_or(0));
            let modified = metadata.mtime
                .and_then(|t| chrono::DateTime::from_timestamp(t as i64, 0))
                .map(|dt| dt.to_rfc3339())
                .unwrap_or_default();

            files.push(FileInfo {
                name,
                path: format!("{}/{}", path.trim_end_matches('/'), dir_path.to_string_lossy()),
                is_dir,
                size,
                permissions,
                modified,
            });
        }

        files.sort_by(|a, b| b.is_dir.cmp(&a.is_dir).then(a.name.cmp(&b.name)));
        Ok(files)
    }

    pub fn read_file(&self, path: &str) -> Result<String, Box<dyn std::error::Error>> {
        let mut file = self.sftp.open(std::path::Path::new(path))?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
        Ok(contents)
    }

    pub fn write_file(&self, path: &str, contents: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut file = self.sftp.create(std::path::Path::new(path))?;
        std::io::Write::write_all(&mut file, contents.as_bytes())?;
        Ok(())
    }

    pub fn download_file(&self, remote_path: &str, local_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut remote_file = self.sftp.open(std::path::Path::new(remote_path))?;
        let mut local_file = std::fs::File::create(local_path)?;
        std::io::copy(&mut remote_file, &mut local_file)?;
        Ok(())
    }

    pub fn upload_file(&self, local_path: &str, remote_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut local_file = std::fs::File::open(local_path)?;
        let mut remote_file = self.sftp.create(std::path::Path::new(remote_path))?;
        std::io::copy(&mut local_file, &mut remote_file)?;
        Ok(())
    }

    pub fn delete_file(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.sftp.unlink(std::path::Path::new(path))?;
        Ok(())
    }

    pub fn delete_directory(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.sftp.rmdir(std::path::Path::new(path))?;
        Ok(())
    }

    pub fn rename(&self, old_path: &str, new_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.sftp.rename(
            std::path::Path::new(old_path),
            std::path::Path::new(new_path),
            None,
        )?;
        Ok(())
    }

    pub fn create_directory(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.sftp.mkdir(std::path::Path::new(path), 0o755)?;
        Ok(())
    }

    pub fn get_file_info(&self, path: &str) -> Result<FileInfo, Box<dyn std::error::Error>> {
        let metadata = self.sftp.stat(std::path::Path::new(path))?;
        let name = std::path::Path::new(path)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        let is_dir = metadata.is_dir();
        let size = metadata.size.unwrap_or(0);
        let permissions = format!("{:o}", metadata.perm.unwrap_or(0));
        let modified = metadata.mtime
            .and_then(|t| chrono::DateTime::from_timestamp(t as i64, 0))
            .map(|dt| dt.to_rfc3339())
            .unwrap_or_default();

        Ok(FileInfo {
            name,
            path: path.to_string(),
            is_dir,
            size,
            permissions,
            modified,
        })
    }
}
