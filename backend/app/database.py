import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


POSTGRES_DB = os.getenv("POSTGRES_DB", "educenter")
POSTGRES_USER = os.getenv("POSTGRES_USER", "educenter_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "educenter_password")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()