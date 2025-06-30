import React, { useState, useEffect } from 'https://cdn.skypack.dev/react';
import { BrowserRouter as Router, Routes, Route } from 'https://cdn.skypack.dev/react-router-dom';
import Navigation from './components/Navigation.js';
import Dashboard from './components/Dashboard.js';
import Lessons from './components/Lessons.js';
import Quiz from './components/Quiz.js';
import Reviews from './components/Reviews.js';
import Dictionary from './components/Dictionary.js';
import WordDetail from './components/WordDetail.js';
import Settings from './components/Settings.js';

function App() {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    setIsLoading(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
      }`}>
        <Navigation theme={theme} toggleTheme={toggleTheme} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/dictionary/:wordId" element={<WordDetail />} />
            <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
