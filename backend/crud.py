from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from models import Vocabulary, UserProgress, Deck, UserStats
from schemas import VocabularyCreate, DeckCreate

# Vocabulary CRUD operations
def get_vocabulary(db: Session, vocab_id: int) -> Optional[Vocabulary]:
    return db.query(Vocabulary).filter(Vocabulary.id == vocab_id).first()

def get_vocabulary_by_word(db: Session, word: str) -> Optional[Vocabulary]:
    return db.query(Vocabulary).filter(Vocabulary.word == word).first()

def get_vocabularies(db: Session, skip: int = 0, limit: int = 100) -> List[Vocabulary]:
    return db.query(Vocabulary).offset(skip).limit(limit).all()

def create_vocabulary(db: Session, vocab: VocabularyCreate) -> Vocabulary:
    db_vocab = Vocabulary(**vocab.dict())
    db.add(db_vocab)
    db.commit()
    db.refresh(db_vocab)
    return db_vocab

def search_vocabulary(db: Session, query: str, limit: int = 100) -> List[Vocabulary]:
    return db.query(Vocabulary).filter(
        (Vocabulary.word.contains(query)) |
        (Vocabulary.kana.contains(query)) |
        (Vocabulary.english.contains(query))
    ).limit(limit).all()

# User Progress CRUD operations
def get_user_progress(db: Session, vocab_id: int) -> Optional[UserProgress]:
    return db.query(UserProgress).filter(UserProgress.vocabulary_id == vocab_id).first()

def create_user_progress(db: Session, vocab_id: int, srs_stage: str = "Child") -> UserProgress:
    from datetime import timedelta
    
    # Calculate next review time based on stage
    stage_intervals = {
        "Child": timedelta(hours=4),
        "Student": timedelta(hours=8),
        "Scholar": timedelta(days=1),
        "Enlightened": timedelta(days=3),
        "Burned": timedelta(days=365)
    }
    
    now = datetime.utcnow()
    interval = stage_intervals.get(srs_stage, timedelta(hours=4))
    next_review = now + interval
    
    db_progress = UserProgress(
        vocabulary_id=vocab_id,
        srs_stage=srs_stage,
        correct_count=0,
        last_review_date=now,
        next_review_date=next_review
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

def update_user_progress(db: Session, progress: UserProgress) -> UserProgress:
    progress.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(progress)
    return progress

def get_due_reviews(db: Session) -> List[UserProgress]:
    now = datetime.utcnow()
    return db.query(UserProgress).filter(
        UserProgress.next_review_date <= now,
        UserProgress.srs_stage != "Burned"
    ).all()

def get_progress_by_stage(db: Session, stage: str) -> List[UserProgress]:
    return db.query(UserProgress).filter(UserProgress.srs_stage == stage).all()

# Deck CRUD operations
def get_deck(db: Session, deck_id: int) -> Optional[Deck]:
    return db.query(Deck).filter(Deck.id == deck_id).first()

def get_deck_by_name(db: Session, name: str) -> Optional[Deck]:
    return db.query(Deck).filter(Deck.name == name).first()

def get_decks(db: Session) -> List[Deck]:
    return db.query(Deck).all()

def create_deck(db: Session, deck: DeckCreate) -> Deck:
    db_deck = Deck(**deck.dict())
    db.add(db_deck)
    db.commit()
    db.refresh(db_deck)
    return db_deck

def delete_deck(db: Session, deck_id: int) -> bool:
    deck = get_deck(db, deck_id)
    if deck:
        db.delete(deck)
        db.commit()
        return True
    return False

# User Stats CRUD operations
def get_user_stats(db: Session) -> UserStats:
    stats = db.query(UserStats).first()
    if not stats:
        stats = UserStats()
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats

def update_user_stats(db: Session, stats: UserStats) -> UserStats:
    stats.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(stats)
    return stats

def reset_user_stats(db: Session) -> UserStats:
    stats = get_user_stats(db)
    stats.level = 1
    stats.total_words_learned = 0
    stats.daily_streak = 0
    stats.accuracy_jp_to_en = 0.0
    stats.accuracy_en_to_jp = 0.0
    stats.total_reviews_jp_to_en = 0
    stats.correct_reviews_jp_to_en = 0
    stats.total_reviews_en_to_jp = 0
    stats.correct_reviews_en_to_jp = 0
    stats.last_activity_date = datetime.utcnow()
    return update_user_stats(db, stats)

# Utility functions
def get_unlearned_vocabulary(db: Session, jlpt_level: Optional[str] = None, limit: int = 15) -> List[Vocabulary]:
    """Get vocabulary that hasn't been learned yet"""
    learned_vocab_ids = db.query(UserProgress.vocabulary_id).all()
    learned_ids = [item[0] for item in learned_vocab_ids]
    
    query = db.query(Vocabulary).filter(~Vocabulary.id.in_(learned_ids))
    
    if jlpt_level:
        query = query.filter(Vocabulary.jlpt_level == jlpt_level)
    
    return query.limit(limit).all()

def get_vocabulary_count_by_stage(db: Session) -> dict:
    """Get count of vocabulary in each SRS stage"""
    counts = {}
    stages = ["Child", "Student", "Scholar", "Enlightened", "Burned"]
    
    for stage in stages:
        count = db.query(UserProgress).filter(UserProgress.srs_stage == stage).count()
        counts[stage.lower()] = count
    
    return counts