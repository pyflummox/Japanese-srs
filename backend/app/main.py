from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from . import models, schemas, crud, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Japanese SRS")

@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    crud.load_jlpt_data(db)
    db.close()

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

@app.get("/api/v1/search", response_model=list[schemas.Word])
def search_words(q: str, db: Session = Depends(get_db)):
    return crud.search_words(db, q)

@app.get("/api/v1/dictionary", response_model=list[schemas.Word])
def dictionary(db: Session = Depends(get_db)):
    return crud.get_words(db)


@app.get("/api/v1/lessons", response_model=list[schemas.Word])
def get_lessons(limit: int = 15, db: Session = Depends(get_db)):
    return crud.get_lessons(db, limit=limit)


@app.get("/api/v1/reviews", response_model=list[schemas.Word])
def get_reviews(db: Session = Depends(get_db)):
    return crud.get_reviews(db)


@app.get("/api/v1/summary", response_model=schemas.Summary)
def get_summary(db: Session = Depends(get_db)):
    return crud.get_summary(db)

@app.post("/api/v1/review", response_model=schemas.ReviewResult)
def review_word(review: schemas.ReviewRequest, db: Session = Depends(get_db)):
    return crud.process_review(db, review)

@app.post("/api/v1/decks/import")
def import_deck(deck: schemas.DeckImport, db: Session = Depends(get_db)):
    return crud.import_deck(db, deck)

@app.post("/api/v1/import")
def import_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    path = f"/tmp/{file.filename}"
    with open(path, "wb") as f:
        f.write(file.file.read())
    return crud.import_csv(db, file.filename, path)
