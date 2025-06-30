from sqlalchemy.orm import Session
from . import models, schemas
import time

# Summary stats
def get_summary(db: Session):
    now = int(time.time())
    total_words = db.query(models.Word).count()
    lessons_available = db.query(models.SRSItem).filter(models.SRSItem.level == 0).count()
    reviews_due = db.query(models.SRSItem).filter(models.SRSItem.next_review <= now).count()
    return {
        "total_words": total_words,
        "lessons_available": lessons_available,
        "reviews_due": reviews_due,
    }


SRS_STEPS = [1, 2, 4, 8, 16]

# Words

def get_words(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Word).offset(skip).limit(limit).all()

# SRS

def process_review(db: Session, review: schemas.ReviewRequest):
    item = db.query(models.SRSItem).filter(models.SRSItem.word_id == review.word_id).first()
    if not item:
        item = models.SRSItem(word_id=review.word_id)
        db.add(item)
        db.commit()
        db.refresh(item)
    if review.correct:
        if item.level < len(SRS_STEPS):
            item.level += 1
        item.next_review = int(time.time()) + SRS_STEPS[item.level-1]*60
    else:
        if item.level > 0:
            item.level -= 1
        item.next_review = int(time.time()) + 60
    db.commit()
    return schemas.ReviewResult(word_id=review.word_id, level=item.level, next_review=item.next_review)

# Deck import placeholder

def import_deck(db: Session, deck: schemas.DeckImport):
    new_deck = models.Deck(name=deck.name)
    db.add(new_deck)
    db.commit()
    db.refresh(new_deck)
    for w in deck.words:
        word = db.query(models.Word).filter(models.Word.japanese == w.japanese).first()
        if not word:
            word = models.Word(japanese=w.japanese, english=w.english, example=w.example, audio=w.audio)
            db.add(word)
            db.commit()
            db.refresh(word)
        # associate with SRS
        if not db.query(models.SRSItem).filter(models.SRSItem.word_id == word.id).first():
            srs = models.SRSItem(word_id=word.id)
            db.add(srs)
    db.commit()
    return {"deck_id": new_deck.id, "words": len(deck.words)}
