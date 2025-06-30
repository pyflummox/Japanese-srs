# Japanese SRS Starter

This repository contains a minimal starter for a Japanese vocabulary study tool inspired by WaniKani.
It provides a FastAPI backend with SQLite and a React frontend built with Vite.

## Folder structure

```
backend/        Python FastAPI application
frontend/       React application using Vite
```

## Windows Setup

1. Clone this repository or extract the zip
2. Open **PowerShell** or **Command Prompt**
3. Install Python packages and run backend:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. In another terminal, set up the frontend:

```powershell
cd frontend
npm install
npm run dev
```

The frontend should now be available at `http://localhost:5173` and will proxy API requests to the backend running at `http://localhost:8000`.

This is a basic starter. Extend the API models and React components to implement SRS reviews, custom decks, and audio playback.

## Local Testing

1. Run backend and frontend using the steps above.
2. Vocab from the included JLPT CSV files will load automatically on first start.
3. Open `http://localhost:5173` in your browser.
4. Navigate to **Lessons** to study new words.
5. Visit **Reviews** to review learned words and watch the SRS stage name change.
6. Check **Dashboard** to see your current level and statistics increase as you learn.
7. Upload additional vocab via the **Lessons** page using a CSV with columns `Japanese,English`.
