from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24
    RESEND_API_KEY: str = ""
    APP_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
