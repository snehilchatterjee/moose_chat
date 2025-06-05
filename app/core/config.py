from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    POSTGRES: str
    SECRET_KEY: str
    ALGORITHM: str
    POSTGRES_SYNC: str

    model_config = SettingsConfigDict(
        env_file = ".env",
        extra = "ignore"
    )
    
settings = Settings() # type: ignore