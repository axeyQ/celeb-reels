// src/components/JobMonitoringDashboard.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobMonitoringDashboard() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Fetch jobs on first load and then every 10 seconds
  useEffect(() => {
    fetchJobs();
    
    const interval = setInterval(() => {
      fetchJobs();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/generate');
      
      if (response.data.jobs) {
        setJobs(response.data.jobs);
        
        // If a job is selected, update its data
        if (selectedJob) {
          const updatedJob = response.data.jobs.find(job => job.id === selectedJob.id);
          if (updatedJob) {
            setSelectedJob(updatedJob);
          }
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handleRetryJob = async (jobId) => {
    try {
      const response = await axios.put('/api/generate', { jobId });
      if (response.data.success) {
        alert('Job retry initiated successfully');
        fetchJobs();
      } else {
        alert('Failed to retry job');
      }
    } catch (err) {
      console.error('Error retrying job:', err);
      alert('Error retrying job');
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-6 overflow-visible">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Generation Jobs</h2>
        <button
          onClick={fetchJobs}
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
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job list */}
        <div className="lg:col-span-1 bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-700 font-medium text-sm border-b border-gray-600">
            All Jobs ({jobs.length})
          </div>
          
          <div className="overflow-y-auto max-h-[500px]">
            {isLoading && jobs.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No jobs found
              </div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className={`p-3 hover:bg-gray-750 cursor-pointer ${
                      selectedJob?.id === job.id ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(job.status)}`}></div>
                        <span className="font-medium truncate">{job.statusMessage || job.status}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(job.updatedAt)}</span>
                    </div>
                    
                    {job.status === 'processing' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-1 text-xs text-gray-400 truncate">
                      ID: {job.id.substring(0, 8)}...
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Job details */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg">
          {selectedJob ? (
            <div>
              <div className="p-3 bg-gray-700 font-medium border-b border-gray-600 flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(selectedJob.status)}`}></div>
                  <span>Job Details</span>
                </div>
                {selectedJob.status === 'failed' && (
                  <button
                    onClick={() => handleRetryJob(selectedJob.id)}
                    className="px-3 py-1 text-xs bg-blue-700 hover:bg-blue-600 rounded"
                  >
                    Retry Job
                  </button>
                )}
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Job ID</p>
                    <p className="font-mono text-sm">{selectedJob.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="capitalize">{selectedJob.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Created</p>
                    <p>{formatDate(selectedJob.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p>{formatDate(selectedJob.updatedAt)}</p>
                  </div>
                </div>
                
                {selectedJob.status === 'processing' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{selectedJob.statusMessage || 'Processing...'}</span>
                      <span>{selectedJob.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${selectedJob.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {selectedJob.error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md">
                    <p className="text-xs text-red-400 mb-1">Error Message</p>
                    <p className="text-red-200">{selectedJob.error}</p>
                  </div>
                )}
                
                {selectedJob.status === 'completed' && selectedJob.result && (
                  <div className="bg-gray-750 rounded-md p-3 mb-4">
                    <p className="text-xs text-gray-400 mb-2">Generated Video</p>
                    <div className="flex items-center">
                      <div className="bg-gray-900 w-16 h-16 rounded overflow-hidden mr-3">
                        <img
                          src={selectedJob.result.thumbnailUrl || "/placeholder-thumbnail.jpg"}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{selectedJob.result.title}</p>
                        <p className="text-sm text-gray-400">
                          {selectedJob.result.athlete} • {selectedJob.result.sport} • {selectedJob.result.duration}
                        </p>
                        <a
                          href={selectedJob.result.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          View Video
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-gray-400 mb-2">Job Parameters</p>
                  <pre className="bg-gray-750 p-3 rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(selectedJob.data || 'No data available', null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p>Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}