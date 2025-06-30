from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Japanese SRS")

# Dependency

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/v1/words", response_model=list[schemas.Word])
def read_words(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_words(db, skip=skip, limit=limit)

@app.post("/api/v1/review", response_model=schemas.ReviewResult)
def review_word(review: schemas.ReviewRequest, db: Session = Depends(get_db)):
    return crud.process_review(db, review)

@app.post("/api/v1/decks/import")
def import_deck(deck: schemas.DeckImport, db: Session = Depends(get_db)):
    return crud.import_deck(db, deck)
