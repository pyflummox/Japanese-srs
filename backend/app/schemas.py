from pydantic import BaseModel
from typing import Optional

class WordBase(BaseModel):
    japanese: str
    english: str
    example: Optional[str] = None
    audio: Optional[str] = None

class WordCreate(WordBase):
    pass

class Word(WordBase):
    id: int
    class Config:
        orm_mode = True

class ReviewRequest(BaseModel):
    word_id: int
    correct: bool

class ReviewResult(BaseModel):
    word_id: int
    level: int
    next_review: int

class DeckImport(BaseModel):
    name: str
    words: list[WordCreate]


class Summary(BaseModel):
    total_words: int
    lessons_available: int
    reviews_due: int
