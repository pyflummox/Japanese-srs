"""
Database initialization script
Run this if you encounter database issues
"""
import os
from database import engine
from models import Base

def init_database():
    """Initialize the database with all tables"""
    print("Initializing database...")
    
    # Remove existing database file if it exists
    db_file = "japanese_srs.db"
    if os.path.exists(db_file):
        print(f"Removing existing database file: {db_file}")
        os.remove(db_file)
    
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialization complete!")

if __name__ == "__main__":
    init_database()