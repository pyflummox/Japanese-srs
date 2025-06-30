import React, { useState, useEffect } from 'https://cdn.skypack.dev/react';
import { useNavigate } from 'https://cdn.skypack.dev/react-router-dom';
import { 
  BookOpenIcon, 
  ArrowRightIcon,
  CloudArrowUpIcon,
  DocumentTextIcon
} from 'https://cdn.skypack.dev/@heroicons/react@2.0.18/24/outline';
import { useApi } from '../hooks/useApi.js';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [selectedSource, setSelectedSource] = useState('N5');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [deckName, setDeckName] = useState('');
  const [customDecks, setCustomDecks] = useState([]);
  const navigate = useNavigate();
  const { get, post } = useApi();

  useEffect(() => {
    fetchLessons();
    fetchCustomDecks();
  }, [selectedSource]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await get(`/api/lessons?source=${selectedSource}&limit=15`);
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomDecks = async () => {
    try {
      const data = await get('/api/decks');
      setCustomDecks(data || []);
    } catch (error) {
      console.error('Failed to fetch custom decks:', error);
    }
  };

  const handleStartLessons = () => {
    if (lessons.length === 0) return;
    
    const lessonIds = lessons.map(lesson => lesson.id);
    navigate('/quiz', { state: { vocabularyIds: lessonIds, mode: 'lesson' } });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !deckName.trim()) return;

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('deck_name', deckName.trim());

      await post('/api/decks/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowUpload(false);
      setUploadFile(null);
      setDeckName('');
      fetchCustomDecks();
      alert('Deck uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload deck:', error);
      alert('Failed to upload deck. Please check the file format.');
    }
  };

  const playAudio = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lessons</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Learn new vocabulary and start your SRS journey
        </p>
      </div>

      {/* Source Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Choose Your Source</h3>
            <div className="flex flex-wrap gap-2">
              {['N5', 'N4', 'All', ...customDecks.map(deck => deck.name)].map((source) => (
                <button
                  key={source}
                  onClick={() => setSelectedSource(source)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedSource === source
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <CloudArrowUpIcon className="w-5 h-5" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Custom Deck</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Deck Name</label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="My Custom Deck"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: word,meaning (one per line)
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lessons Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {lessons.length > 0 ? (
            <>
              {/* Lesson Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Today's Lessons ({lessons.length})</h3>
                  <button
                    onClick={handleStartLessons}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    <span>Start Lessons</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Vocabulary Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.slice(0, 6).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {lesson.word}
                        </span>
                        <button
                          onClick={() => playAudio(lesson.word)}
                          className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                          title="Play audio"
                        >
                          🔊
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                        {lesson.kana}
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {lesson.english}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{lesson.part_of_speech}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {lesson.jlpt_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {lessons.length > 6 && (
                  <p className="text-center text-gray-500 mt-4">
                    +{lessons.length - 6} more words to learn
                  </p>
                )}
              </div>
            </>
          ) : (
            /* No Lessons Available */
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No lessons available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've completed all available lessons for {selectedSource}!
              </p>
              <p className="text-sm text-gray-500">
                Try selecting a different source or upload a custom deck to continue learning.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Lessons;
