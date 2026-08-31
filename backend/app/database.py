import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def _load_env_file():
    """Load a .env file from the project root (parent of backend/) if present.

    Values already set in the real environment take precedence, so this is safe
    to call unconditionally (e.g. when running inside Docker where env vars are
    provided directly, or locally where they come from the .env file).
    """
    try:
        env_path = Path(__file__).resolve().parents[2] / ".env"
        if not env_path.exists():
            return
        with env_path.open() as fh:
            for raw in fh:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key, value = key.strip(), value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception:
        # Never block app startup if the .env file can't be read.
        pass


_load_env_file()

POSTGRES_USER = os.getenv("POSTGRES_USER", "aegis")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "aegis_password")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "aegis_db")

# DATABASE_URL can override the assembled connection string entirely if needed.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@"
    f"{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
