// src/components/AnalyticsDashboard.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchAnalytics();
    
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/analytics');
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };
  
  if (isLoading && !analytics) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <p className="text-gray-400 text-center">No analytics data available</p>
      </div>
    );
  }
  
  // Calculate success rate
  const successRate = analytics.generationCount > 0
    ? (analytics.successCount / analytics.generationCount) * 100
    : 0;
  
  return (
    <div className="bg-gray-900 rounded-lg p-6 overflow-visible">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Generation Analytics</h3>
        <button
          onClick={fetchAnalytics}
          className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded-md flex items-center"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
      
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Total Generations</p>
          <p className="text-2xl font-semibold">{formatNumber(analytics.generationCount)}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Success Rate</p>
          <p className="text-2xl font-semibold">
            {successRate.toFixed(1)}%
            <span className="text-sm text-gray-400 ml-1">
              ({analytics.successCount}/{analytics.generationCount})
            </span>
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Avg. Processing Time</p>
          <p className="text-2xl font-semibold">
            {formatTime(analytics.averageProcessingTime)}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Current Queue</p>
          <p className="text-2xl font-semibold">
            {analytics.generationsByStatus.queued + analytics.generationsByStatus.processing}
          </p>
        </div>
      </div>
      
      {/* Status Breakdown */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3">Generation Status</h4>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex w-full h-4 rounded-full overflow-hidden">
            {analytics.generationsByStatus.completed > 0 && (
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(analytics.generationsByStatus.completed / analytics.generationCount) * 100}%` }}
              ></div>
            )}
            {analytics.generationsByStatus.processing > 0 && (
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(analytics.generationsByStatus.processing / analytics.generationCount) * 100}%` }}
              ></div>
            )}
            {analytics.generationsByStatus.queued > 0 && (
              <div
                className="bg-yellow-500 h-full"
                style={{ width: `${(analytics.generationsByStatus.queued / analytics.generationCount) * 100}%` }}
              ></div>
            )}
            {analytics.generationsByStatus.failed > 0 && (
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(analytics.generationsByStatus.failed / analytics.generationCount) * 100}%` }}
              ></div>
            )}
          </div>
          
          <div className="flex flex-wrap mt-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Completed: {analytics.generationsByStatus.completed}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Processing: {analytics.generationsByStatus.processing}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span>Queued: {analytics.generationsByStatus.queued}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>Failed: {analytics.generationsByStatus.failed}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Athletes and Sports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-lg font-medium mb-3">Top Athletes</h4>
          <div className="bg-gray-800 p-4 rounded-lg">
            {Object.entries(analytics.generationsByAthlete).length === 0 ? (
              <p className="text-gray-400 text-center py-2">No data available</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(analytics.generationsByAthlete)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([athlete, count]) => (
                    <li key={athlete} className="flex justify-between items-center">
                      <span className="truncate">{athlete}</span>
                      <span className="text-gray-400">{count} generations</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-3">Top Sports</h4>
          <div className="bg-gray-800 p-4 rounded-lg">
            {Object.entries(analytics.generationsBySport).length === 0 ? (
              <p className="text-gray-400 text-center py-2">No data available</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(analytics.generationsBySport)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([sport, count]) => (
                    <li key={sport} className="flex justify-between items-center">
                      <span>{sport}</span>
                      <span className="text-gray-400">{count} generations</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      {analytics.generationTimeline?.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-3">Recent Activity</h4>
          <div className="bg-gray-800 p-4 rounded-lg">
            <ul className="space-y-3">
              {analytics.generationTimeline
                .slice(-5)
                .reverse()
                .map((event, index) => {
                  const date = new Date(event.timestamp);
                  const timeString = date.toLocaleTimeString();
                  
                  return (
                    <li key={index} className="flex items-start">
                      <div className="w-16 text-xs text-gray-400">{timeString}</div>
                      <div className="flex-1">
                        {event.event === 'start' && (
                          <p>
                            New generation started for <span className="font-medium">{event.athlete}</span> ({event.sport})
                          </p>
                        )}
                        {event.event === 'status_change' && (
                          <p>
                            Job status changed from <span className="text-yellow-400">{event.oldStatus}</span> to{' '}
                            <span className={
                              event.newStatus === 'completed' ? 'text-green-400' : 
                              event.newStatus === 'failed' ? 'text-red-400' : 
                              'text-blue-400'
                            }>
                              {event.newStatus}
                            </span>
                          </p>
                        )}
                        {event.event === 'complete' && (
                          <p>
                            Generation {event.success ? 'completed successfully' : 'failed'} in{' '}
                            <span className="font-medium">{formatTime(event.processingTime)}</span>
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}