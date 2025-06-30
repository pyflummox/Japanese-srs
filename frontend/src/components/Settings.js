import React, { useState, useEffect } from 'https://cdn.skypack.dev/react';
import { 
  Cog6ToothIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from 'https://cdn.skypack.dev/@heroicons/react@2.0.18/24/outline';
import { useApi } from '../hooks/useApi.js';

const Settings = ({ theme, toggleTheme }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { get, post } = useApi();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await get('/api/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    try {
      setResetting(true);
      await post('/api/settings/reset');
      setShowResetModal(false);
      alert('All data has been reset successfully!');
      // Refresh the page to show updated state
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset data:', error);
      alert('Failed to reset data. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your learning experience and manage your data
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Appearance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred color scheme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {theme === 'dark' ? (
                  <>
                    <MoonIcon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <SunIcon className="w-4 h-4" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Learning Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Learning Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Lessons Per Day</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Maximum new lessons you can do per day</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  defaultValue={settings?.max_lessons_per_day || 15}
                  className="w-20 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">lessons</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio Playback</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enable automatic audio for new words</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* User Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            Your Progress
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{settings?.level || 1}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{settings?.total_words_learned || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Words Learned</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily Streak</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reviews Done</div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrashIcon className="w-5 h-5 mr-2" />
            Data Management
          </h3>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Reset All Data</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This will permanently delete all your progress, including learned words, SRS stages, and statistics. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Reset All Data
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ChartBarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Export Data</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Download your learning progress and vocabulary data as a backup.
                  </p>
                  <button
                    disabled
                    className="mt-3 bg-gray-400 cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Export Data (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About KanaFlow</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>KanaFlow is a spaced repetition system (SRS) for learning Japanese vocabulary.</p>
            <p>Built with React, FastAPI, and SQLite for efficient local learning.</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Version 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Reset</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you absolutely sure you want to reset all your data? This will delete:
            </p>
            
            <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-1">
              <li>• All learned vocabulary</li>
              <li>• SRS progress and stages</li>
              <li>• User statistics and level</li>
              <li>• Custom uploaded decks</li>
            </ul>
            
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-6">
              This action cannot be undone!
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleResetData}
                disabled={resetting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset All Data'}
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:cursor-not-allowed text-gray-700 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
