# 🌸 KanaFlow - Japanese SRS Web Application

A comprehensive, full-stack spaced repetition system (SRS) for learning Japanese vocabulary. Built with modern technologies and designed for efficient, local learning.

![KanaFlow Preview](https://via.placeholder.com/800x400/4f46e5/ffffff?text=KanaFlow+SRS+Dashboard)

## ✨ Features

### 🧠 Core Learning System
- **Complete JLPT N5 & N4 Vocabulary** - Over 100+ words with authentic examples
- **5-Stage SRS System** - Child → Student → Scholar → Enlightened → Burned
- **Intelligent Scheduling** - Spaced intervals from 4 hours to weeks
- **Bidirectional Learning** - Japanese to English and English to Japanese

### 📚 Learning Features
- **Lesson Batching** - Study 15 new words at a time (customizable)
- **Interactive Quizzes** - 100% completion required to advance
- **Review System** - Only study words that are due
- **Progress Tracking** - Detailed statistics and accuracy metrics

### 🎨 Modern Interface
- **Clean, Colorful Design** - Inspired by modern learning apps
- **Dark/Light Themes** - Comfortable studying in any environment
- **Mobile Responsive** - Perfect on desktop, tablet, and phone
- **Audio Support** - Japanese pronunciation via Web Speech API

### 🗂️ Dictionary & Management
- **Searchable Dictionary** - Find words by kanji, hiragana, or English
- **Word Detail Pages** - Complete information including SRS progress
- **Custom Deck Upload** - Import your own vocabulary via CSV
- **User Levels** - Progression system based on words mastered

### 📊 Analytics & Progress
- **Dashboard Overview** - Daily streak, accuracy, and progress charts
- **SRS Stage Visualization** - See words in each learning stage
- **Performance Metrics** - Track accuracy for both directions
- **User Statistics** - Level progression and learning milestones

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- PowerShell (Windows) or Terminal (Mac/Linux)

### Backend Setup (PowerShell)
```powershell
# Clone the repository
git clone <repository-url>
cd japanese-srs

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database (if needed)
python init_db.py

# Start the backend server
uvicorn main:app --reload
```

The backend will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

### Frontend Setup
```bash
# Open new terminal/PowerShell window
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at: http://localhost:3000

## 🏗️ Architecture

### Backend Stack
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Powerful ORM for database operations
- **SQLite** - Local database for fast, offline learning
- **Pydantic** - Data validation and serialization

### Frontend Stack
- **React 18** - Modern component-based UI library
- **Tailwind CSS** - Utility-first styling framework
- **React Router** - Client-side routing
- **Heroicons** - Beautiful SVG icons

### Database Schema
```sql
vocabulary       - Word definitions and metadata
user_progress    - SRS stages and review scheduling  
decks           - Custom vocabulary collections
user_stats      - Progress tracking and statistics
```

## 📖 How to Use

### 1. Start Learning
1. Visit the **Dashboard** to see your progress overview
2. Go to **Lessons** to learn new vocabulary
3. Choose your source (JLPT N5, N4, or custom decks)
4. Complete the quiz with 100% accuracy to advance words to SRS

### 2. Review Schedule
1. Check the **Reviews** page for due words
2. Answer prompts in both Japanese → English and English → Japanese
3. Correct answers advance SRS stages, incorrect ones demote
4. Build consistency with daily review sessions

### 3. Explore & Search
1. Use the **Dictionary** to browse all vocabulary
2. Search by kanji, hiragana, romaji, or English
3. Click any word for detailed information and SRS status
4. Track your learning progress for each word

### 4. Custom Content
1. Upload CSV files with format: `word,meaning`
2. Create custom study decks for specialized vocabulary
3. Import business terms, hobby words, or textbook content
4. All custom content integrates with the SRS system

## 🎯 SRS System Details

### Stage Progression
| Stage | Interval | Description |
|-------|----------|-------------|
| Child | 4 hours | Just learned |
| Student | 8 hours | Getting familiar |
| Scholar | 1 day | Well understood |
| Enlightened | 3 days | Nearly mastered |
| Burned | ∞ | Mastered (no more reviews) |

### Advancement Rules
- **5 correct answers** → Advance to next stage
- **1 incorrect answer** → Demote to previous stage
- **Burned words** → No longer appear in reviews

## 🛠️ Configuration

### Settings Page Options
- **Max Lessons Per Day** - Control learning pace (default: 15)
- **Theme Toggle** - Switch between light and dark modes
- **Data Reset** - Start fresh (useful for testing)
- **Audio Settings** - Enable/disable pronunciation

### CSV Upload Format
```csv
word,meaning
こんにちは,hello
ありがとう,thank you
さようなら,goodbye
```

## 📁 Project Structure

```
japanese-srs/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── crud.py             # Database operations
│   ├── srs.py              # SRS logic
│   ├── requirements.txt    # Python dependencies
│   └── data/
│       ├── jlpt_n5.json   # N5 vocabulary
│       └── jlpt_n4.json   # N4 vocabulary
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main application
│   │   └── index.js        # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
└── README.md               # This file
```

## 🧪 Development

### Adding New Features
1. **Backend**: Add endpoints in `main.py`, update models/schemas
2. **Frontend**: Create components in `src/components/`
3. **Database**: Modify models in `models.py`, update CRUD operations

### Testing
```bash
# Backend tests (if implemented)
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend deployment
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🎨 Design Philosophy

KanaFlow emphasizes:
- **Simplicity** - Clean, distraction-free interface
- **Efficiency** - Fast, local performance with SQLite
- **Flexibility** - Support for custom content and learning styles
- **Motivation** - Progress visualization and achievement tracking
- **Accessibility** - Mobile-friendly, keyboard navigation, screen readers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **JLPT Vocabulary** - Based on official Japanese Language Proficiency Test word lists
- **Design Inspiration** - Modern language learning applications
- **Community** - Japanese language learners and SRS enthusiasts

## 🔧 Troubleshooting

### Common Issues

**"no such table: vocabulary" Error:**
```powershell
# Navigate to backend directory
cd backend

# Initialize the database manually
python init_db.py

# Then restart the server
uvicorn main:app --reload
```

**Backend won't start:**
```bash
# Check Python version
python --version  # Should be 3.8+

# Recreate virtual environment
rmdir /s venv  # Windows
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend won't start:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Database issues:**
```bash
# Delete database file to reset
rm japanese_srs.db  # or del japanese_srs.db on Windows
# Run init script
python init_db.py
# Restart backend
```

### Performance Tips
- Keep lesson batches reasonable (15-20 words)
- Review consistently for best SRS effectiveness
- Use the dashboard to track daily progress
- Regular database cleanup for optimal performance

---

**Happy Learning! 🌸📚**

Start your Japanese vocabulary journey with KanaFlow - where spaced repetition meets modern design.