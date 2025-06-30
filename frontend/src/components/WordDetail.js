import React, { useState, useEffect } from 'https://cdn.skypack.dev/react';
import { useParams, Link } from 'https://cdn.skypack.dev/react-router-dom';
import { 
  ArrowLeftIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon
} from 'https://cdn.skypack.dev/@heroicons/react@2.0.18/24/outline';
import { useApi } from '../hooks/useApi.js';

const WordDetail = () => {
  const { wordId } = useParams();
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    fetchWordDetail();
  }, [wordId]);

  const fetchWordDetail = async () => {
    try {
      const data = await get(`/api/dictionary/${wordId}`);
      setWord(data);
    } catch (error) {
      console.error('Failed to fetch word detail:', error);
    } finally {
      setLoading(false);
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

  const getJLPTLevelColor = (level) => {
    const colors = {
      'JLPT_N5': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'JLPT_N4': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'JLPT_N3': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'JLPT_N2': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'JLPT_N1': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'Custom': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getSRSStageColor = (stage) => {
    const colors = {
      'Child': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'Student': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'Scholar': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'Enlightened': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Burned': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const formatJLPTLevel = (level) => {
    if (level === 'Custom') return 'Custom';
    return level.replace('JLPT_', '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Word not found</h2>
          <Link
            to="/dictionary"
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Dictionary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        to="/dictionary"
        className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Dictionary</span>
      </Link>

      {/* Main Word Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-bold">{word.word}</h1>
              <button
                onClick={() => playAudio(word.word)}
                className="text-white hover:text-orange-200 transition-colors duration-200"
                title="Play audio"
              >
                <SpeakerWaveIcon className="w-8 h-8" />
              </button>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getJLPTLevelColor(word.jlpt_level)} bg-white text-gray-800`}>
              {formatJLPTLevel(word.jlpt_level)}
            </div>
          </div>
          
          {word.kana !== word.word && (
            <p className="text-xl text-orange-100 mt-2">{word.kana}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meaning */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Meaning</h3>
            <p className="text-xl text-gray-700 dark:text-gray-300">{word.english}</p>
          </div>

          {/* Part of Speech */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Part of Speech</h3>
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg text-sm font-medium">
              {word.part_of_speech}
            </span>
          </div>

          {/* Example Sentence */}
          {word.example && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Example Sentence
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg text-gray-900 dark:text-white">{word.example}</p>
                  <button
                    onClick={() => playAudio(word.example)}
                    className="text-gray-400 hover:text-orange-600 transition-colors duration-200 ml-4"
                    title="Play example audio"
                  >
                    <SpeakerWaveIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SRS Progress (if learned) */}
          {word.srs_stage && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                SRS Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Stage</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSRSStageColor(word.srs_stage)}`}>
                    {word.srs_stage}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Last Reviewed
                  </div>
                  <div className="font-medium">{formatDate(word.last_review_date)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Learning Status</h3>
            {word.srs_stage ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200">
                  ✅ You've learned this word! It's currently in the <strong>{word.srs_stage}</strong> stage of your SRS review system.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200">
                  📚 This word is available to learn. Start a lesson session to add it to your SRS review queue.
                </p>
                <Link
                  to="/lessons"
                  className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Go to Lessons
                </Link>
              </div>
            )}
          </div>

          {/* Word Breakdown (for kanji words) */}
          {word.word.length > 1 && /[\u4e00-\u9faf]/.test(word.word) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Word Composition</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {Array.from(word.word).map((char, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg p-3 text-center min-w-[60px]"
                    >
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{char}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {/[\u4e00-\u9faf]/.test(char) ? 'Kanji' : 'Kana'}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  This word is composed of {Array.from(word.word).length} character{Array.from(word.word).length > 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/lessons"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center"
        >
          Study Similar Words
        </Link>
        <Link
          to="/reviews"
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center"
        >
          Review Queue
        </Link>
        <Link
          to="/dictionary"
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center"
        >
          Browse Dictionary
        </Link>
      </div>
    </div>
  );
};

export default WordDetail;
     

