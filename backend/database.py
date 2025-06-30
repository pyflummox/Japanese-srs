from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# SQLite database URL
SQLITE_DATABASE_URL = "sqlite:///./japanese_srs.db"

# Create SQLite engine
engine = create_engine(
    SQLITE_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    echo=False  # Set to True for SQL query logging
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)