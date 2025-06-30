import React, { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  XMarkIcon,
  ArrowRightIcon,
  SpeakerWaveIcon,
  ClockIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questionType, setQuestionType] = useState('jp_to_en');
  
  const { get, post } = useApi();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await get('/api/reviews');
      
      // Randomize question types for each review
      const reviewsWithTypes = data.map(review => ({
        ...review,
        question_type: Math.random() > 0.5 ? 'jp_to_en' : 'en_to_jp'
      }));
      
      setReviews(reviewsWithTypes);
      if (reviewsWithTypes.length > 0) {
        setQuestionType(reviewsWithTypes[0].question_type);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    const currentReview = reviews[currentReviewIndex];
    
    try {
      const response = await post('/api/reviews/submit', {
        vocabulary_id: currentReview.id,
        correct: false, // Will be determined by backend
        question_type: questionType
      });

      // Check answer with backend
      const checkResponse = await post('/api/quiz/check', {
        vocabulary_id: currentReview.id,
        user_answer: userAnswer.trim(),
        question_type: questionType
      });

      setIsCorrect(checkResponse.correct);
      setCorrectAnswer(checkResponse.correct_answer);
      setShowResult(true);
      
      // Update session stats
      setSessionStats(prev => ({
        correct: prev.correct + (checkResponse.correct ? 1 : 0),
        total: prev.total + 1
      }));

      // Submit actual result to backend
      await post('/api/reviews/submit', {
        vocabulary_id: currentReview.id,
        correct: checkResponse.correct,
        question_type: questionType
      });

    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleNextReview = () => {
    setShowResult(false);
    setUserAnswer('');
    
    if (currentReviewIndex < reviews.length - 1) {
      const nextIndex = currentReviewIndex + 1;
      setCurrentReviewIndex(nextIndex);
      setQuestionType(reviews[nextIndex].question_type);
    } else {
      setCompleted(true);
    }
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getSRSStageColor = (stage) => {
    const colors = {
      'Child': 'text-red-600 bg-red-100 dark:bg-red-900/20',
      'Student': 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      'Scholar': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      'Enlightened': 'text-green-600 bg-green-100 dark:bg-green-900/20',
      'Burned': 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    };
    return colors[stage] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (completed) {
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckIcon className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Reviews Complete!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-200">
              🎉 Great job! Your SRS progress has been updated based on your performance.
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg border border-gray-200 dark:border-gray-700">
          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Reviews Due</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You're all caught up! Come back later when more reviews are due.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentReview = reviews[currentReviewIndex];
  const progress = ((currentReviewIndex + 1) / reviews.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reviews</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Review your learned vocabulary to strengthen memory
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Review {currentReviewIndex + 1} of {reviews.length}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Accuracy: {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
          </span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Review Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-6">
          {/* SRS Stage and Question Type */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSRSStageColor(currentReview.srs_stage)}`}>
              {currentReview.srs_stage}
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              {questionType === 'jp_to_en' ? 'Japanese → English' : 'English → Japanese'}
            </div>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {questionType === 'jp_to_en' ? currentReview.word : currentReview.english}
              </h2>
              {questionType === 'jp_to_en' && (
                <button
                  onClick={() => playAudio(currentReview.word)}
                  className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                  title="Play audio"
                >
                  <SpeakerWaveIcon className="w-6 h-6" />
                </button>
              )}
            </div>
            
            {questionType === 'jp_to_en' && currentReview.kana && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {currentReview.kana}
              </p>
            )}
          </div>

          {/* Answer Input */}
          {!showResult ? (
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder={questionType === 'jp_to_en' ? 'Enter English meaning' : 'Enter Japanese word'}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
              
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            /* Result Display */
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                isCorrect 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-center space-x-2">
                  {isCorrect ? (
                    <CheckIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <XMarkIcon className="w-6 h-6 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                
                {!isCorrect && (
                  <div className="mt-2 text-center">
                    <p className="text-red-800 dark:text-red-200">
                      Your answer: <span className="font-medium">{userAnswer}</span>
                    </p>
                    <p className="text-red-800 dark:text-red-200">
                      Correct answer: <span className="font-medium">{correctAnswer}</span>
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextReview}
                className="flex items-center justify-center space-x-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                <span>{currentReviewIndex < reviews.length - 1 ? 'Next Review' : 'Finish Reviews'}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;