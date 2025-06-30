import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  PencilIcon, 
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await get('/api/dashboard');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getLevelInfo = (level) => {
    const levelThresholds = [0, 30, 60, 100, 150, 200];
    const currentThreshold = levelThresholds[level - 1] || 0;
    const nextThreshold = levelThresholds[level] || currentThreshold + 50;
    return { currentThreshold, nextThreshold };
  };

  const { currentThreshold, nextThreshold } = getLevelInfo(dashboardData?.level || 1);
  const progressPercentage = dashboardData?.words_learned 
    ? ((dashboardData.words_learned - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 0;

  const formatNextReview = (timeString) => {
    if (!timeString) return 'No reviews scheduled';
    const reviewTime = new Date(timeString);
    const now = new Date();
    const diffMs = reviewTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Reviews available now!';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to KanaFlow
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Master Japanese vocabulary with spaced repetition
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Level</p>
              <p className="text-3xl font-bold text-emerald-600">{dashboardData?.level || 1}</p>
            </div>
            <TrophyIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {dashboardData?.words_learned || 0} / {nextThreshold} words
            </p>
          </div>
        </div>

        {/* Words Learned */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Words Learned</p>
              <p className="text-3xl font-bold text-blue-600">{dashboardData?.words_learned || 0}</p>
            </div>
            <BookOpenIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Streak</p>
              <p className="text-3xl font-bold text-orange-600">{dashboardData?.daily_streak || 0}</p>
            </div>
            <FireIcon className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        {/* Reviews Due */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reviews Due</p>
              <p className="text-3xl font-bold text-purple-600">{dashboardData?.reviews_due || 0}</p>
            </div>
            <PencilIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* SRS Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-600" />
              SRS Progress
            </h3>
            <div className="space-y-4">
              {[
                { stage: 'child', label: 'Child', color: 'bg-red-500', time: '4h' },
                { stage: 'student', label: 'Student', color: 'bg-orange-500', time: '8h' },
                { stage: 'scholar', label: 'Scholar', color: 'bg-yellow-500', time: '1d' },
                { stage: 'enlightened', label: 'Enlightened', color: 'bg-green-500', time: '3d' },
                { stage: 'burned', label: 'Burned', color: 'bg-gray-500', time: '∞' }
              ].map((stage) => {
                const count = dashboardData?.stage_counts?.[stage.stage] || 0;
                const maxCount = Math.max(...Object.values(dashboardData?.stage_counts || {})) || 1;
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={stage.stage} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 w-24">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      <span className="text-sm font-medium">{stage.label}</span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${stage.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{count}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 w-8">{stage.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accuracy Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Accuracy</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">JP → EN</p>
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="16"
                      fill="none"
                      className="stroke-gray-200 dark:stroke-gray-700"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18" cy="18" r="16"
                      fill="none"
                      className="stroke-blue-600"
                      strokeWidth="3"
                      strokeDasharray={`${(dashboardData?.accuracy_jp_to_en || 0)}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{Math.round(dashboardData?.accuracy_jp_to_en || 0)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">EN → JP</p>
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="16"
                      fill="none"
                      className="stroke-gray-200 dark:stroke-gray-700"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18" cy="18" r="16"
                      fill="none"
                      className="stroke-purple-600"
                      strokeWidth="3"
                      strokeDasharray={`${(dashboardData?.accuracy_en_to_jp || 0)}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{Math.round(dashboardData?.accuracy_en_to_jp || 0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {dashboardData?.reviews_due > 0 && (
                <Link
                  to="/reviews"
                  className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-center"
                >
                  Start Reviews ({dashboardData.reviews_due})
                </Link>
              )}
              
              {dashboardData?.lessons_available > 0 && (
                <Link
                  to="/lessons"
                  className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-center"
                >
                  New Lessons ({dashboardData.lessons_available})
                </Link>
              )}
              
              <Link
                to="/dictionary"
                className="block w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-center"
              >
                Browse Dictionary
              </Link>
            </div>
          </div>

          {/* Next Review */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Next Review
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {formatNextReview(dashboardData?.next_review_time)}
            </p>
          </div>

          {/* Motivation */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Keep Going!</h3>
            <p className="text-indigo-100 text-sm">
              {dashboardData?.words_learned > 50 
                ? "You're making excellent progress! Every review strengthens your memory."
                : "Great start! Consistency is key to mastering Japanese vocabulary."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;