from app.db.supabase_client import sb
import bcrypt

hash_val = bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode()
sb().table('users').update({'password_hash': hash_val}).neq('id', '0').execute()
print("Hashes updated successfully")
