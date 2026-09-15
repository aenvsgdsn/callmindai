"""
Supabase client singleton.
The backend uses the SERVICE_ROLE key to bypass Row Level Security,
so all queries return data for the authenticated agency only (enforced in route logic).
"""
from supabase import create_client, Client
from app.core.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    """Return (and lazily create) the singleton Supabase client."""
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
            )
        _client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client


def sb() -> Client:
    """Shorthand alias."""
    return get_supabase()
