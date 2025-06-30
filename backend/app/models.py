from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True, index=True)
    japanese = Column(String, unique=True, index=True, nullable=False)
    english = Column(String, nullable=False)
    example = Column(String, nullable=True)
    audio = Column(String, nullable=True)
    pos = Column(String, nullable=True)
    jlpt = Column(String, nullable=True)
    deck = Column(String, nullable=True)

class SRSItem(Base):
    __tablename__ = "srs_items"
    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"), unique=True)
    level = Column(Integer, default=0)
    next_review = Column(Integer, default=0)
    blocked = Column(Boolean, default=False)
    word = relationship("Word")

class Deck(Base):
    __tablename__ = "decks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
