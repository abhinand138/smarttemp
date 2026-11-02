import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from the backend folder
backend_dir = Path(__file__).resolve().parent.parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)

class Config:
    """Base application configuration."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "smarttemp-dev-secret-key")
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    PORT = int(os.environ.get("PORT", 5000))
    HOST = os.environ.get("HOST", "0.0.0.0")

    # PostgreSQL Database settings
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "postgres")
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME", "smarttemp_db")
    
    # Use psycopg (v3) dialect for SQLAlchemy
    raw_db_url = os.environ.get("DATABASE_URL")
    if raw_db_url:
        if raw_db_url.startswith("postgres://"):
            raw_db_url = raw_db_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+psycopg://"):
            raw_db_url = raw_db_url.replace("postgresql://", "postgresql+psycopg://", 1)
        SQLALCHEMY_DATABASE_URI = raw_db_url
    else:
        SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,  # Automatically reconnect if connection dropped
        "pool_recycle": 300,
    }

    # CORS configuration
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if origin.strip()
    ]

    # Alert Threshold Defaults (Configurable Examples)
    ALERT_TEMP_HIGH = float(os.environ.get("ALERT_TEMP_HIGH", 35.0))
    ALERT_TEMP_LOW = float(os.environ.get("ALERT_TEMP_LOW", 15.0))
    ALERT_HUMIDITY_HIGH = float(os.environ.get("ALERT_HUMIDITY_HIGH", 80.0))
    ALERT_HUMIDITY_LOW = float(os.environ.get("ALERT_HUMIDITY_LOW", 30.0))
