from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
import json
from datetime import datetime, timedelta

from database import SessionLocal, engine
from models import Vocabulary, UserProgress, Deck, UserStats, Base
from schemas import *
from crud import *
from srs import SRSManager

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Japanese SRS API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

srs_manager = SRSManager()

@app.on_event("startup")
async def startup_event():
    """Initialize database with JLPT vocabulary on startup"""
    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if vocabulary already exists
        try:
            existing_vocab = db.query(Vocabulary).first()
        except Exception as e:
            print(f"Database initialization error: {e}")
            # Force create tables again
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            existing_vocab = None
            
        if not existing_vocab:
            await load_jlpt_vocabulary(db)
            
        # Initialize user stats if not exists
        try:
            stats = db.query(UserStats).first()
        except Exception:
            stats = None
            
        if not stats:
            new_stats = UserStats(
                level=1,
                total_words_learned=0,
                daily_streak=0,
                accuracy_jp_to_en=0.0,
                accuracy_en_to_jp=0.0,
                last_activity_date=datetime.utcnow()
            )
            db.add(new_stats)
            db.commit()
    except Exception as e:
        print(f"Startup error: {e}")
        db.rollback()
    finally:
        db.close()

async def load_jlpt_vocabulary(db: Session):
    """Load JLPT N5 and N4 vocabulary from JSON files"""
    
    # JLPT N5 vocabulary data
    n5_vocab = [
        {"word": "あう", "kana": "あう", "english": "to meet", "jlpt_level": "N5", "part_of_speech": "verb", "example": "友達に会います。"},
        {"word": "青い", "kana": "あおい", "english": "blue", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "空が青いです。"},
        {"word": "赤い", "kana": "あかい", "english": "red", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "赤い花があります。"},
        {"word": "秋", "kana": "あき", "english": "autumn", "jlpt_level": "N5", "part_of_speech": "noun", "example": "秋は涼しいです。"},
        {"word": "開く", "kana": "あく", "english": "to open", "jlpt_level": "N5", "part_of_speech": "verb", "example": "ドアが開きます。"},
        {"word": "朝", "kana": "あさ", "english": "morning", "jlpt_level": "N5", "part_of_speech": "noun", "example": "朝ご飯を食べます。"},
        {"word": "あさって", "kana": "あさって", "english": "day after tomorrow", "jlpt_level": "N5", "part_of_speech": "noun", "example": "あさって会いましょう。"},
        {"word": "足", "kana": "あし", "english": "foot, leg", "jlpt_level": "N5", "part_of_speech": "noun", "example": "足が痛いです。"},
        {"word": "明日", "kana": "あした", "english": "tomorrow", "jlpt_level": "N5", "part_of_speech": "noun", "example": "明日は雨です。"},
        {"word": "あそこ", "kana": "あそこ", "english": "over there", "jlpt_level": "N5", "part_of_speech": "pronoun", "example": "あそこに学校があります。"},
        {"word": "遊ぶ", "kana": "あそぶ", "english": "to play", "jlpt_level": "N5", "part_of_speech": "verb", "example": "公園で遊びます。"},
        {"word": "暖かい", "kana": "あたたかい", "english": "warm", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "今日は暖かいです。"},
        {"word": "頭", "kana": "あたま", "english": "head", "jlpt_level": "N5", "part_of_speech": "noun", "example": "頭が痛いです。"},
        {"word": "新しい", "kana": "あたらしい", "english": "new", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "新しい車を買いました。"},
        {"word": "あちら", "kana": "あちら", "english": "over there (polite)", "jlpt_level": "N5", "part_of_speech": "pronoun", "example": "あちらは図書館です。"},
        {"word": "暑い", "kana": "あつい", "english": "hot", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "夏は暑いです。"},
        {"word": "厚い", "kana": "あつい", "english": "thick", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "厚い本です。"},
        {"word": "あっち", "kana": "あっち", "english": "over there", "jlpt_level": "N5", "part_of_speech": "pronoun", "example": "あっちに行きます。"},
        {"word": "後", "kana": "あと", "english": "after", "jlpt_level": "N5", "part_of_speech": "noun", "example": "後で電話します。"},
        {"word": "あなた", "kana": "あなた", "english": "you", "jlpt_level": "N5", "part_of_speech": "pronoun", "example": "あなたは学生ですか。"},
        {"word": "兄", "kana": "あに", "english": "older brother", "jlpt_level": "N5", "part_of_speech": "noun", "example": "兄は会社員です。"},
        {"word": "姉", "kana": "あね", "english": "older sister", "jlpt_level": "N5", "part_of_speech": "noun", "example": "姉は先生です。"},
        {"word": "あの", "kana": "あの", "english": "that (over there)", "jlpt_level": "N5", "part_of_speech": "determiner", "example": "あの人は誰ですか。"},
        {"word": "アパート", "kana": "アパート", "english": "apartment", "jlpt_level": "N5", "part_of_speech": "noun", "example": "新しいアパートに住んでいます。"},
        {"word": "危ない", "kana": "あぶない", "english": "dangerous", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "ここは危ないです。"},
        {"word": "甘い", "kana": "あまい", "english": "sweet", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "このケーキは甘いです。"},
        {"word": "雨", "kana": "あめ", "english": "rain", "jlpt_level": "N5", "part_of_speech": "noun", "example": "雨が降っています。"},
        {"word": "飴", "kana": "あめ", "english": "candy", "jlpt_level": "N5", "part_of_speech": "noun", "example": "子供が飴を食べています。"},
        {"word": "洗う", "kana": "あらう", "english": "to wash", "jlpt_level": "N5", "part_of_speech": "verb", "example": "手を洗います。"},
        {"word": "ある", "kana": "ある", "english": "to exist", "jlpt_level": "N5", "part_of_speech": "verb", "example": "机の上に本があります。"},
        # Adding more N5 vocabulary for a robust dataset
        {"word": "歩く", "kana": "あるく", "english": "to walk", "jlpt_level": "N5", "part_of_speech": "verb", "example": "毎日歩きます。"},
        {"word": "いい", "kana": "いい", "english": "good", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "いい天気ですね。"},
        {"word": "言う", "kana": "いう", "english": "to say", "jlpt_level": "N5", "part_of_speech": "verb", "example": "何と言いましたか。"},
        {"word": "家", "kana": "いえ", "english": "house", "jlpt_level": "N5", "part_of_speech": "noun", "example": "大きい家に住んでいます。"},
        {"word": "行く", "kana": "いく", "english": "to go", "jlpt_level": "N5", "part_of_speech": "verb", "example": "学校に行きます。"},
        {"word": "いくつ", "kana": "いくつ", "english": "how many", "jlpt_level": "N5", "part_of_speech": "interrogative", "example": "りんごはいくつありますか。"},
        {"word": "いくら", "kana": "いくら", "english": "how much", "jlpt_level": "N5", "part_of_speech": "interrogative", "example": "これはいくらですか。"},
        {"word": "池", "kana": "いけ", "english": "pond", "jlpt_level": "N5", "part_of_speech": "noun", "example": "公園に池があります。"},
        {"word": "医者", "kana": "いしゃ", "english": "doctor", "jlpt_level": "N5", "part_of_speech": "noun", "example": "医者に行きます。"},
        {"word": "椅子", "kana": "いす", "english": "chair", "jlpt_level": "N5", "part_of_speech": "noun", "example": "椅子に座ります。"},
        {"word": "忙しい", "kana": "いそがしい", "english": "busy", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "今日は忙しいです。"},
        {"word": "痛い", "kana": "いたい", "english": "painful", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "頭が痛いです。"},
        {"word": "一", "kana": "いち", "english": "one", "jlpt_level": "N5", "part_of_speech": "number", "example": "一つください。"},
        {"word": "一番", "kana": "いちばん", "english": "most, best", "jlpt_level": "N5", "part_of_speech": "adverb", "example": "これが一番好きです。"},
        {"word": "五日", "kana": "いつか", "english": "fifth day", "jlpt_level": "N5", "part_of_speech": "noun", "example": "五日に会いましょう。"},
        {"word": "いつも", "kana": "いつも", "english": "always", "jlpt_level": "N5", "part_of_speech": "adverb", "example": "いつも元気です。"},
        {"word": "犬", "kana": "いぬ", "english": "dog", "jlpt_level": "N5", "part_of_speech": "noun", "example": "犬を飼っています。"},
        {"word": "今", "kana": "いま", "english": "now", "jlpt_level": "N5", "part_of_speech": "noun", "example": "今、何時ですか。"},
        {"word": "意味", "kana": "いみ", "english": "meaning", "jlpt_level": "N5", "part_of_speech": "noun", "example": "この言葉の意味は何ですか。"},
        {"word": "妹", "kana": "いもうと", "english": "younger sister", "jlpt_level": "N5", "part_of_speech": "noun", "example": "妹は高校生です。"},
        {"word": "嫌", "kana": "いや", "english": "unpleasant", "jlpt_level": "N5", "part_of_speech": "adjective", "example": "嫌な天気ですね。"},
        {"word": "入口", "kana": "いりぐち", "english": "entrance", "jlpt_level": "N5", "part_of_speech": "noun", "example": "入口はあちらです。"},
        {"word": "色", "kana": "いろ", "english": "color", "jlpt_level": "N5", "part_of_speech": "noun", "example": "好きな色は何ですか。"},
        {"word": "いろいろ", "kana": "いろいろ", "english": "various", "jlpt_level": "N5", "part_of_speech": "adverb", "example": "いろいろな本があります。"}
    ]
    
    # JLPT N4 vocabulary data (sample)
    n4_vocab = [
        {"word": "合う", "kana": "あう", "english": "to fit, to suit", "jlpt_level": "N4", "part_of_speech": "verb", "example": "この服は私に合います。"},
        {"word": "愛", "kana": "あい", "english": "love", "jlpt_level": "N4", "part_of_speech": "noun", "example": "愛は大切です。"},
        {"word": "間", "kana": "あいだ", "english": "between, during", "jlpt_level": "N4", "part_of_speech": "noun", "example": "授業の間に休憩があります。"},
        {"word": "相手", "kana": "あいて", "english": "partner, opponent", "jlpt_level": "N4", "part_of_speech": "noun", "example": "テニスの相手を探しています。"},
        {"word": "挨拶", "kana": "あいさつ", "english": "greeting", "jlpt_level": "N4", "part_of_speech": "noun", "example": "朝の挨拶をします。"},
        {"word": "上がる", "kana": "あがる", "english": "to rise, to go up", "jlpt_level": "N4", "part_of_speech": "verb", "example": "気温が上がります。"},
        {"word": "諦める", "kana": "あきらめる", "english": "to give up", "jlpt_level": "N4", "part_of_speech": "verb", "example": "簡単に諦めません。"},
        {"word": "憧れ", "kana": "あこがれ", "english": "longing, admiration", "jlpt_level": "N4", "part_of_speech": "noun", "example": "彼への憧れがあります。"},
        {"word": "集まる", "kana": "あつまる", "english": "to gather", "jlpt_level": "N4", "part_of_speech": "verb", "example": "友達が集まります。"},
        {"word": "扱う", "kana": "あつかう", "english": "to handle, to treat", "jlpt_level": "N4", "part_of_speech": "verb", "example": "機械を扱います。"},
        {"word": "案内", "kana": "あんない", "english": "guidance, guide", "jlpt_level": "N4", "part_of_speech": "noun", "example": "駅で案内をもらいました。"},
        {"word": "安心", "kana": "あんしん", "english": "relief, peace of mind", "jlpt_level": "N4", "part_of_speech": "noun", "example": "母の声を聞いて安心しました。"},
        {"word": "以外", "kana": "いがい", "english": "except, other than", "jlpt_level": "N4", "part_of_speech": "noun", "example": "日曜日以外は忙しいです。"},
        {"word": "意見", "kana": "いけん", "english": "opinion", "jlpt_level": "N4", "part_of_speech": "noun", "example": "あなたの意見を聞かせてください。"},
        {"word": "以上", "kana": "いじょう", "english": "more than, above", "jlpt_level": "N4", "part_of_speech": "noun", "example": "十人以上来ました。"},
        {"word": "以下", "kana": "いか", "english": "below, under", "jlpt_level": "N4", "part_of_speech": "noun", "example": "五歳以下は無料です。"},
        {"word": "一生懸命", "kana": "いっしょうけんめい", "english": "with all one's might", "jlpt_level": "N4", "part_of_speech": "adverb", "example": "一生懸命勉強します。"},
        {"word": "印象", "kana": "いんしょう", "english": "impression", "jlpt_level": "N4", "part_of_speech": "noun", "example": "良い印象を受けました。"},
        {"word": "運動", "kana": "うんどう", "english": "exercise, movement", "jlpt_level": "N4", "part_of_speech": "noun", "example": "毎日運動しています。"},
        {"word": "営業", "kana": "えいぎょう", "english": "business, sales", "jlpt_level": "N4", "part_of_speech": "noun", "example": "営業の仕事をしています。"},
        {"word": "影響", "kana": "えいきょう", "english": "influence", "jlpt_level": "N4", "part_of_speech": "noun", "example": "天気は気分に影響します。"},
        {"word": "笑顔", "kana": "えがお", "english": "smile", "jlpt_level": "N4", "part_of_speech": "noun", "example": "いつも笑顔でいます。"},
        {"word": "お客", "kana": "おきゃく", "english": "customer, guest", "jlpt_level": "N4", "part_of_speech": "noun", "example": "お客さんが来ました。"},
        {"word": "億", "kana": "おく", "english": "hundred million", "jlpt_level": "N4", "part_of_speech": "number", "example": "一億円の宝くじ。"},
        {"word": "奥さん", "kana": "おくさん", "english": "wife (polite)", "jlpt_level": "N4", "part_of_speech": "noun", "example": "田中さんの奥さんです。"},
        {"word": "怒る", "kana": "おこる", "english": "to get angry", "jlpt_level": "N4", "part_of_speech": "verb", "example": "父が怒りました。"},
        {"word": "お祭り", "kana": "おまつり", "english": "festival", "jlpt_level": "N4", "part_of_speech": "noun", "example": "夏にお祭りがあります。"},
        {"word": "重い", "kana": "おもい", "english": "heavy", "jlpt_level": "N4", "part_of_speech": "adjective", "example": "この荷物は重いです。"},
        {"word": "思う", "kana": "おもう", "english": "to think", "jlpt_level": "N4", "part_of_speech": "verb", "example": "そう思います。"},
        {"word": "表", "kana": "おもて", "english": "surface, front", "jlpt_level": "N4", "part_of_speech": "noun", "example": "紙の表に書きます。"}
    ]
    
    # Add all vocabulary to database
    for vocab_data in n5_vocab + n4_vocab:
        vocab = Vocabulary(**vocab_data)
        db.add(vocab)
    
    db.commit()

# Dashboard endpoints
@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    stats = get_user_stats(db)
    
    # Count words in each SRS stage
    stage_counts = {}
    for stage in ["Child", "Student", "Scholar", "Enlightened", "Burned"]:
        count = db.query(UserProgress).filter(UserProgress.srs_stage == stage).count()
        stage_counts[stage.lower()] = count
    
    # Count reviews due now
    now = datetime.utcnow()
    reviews_due = db.query(UserProgress).filter(
        UserProgress.next_review_date <= now,
        UserProgress.srs_stage != "Burned"
    ).count()
    
    # Count available lessons (unlearned vocab)
    learned_vocab_ids = db.query(UserProgress.vocabulary_id).all()
    learned_ids = [item[0] for item in learned_vocab_ids]
    
    total_vocab = db.query(Vocabulary).count()
    available_lessons = total_vocab - len(learned_ids)
    
    return DashboardResponse(
        level=stats.level,
        words_learned=stats.total_words_learned,
        daily_streak=stats.daily_streak,
        accuracy_jp_to_en=stats.accuracy_jp_to_en,
        accuracy_en_to_jp=stats.accuracy_en_to_jp,
        stage_counts=stage_counts,
        reviews_due=reviews_due,
        lessons_available=min(available_lessons, 15),  # Max 15 per day
        next_review_time=get_next_review_time(db)
    )

def get_next_review_time(db: Session) -> Optional[str]:
    next_review = db.query(UserProgress).filter(
        UserProgress.srs_stage != "Burned"
    ).order_by(UserProgress.next_review_date).first()
    
    if next_review:
        return next_review.next_review_date.isoformat()
    return None

# Lessons endpoints
@app.get("/api/lessons", response_model=LessonsResponse)
def get_lessons(source: str = "N5", limit: int = 15, db: Session = Depends(get_db)):
    # Get unlearned vocabulary
    learned_vocab_ids = db.query(UserProgress.vocabulary_id).all()
    learned_ids = [item[0] for item in learned_vocab_ids]
    
    query = db.query(Vocabulary).filter(~Vocabulary.id.in_(learned_ids))
    
    if source in ["N5", "N4"]:
        query = query.filter(Vocabulary.jlpt_level == f"JLPT_{source}")
    elif source != "All":
        # Custom deck
        deck = db.query(Deck).filter(Deck.name == source).first()
        if deck:
            deck_vocab_ids = [v.id for v in deck.vocabulary]
            query = query.filter(Vocabulary.id.in_(deck_vocab_ids))
    
    lessons = query.limit(limit).all()
    
    return LessonsResponse(
        lessons=[VocabularyResponse.from_orm(lesson) for lesson in lessons],
        total_available=query.count()
    )

@app.post("/api/lessons/complete")
def complete_lessons(request: CompleteLessonsRequest, db: Session = Depends(get_db)):
    """Mark lessons as completed and move to SRS stage 1"""
    now = datetime.utcnow()
    next_review = srs_manager.get_next_review_time("Child", now)
    
    for vocab_id in request.vocabulary_ids:
        progress = UserProgress(
            vocabulary_id=vocab_id,
            srs_stage="Child",
            correct_count=0,
            last_review_date=now,
            next_review_date=next_review
        )
        db.add(progress)
    
    # Update user stats
    stats = get_user_stats(db)
    stats.total_words_learned += len(request.vocabulary_ids)
    stats.level = calculate_user_level(stats.total_words_learned)
    stats.last_activity_date = now
    
    db.commit()
    return {"message": "Lessons completed successfully"}

# Reviews endpoints
@app.get("/api/reviews", response_model=List[ReviewItem])
def get_reviews(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    
    # Get due reviews
    progress_items = db.query(UserProgress).filter(
        UserProgress.next_review_date <= now,
        UserProgress.srs_stage != "Burned"
    ).all()
    
    reviews = []
    for progress in progress_items:
        vocab = db.query(Vocabulary).filter(Vocabulary.id == progress.vocabulary_id).first()
        if vocab:
            reviews.append(ReviewItem(
                id=vocab.id,
                word=vocab.word,
                kana=vocab.kana,
                english=vocab.english,
                srs_stage=progress.srs_stage,
                question_type="jp_to_en"  # Will be randomized in frontend
            ))
    
    return reviews

@app.post("/api/reviews/submit")
def submit_review(request: SubmitReviewRequest, db: Session = Depends(get_db)):
    progress = db.query(UserProgress).filter(
        UserProgress.vocabulary_id == request.vocabulary_id
    ).first()
    
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
    
    now = datetime.utcnow()
    
    if request.correct:
        progress.correct_count += 1
        # Advance stage if reached 5 correct answers
        if progress.correct_count >= 5:
            progress.srs_stage = srs_manager.advance_stage(progress.srs_stage)
            progress.correct_count = 0
    else:
        # Demote stage on incorrect answer
        progress.srs_stage = srs_manager.demote_stage(progress.srs_stage)
        progress.correct_count = 0
    
    progress.last_review_date = now
    progress.next_review_date = srs_manager.get_next_review_time(progress.srs_stage, now)
    
    # Update user stats
    stats = get_user_stats(db)
    if request.question_type == "jp_to_en":
        total_jp_en = stats.total_reviews_jp_to_en or 0
        correct_jp_en = stats.correct_reviews_jp_to_en or 0
        stats.total_reviews_jp_to_en = total_jp_en + 1
        if request.correct:
            stats.correct_reviews_jp_to_en = correct_jp_en + 1
        stats.accuracy_jp_to_en = (stats.correct_reviews_jp_to_en / stats.total_reviews_jp_to_en) * 100
    else:
        total_en_jp = stats.total_reviews_en_to_jp or 0
        correct_en_jp = stats.correct_reviews_en_to_jp or 0
        stats.total_reviews_en_to_jp = total_en_jp + 1
        if request.correct:
            stats.correct_reviews_en_to_jp = correct_en_jp + 1
        stats.accuracy_en_to_jp = (stats.correct_reviews_en_to_jp / stats.total_reviews_en_to_jp) * 100
    
    stats.last_activity_date = now
    
    db.commit()
    return {"message": "Review submitted successfully"}

# Dictionary endpoints
@app.get("/api/dictionary", response_model=List[VocabularyResponse])
def search_dictionary(q: str = "", db: Session = Depends(get_db)):
    if not q:
        # Return all vocabulary if no search query
        vocab = db.query(Vocabulary).limit(100).all()
    else:
        # Search in word, kana, and english fields
        vocab = db.query(Vocabulary).filter(
            (Vocabulary.word.contains(q)) |
            (Vocabulary.kana.contains(q)) |
            (Vocabulary.english.contains(q))
        ).limit(100).all()
    
    return [VocabularyResponse.from_orm(v) for v in vocab]

@app.get("/api/dictionary/{vocab_id}", response_model=WordDetailResponse)
def get_word_detail(vocab_id: int, db: Session = Depends(get_db)):
    vocab = db.query(Vocabulary).filter(Vocabulary.id == vocab_id).first()
    if not vocab:
        raise HTTPException(status_code=404, detail="Word not found")
    
    # Get progress if exists
    progress = db.query(UserProgress).filter(
        UserProgress.vocabulary_id == vocab_id
    ).first()
    
    return WordDetailResponse(
        **vocab.__dict__,
        srs_stage=progress.srs_stage if progress else None,
        last_review_date=progress.last_review_date.isoformat() if progress and progress.last_review_date else None
    )

# Deck management endpoints
@app.get("/api/decks", response_model=List[DeckResponse])
def get_decks(db: Session = Depends(get_db)):
    decks = db.query(Deck).all()
    return [DeckResponse.from_orm(deck) for deck in decks]

@app.post("/api/decks/upload")
async def upload_deck(
    file: UploadFile = File(...),
    deck_name: str = "",
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    csv_content = content.decode('utf-8')
    
    # Parse CSV
    csv_reader = csv.DictReader(io.StringIO(csv_content))
    
    # Create deck
    deck = Deck(name=deck_name or file.filename)
    db.add(deck)
    db.flush()  # Get deck ID
    
    vocabulary_items = []
    for row in csv_reader:
        # Expect format: word, meaning
        if 'word' in row and 'meaning' in row:
            word = row['word'].strip()
            meaning = row['meaning'].strip()
            
            vocab = Vocabulary(
                word=word,
                kana=word,  # Use word as kana for custom entries
                english=meaning,
                jlpt_level="Custom",
                part_of_speech="unknown",
                example="",
                deck_id=deck.id
            )
            vocabulary_items.append(vocab)
        elif len(row) >= 2:
            # Fallback: assume first two columns are word, meaning
            cols = list(row.values())
            word = cols[0].strip()
            meaning = cols[1].strip()
            
            vocab = Vocabulary(
                word=word,
                kana=word,
                english=meaning,
                jlpt_level="Custom",
                part_of_speech="unknown",
                example="",
                deck_id=deck.id
            )
            vocabulary_items.append(vocab)
    
    db.add_all(vocabulary_items)
    db.commit()
    
    return {"message": f"Successfully uploaded {len(vocabulary_items)} words to deck '{deck.name}'"}

# Settings endpoints
@app.get("/api/settings", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    stats = get_user_stats(db)
    return SettingsResponse(
        max_lessons_per_day=15,  # Default value
        theme="light",  # Default theme
        level=stats.level,
        total_words_learned=stats.total_words_learned
    )

@app.post("/api/settings/reset")
def reset_all_data(db: Session = Depends(get_db)):
    """Reset all user progress and statistics"""
    # Delete all progress
    db.query(UserProgress).delete()
    
    # Reset user stats
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
    
    db.commit()
    return {"message": "All data reset successfully"}

# Quiz endpoints
@app.post("/api/quiz/start")
def start_quiz(request: StartQuizRequest, db: Session = Depends(get_db)):
    """Start a quiz for the given vocabulary IDs"""
    vocab_items = db.query(Vocabulary).filter(
        Vocabulary.id.in_(request.vocabulary_ids)
    ).all()
    
    quiz_questions = []
    for vocab in vocab_items:
        # Create both JP->EN and EN->JP questions
        quiz_questions.extend([
            QuizQuestion(
                vocabulary_id=vocab.id,
                question=vocab.word,
                answer=vocab.english,
                question_type="jp_to_en",
                kana_hint=vocab.kana
            ),
            QuizQuestion(
                vocabulary_id=vocab.id,
                question=vocab.english,
                answer=vocab.word,
                question_type="en_to_jp",
                kana_hint=vocab.kana
            )
        ])
    
    return {"questions": quiz_questions}

@app.post("/api/quiz/check")
def check_quiz_answer(request: CheckAnswerRequest, db: Session = Depends(get_db)):
    """Check if the quiz answer is correct"""
    vocab = db.query(Vocabulary).filter(Vocabulary.id == request.vocabulary_id).first()
    if not vocab:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    
    is_correct = False
    user_answer = request.user_answer.strip().lower()
    
    if request.question_type == "jp_to_en":
        # Check against English meanings (allow multiple synonyms)
        correct_answers = [ans.strip().lower() for ans in vocab.english.split(',')]
        is_correct = any(user_answer == ans or user_answer in ans for ans in correct_answers)
    else:
        # Check against Japanese word or kana
        correct_answers = [vocab.word.lower(), vocab.kana.lower()]
        is_correct = user_answer in correct_answers
    
    return CheckAnswerResponse(
        correct=is_correct,
        correct_answer=vocab.english if request.question_type == "jp_to_en" else vocab.word
    )

# Helper functions
def get_user_stats(db: Session) -> UserStats:
    stats = db.query(UserStats).first()
    if not stats:
        stats = UserStats(
            level=1,
            total_words_learned=0,
            daily_streak=0,
            accuracy_jp_to_en=0.0,
            accuracy_en_to_jp=0.0,
            last_activity_date=datetime.utcnow()
        )
        db.add(stats)
        db.commit()
    return stats

def calculate_user_level(words_learned: int) -> int:
    """Calculate user level based on words learned"""
    if words_learned < 30:
        return 1
    elif words_learned < 60:
        return 2
    elif words_learned < 100:
        return 3
    elif words_learned < 150:
        return 4
    elif words_learned < 200:
        return 5
    else:
        return 6 + (words_learned - 200) // 50

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)