use keyring::Entry;

const SERVICE_NAME: &str = "vps-studio";
const KEY_NAME: &str = "encryption-key";

pub fn get_or_create_key() -> Result<[u8; 32], Box<dyn std::error::Error>> {
    let entry = Entry::new(SERVICE_NAME, KEY_NAME)?;

    match entry.get_password() {
        Ok(key_hex) => {
            let key_bytes = hex::decode(&key_hex)?;
            let mut key = [0u8; 32];
            key.copy_from_slice(&key_bytes);
            Ok(key)
        }
        Err(_) => {
            let mut key = [0u8; 32];
            rand::RngCore::fill_bytes(&mut rand::rngs::OsRng, &mut key);
            let key_hex = hex::encode(key);
            entry.set_password(&key_hex)?;
            Ok(key)
        }
    }
}
