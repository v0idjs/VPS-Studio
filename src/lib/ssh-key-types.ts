export interface SSHKey {
  id: string;
  name: string;
  key_type: string;
  public_key: string;
  fingerprint: string;
  created_at: string;
  comment: string;
}
