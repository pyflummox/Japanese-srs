import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckIcon, 
  XMarkIcon,
  ArrowRightIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vocabularyIds, mode } = location.state || {};
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { post } = useApi();

  useEffect(() => {
    if (!vocabularyIds || vocabularyIds.length === 0) {
      navigate('/lessons');
      return;
    }
    
    initializeQuiz();
  }, [vocabularyIds]);

  const initializeQuiz = async () => {
    try {
      const response = await post('/api/quiz/start', { vocabulary_ids: vocabularyIds });
      
      // Shuffle questions to mix JP->EN and EN->JP
      const shuffledQuestions = response.questions.sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize quiz:', error);
      navigate('/lessons');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    
    try {
      const response = await post('/api/quiz/check', {
        vocabulary_id: currentQuestion.vocabulary_id,
        user_answer: userAnswer.trim(),
        question_type: currentQuestion.question_type
      });

      setIsCorrect(response.correct);
      setCorrectAnswer(response.correct_answer);
      setShowResult(true);
      
      if (response.correct) {
        setScore(score + 1);
      }
    } catch (error) {
      console.error('Failed to check answer:', error);
    }
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setUserAnswer('');
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    const requiredScore = Math.ceil(questions.length * 0.8); // 80% required
    const passed = score >= requiredScore;
    
    if (passed && mode === 'lesson') {
      // Mark lessons as completed in SRS
      try {
        await post('/api/lessons/complete', { vocabulary_ids: vocabularyIds });
      } catch (error) {
        console.error('Failed to complete lessons:', error);
      }
    }
    
    setCompleted(true);
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setCompleted(false);
    setShowResult(false);
    setUserAnswer('');
    
    // Reshuffle questions
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (completed) {
    const requiredScore = Math.ceil(questions.length * 0.8);
    const passed = score >= requiredScore;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 ${
          passed ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {passed ? (
              <CheckIcon className="w-10 h-10" />
            ) : (
              <XMarkIcon className="w-10 h-10" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-4">
            {passed ? 'Quiz Completed!' : 'Try Again'}
          </h2>
          
          <div className="text-4xl font-bold mb-2">
            {score} / {questions.length}
          </div>
          
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {percentage}% correct
          </div>
          
          {passed && mode === 'lesson' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-green-800 dark:text-green-200">
                🎉 Congratulations! These words have been added to your SRS review queue.
              </p>
            </div>
          )}
          
          {!passed && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <p className="text-orange-800 dark:text-orange-200">
                You need {requiredScore} correct answers to pass. Keep practicing!
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!passed && (
              <button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            )}
            
            <button
              onClick={() => navigate(passed && mode === 'lesson' ? '/' : '/lessons')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {passed && mode === 'lesson' ? 'Back to Dashboard' : 'Back to Lessons'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">No questions available</h2>
          <button
            onClick={() => navigate('/lessons')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Score: {score}/{currentQuestionIndex}
          </span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-6">
          {/* Question Type Indicator */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
            {currentQuestion.question_type === 'jp_to_en' ? 'Japanese → English' : 'English → Japanese'}
          </div>

          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {currentQuestion.question}
              </h2>
              {currentQuestion.question_type === 'jp_to_en' && (
                <button
                  onClick={() => playAudio(currentQuestion.question)}
                  className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                  title="Play audio"
                >
                  <SpeakerWaveIcon className="w-6 h-6" />
                </button>
              )}
            </div>
            
            {currentQuestion.question_type === 'jp_to_en' && currentQuestion.kana_hint && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {currentQuestion.kana_hint}
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
                placeholder={currentQuestion.question_type === 'jp_to_en' ? 'Enter English meaning' : 'Enter Japanese word'}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
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
                onClick={handleNextQuestion}
                className="flex items-center justify-center space-x-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;