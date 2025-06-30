// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Calculate time until next review
export const getTimeUntilReview = (reviewTime) => {
  if (!reviewTime) return null;
  
  const now = new Date();
  const review = new Date(reviewTime);
  const diffMs = review.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Available now';
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes % 60}m`;
  } else {
    return `${diffMinutes}m`;
  }
};

// Shuffle array
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Check if string contains Japanese characters
export const containsJapanese = (str) => {
  return /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(str);
};

// Check if string contains kanji
export const containsKanji = (str) => {
  return /[\u4e00-\u9faf]/.test(str);
};

// Check if string contains hiragana
export const containsHiragana = (str) => {
  return /[\u3040-\u309f]/.test(str);
};

// Check if string contains katakana
export const containsKatakana = (str) => {
  return /[\u30a0-\u30ff]/.test(str);
};

// Calculate user level based on words learned
export const calculateLevel = (wordsLearned) => {
  if (wordsLearned < 30) return 1;
  if (wordsLearned < 60) return 2;
  if (wordsLearned < 100) return 3;
  if (wordsLearned < 150) return 4;
  if (wordsLearned < 200) return 5;
  return 6 + Math.floor((wordsLearned - 200) / 50);
};

// Get level thresholds
export const getLevelThresholds = (level) => {
  const thresholds = [0, 30, 60, 100, 150, 200];
  const current = thresholds[level - 1] || (200 + (level - 6) * 50);
  const next = thresholds[level] || (200 + (level - 5) * 50);
  return { current, next };
};

// Format accuracy percentage
export const formatAccuracy = (accuracy) => {
  return Math.round(accuracy || 0);
};

// Generate random question type
export const getRandomQuestionType = () => {
  return Math.random() > 0.5 ? 'jp_to_en' : 'en_to_jp';
};

// Local storage helpers
export const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('theme') || 'light';
};

export const setStoredTheme = (theme) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
};

// Play audio using Web Speech API
export const playJapaneseAudio = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = options.rate || 0.8;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  speechSynthesis.speak(utterance);
};

// Validate CSV format for deck upload
export const validateCSVFormat = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return { valid: false, error: 'File is empty' };

  const errors = [];
  const validRows = [];

  lines.forEach((line, index) => {
    const columns = line.split(',');
    if (columns.length < 2) {
      errors.push(`Line ${index + 1}: Not enough columns (expected at least 2)`);
    } else if (!columns[0].trim() || !columns[1].trim()) {
      errors.push(`Line ${index + 1}: Empty word or meaning`);
    } else {
      validRows.push({
        word: columns[0].trim(),
        meaning: columns[1].trim()
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validRows,
    totalRows: lines.length
  };
};