use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use rand::RngCore;

pub fn encrypt(plaintext: &[u8], key: &[u8; 32]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let cipher = Aes256Gcm::new_from_slice(key)?;
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, plaintext).map_err(|e| e.to_string())?;
    let mut result = nonce_bytes.to_vec();
    result.extend(ciphertext);
    Ok(result)
}

pub fn decrypt(ciphertext: &[u8], key: &[u8; 32]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let cipher = Aes256Gcm::new_from_slice(key)?;
    let (nonce_bytes, encrypted) = ciphertext.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher.decrypt(nonce, encrypted).map_err(|e| e.to_string())?;
    Ok(plaintext)
}
