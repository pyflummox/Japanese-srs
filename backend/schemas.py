from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

# Base vocabulary schemas
class VocabularyBase(BaseModel):
    word: str
    kana: str
    english: str
    jlpt_level: str
    part_of_speech: str
    example: str

class VocabularyCreate(VocabularyBase):
    deck_id: Optional[int] = None

class VocabularyResponse(VocabularyBase):
    id: int
    
    class Config:
        from_attributes = True

# Word detail schema
class WordDetailResponse(VocabularyResponse):
    srs_stage: Optional[str] = None
    last_review_date: Optional[str] = None

# Dashboard schemas
class DashboardResponse(BaseModel):
    level: int
    words_learned: int
    daily_streak: int
    accuracy_jp_to_en: float
    accuracy_en_to_jp: float
    stage_counts: Dict[str, int]
    reviews_due: int
    lessons_available: int
    next_review_time: Optional[str] = None

# Lessons schemas
class LessonsResponse(BaseModel):
    lessons: List[VocabularyResponse]
    total_available: int

class CompleteLessonsRequest(BaseModel):
    vocabulary_ids: List[int]

# Review schemas
class ReviewItem(BaseModel):
    id: int
    word: str
    kana: str
    english: str
    srs_stage: str
    question_type: str  # "jp_to_en" or "en_to_jp"

class SubmitReviewRequest(BaseModel):
    vocabulary_id: int
    correct: bool
    question_type: str

# Quiz schemas
class QuizQuestion(BaseModel):
    vocabulary_id: int
    question: str
    answer: str
    question_type: str
    kana_hint: str

class StartQuizRequest(BaseModel):
    vocabulary_ids: List[int]

class CheckAnswerRequest(BaseModel):
    vocabulary_id: int
    user_answer: str
    question_type: str

class CheckAnswerResponse(BaseModel):
    correct: bool
    correct_answer: str

# Deck schemas
class DeckBase(BaseModel):
    name: str
    description: str = ""

class DeckCreate(DeckBase):
    pass

class DeckResponse(DeckBase):
    id: int
    vocabulary: List[VocabularyResponse] = []
    
    class Config:
        from_attributes = True

# Settings schemas
class SettingsResponse(BaseModel):
    max_lessons_per_day: int
    theme: str
    level: int
    total_words_learned: int

# User progress schemas
class UserProgressBase(BaseModel):
    vocabulary_id: int
    srs_stage: str
    correct_count: int
    next_review_date: datetime

class UserProgressResponse(UserProgressBase):
    id: int
    last_review_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True