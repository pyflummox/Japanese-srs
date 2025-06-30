import React, { useState, useEffect, useCallback } from 'https://cdn.skypack.dev/react';
import { Link } from 'https://cdn.skypack.dev/react-router-dom';
import { 
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  BookOpenIcon
} from 'https://cdn.skypack.dev/@heroicons/react@2.0.18/24/outline';
import { useApi } from '../hooks/useApi.js';
import { debounce } from '../utils/helpers.js';

const Dictionary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { get } = useApi();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      setSearching(true);
      try {
        const data = await get(`/api/dictionary?q=${encodeURIComponent(query)}`);
        setVocabulary(data || []);
      } catch (error) {
        console.error('Failed to search dictionary:', error);
      } finally {
        setSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    // Load initial vocabulary
    fetchVocabulary();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      fetchVocabulary();
    }
  }, [searchQuery, debouncedSearch]);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const data = await get('/api/dictionary');
      setVocabulary(data || []);
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
    } finally {
      setLoading(false);
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

  const formatJLPTLevel = (level) => {
    if (level === 'Custom') return 'Custom';
    return level.replace('JLPT_', '');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dictionary</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Browse and search all vocabulary in your collection
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by kanji, hiragana, romaji, or English..."
            className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {searching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
            </div>
          )}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Try searching:</span>
          <button 
            onClick={() => setSearchQuery('あう')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            あう
          </button>
          <button 
            onClick={() => setSearchQuery('blue')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            blue
          </button>
          <button 
            onClick={() => setSearchQuery('verb')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            verb
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {searchQuery ? `Search Results (${vocabulary.length})` : `All Vocabulary (${vocabulary.length})`}
            </h2>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Vocabulary Grid */}
          {vocabulary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabulary.map((word) => (
                <Link
                  key={word.id}
                  to={`/dictionary/${word.id}`}
                  className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {word.word}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            playAudio(word.word);
                          }}
                          className="text-gray-400 hover:text-orange-600 transition-colors duration-200"
                          title="Play audio"
                        >
                          <SpeakerWaveIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {word.kana !== word.word && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                          {word.kana}
                        </p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${getJLPTLevelColor(word.jlpt_level)}`}>
                      {formatJLPTLevel(word.jlpt_level)}
                    </div>
                  </div>
                  
                  <p className="text-gray-900 dark:text-white font-medium mb-2 line-clamp-2">
                    {word.english}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {word.part_of_speech}
                    </span>
                    {word.example && (
                      <span className="flex items-center">
                        <BookOpenIcon className="w-3 h-3 mr-1" />
                        Example
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No results found' : 'No vocabulary available'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? `Try a different search term or check your spelling.`
                  : 'Start learning lessons to build your vocabulary collection.'
                }
              </p>
              {!searchQuery && (
                <Link
                  to="/lessons"
                  className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <BookOpenIcon className="w-5 h-5" />
                  <span>Start Learning</span>
                </Link>
              )}
            </div>
          )}

          {/* Load More Button (if needed for pagination) */}
          {vocabulary.length === 100 && (
            <div className="text-center">
              <button className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dictionary;
