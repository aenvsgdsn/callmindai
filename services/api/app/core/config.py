from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CallMind AI Backend"
    API_V1_STR: str = "/api/v1"
    JWT_SECRET_KEY: str = "super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"

    # Supabase — all data goes through supabase-py
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""  # backend uses this to bypass RLS

    # Email / SMTP
    SMTP_ENABLED: bool = False
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "CallMind AI"

    class Config:
        env_file = ".env"

settings = Settings()
