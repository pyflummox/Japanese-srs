from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# Association table for many-to-many relationship between Deck and Vocabulary
deck_vocabulary = Table(
    'deck_vocabulary',
    Base.metadata,
    Column('deck_id', Integer, ForeignKey('decks.id')),
    Column('vocabulary_id', Integer, ForeignKey('vocabulary.id'))
)

class Vocabulary(Base):
    __tablename__ = "vocabulary"
    
    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, nullable=False, index=True)
    kana = Column(String, nullable=False, index=True)
    english = Column(Text, nullable=False, index=True)
    jlpt_level = Column(String, nullable=False, index=True)
    part_of_speech = Column(String, nullable=False)
    example = Column(Text, default="")
    deck_id = Column(Integer, ForeignKey('decks.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    progress = relationship("UserProgress", back_populates="vocabulary")
    decks = relationship("Deck", secondary=deck_vocabulary, back_populates="vocabulary")

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    vocabulary_id = Column(Integer, ForeignKey('vocabulary.id'), nullable=False)
    srs_stage = Column(String, nullable=False, default="Child")  # Child, Student, Scholar, Enlightened, Burned
    correct_count = Column(Integer, default=0)
    last_review_date = Column(DateTime, nullable=True)
    next_review_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    vocabulary = relationship("Vocabulary", back_populates="progress")

class Deck(Base):
    __tablename__ = "decks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vocabulary = relationship("Vocabulary", secondary=deck_vocabulary, back_populates="decks")

class UserStats(Base):
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, default=1)
    total_words_learned = Column(Integer, default=0)
    daily_streak = Column(Integer, default=0)
    accuracy_jp_to_en = Column(Float, default=0.0)
    accuracy_en_to_jp = Column(Float, default=0.0)
    total_reviews_jp_to_en = Column(Integer, default=0)
    correct_reviews_jp_to_en = Column(Integer, default=0)
    total_reviews_en_to_jp = Column(Integer, default=0)
    correct_reviews_en_to_jp = Column(Integer, default=0)
    last_activity_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)