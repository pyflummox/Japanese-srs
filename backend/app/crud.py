from sqlalchemy.orm import Session
from . import models, schemas
import time
import csv

# Summary stats
def get_summary(db: Session):
    now = int(time.time())
    total_words = db.query(models.Word).count()
    lessons_available = db.query(models.SRSItem).filter(models.SRSItem.level == 0).count()
    reviews_due = db.query(models.SRSItem).filter(models.SRSItem.next_review <= now).count()
    learned = db.query(models.SRSItem).filter(models.SRSItem.level > 0).count()
    level = learned // 30 + 1
    return {
        "total_words": total_words,
        "lessons_available": lessons_available,
        "reviews_due": reviews_due,
        "current_level": level,
    }


SRS_STEPS = [4*3600, 8*3600, 24*3600, 72*3600, 168*3600]
STAGE_NAMES = ["Child", "Student", "Scholar", "Enlightened", "Burned"]

# Words

def get_words(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Word).offset(skip).limit(limit).all()

def search_words(db: Session, query: str):
    q = f"%{query}%"
    return db.query(models.Word).filter(models.Word.japanese.like(q) | models.Word.english.like(q)).all()

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
        item.next_review = int(time.time()) + SRS_STEPS[item.level-1]
    else:
        if item.level > 0:
            item.level -= 1
        item.next_review = int(time.time()) + 60
    db.commit()
    stage = STAGE_NAMES[item.level-1] if item.level > 0 else STAGE_NAMES[0]
    return schemas.ReviewResult(word_id=review.word_id, level=item.level, next_review=item.next_review, stage=stage)

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

def import_csv(db: Session, name: str, file_path: str, jlpt: str|None = None):
    with open(file_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        words = []
        for row in reader:
            words.append(schemas.WordCreate(
                japanese=row['Japanese'],
                english=row['English'],
                example=row.get('Example'),
                pos=row.get('POS'),
                jlpt=jlpt or row.get('Level'),
            ))
    return import_deck(db, schemas.DeckImport(name=name, words=words))

def load_jlpt_data(db: Session):
    import os
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    for level_file in ['jlpt_n5.csv', 'jlpt_n4.csv']:
        path = os.path.join(data_dir, level_file)
        deck_name = level_file.split('.')[0]
        if os.path.exists(path):
            import_csv(db, deck_name, path)
