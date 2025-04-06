// src/app/admin/page.js
'use client';

import { useState } from 'react';
import VideoGenerationForm from '@/components/VideoGenerationForm';
import VideoUpload from '@/components/VideoUpload';
import JobMonitoringDashboard from '@/components/JobMonitoringDashboard';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('generate');
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 overflow-y-auto">
      <header className="max-w-6xl mx-auto py-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Manage sports celebrity reels content</p>
      </header>
      
      <main className="max-w-6xl mx-auto mt-6 pb-20">
        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            AI Generate
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Manual Upload
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Job Monitor
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Manage Content
          </button>
        </div>
        
        {/* Content */}
        <div className="mt-6">
          {activeTab === 'generate' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Generate Content with AI</h2>
              <p className="text-gray-400 mb-6">
                Create AI-generated sports celebrity reels by providing athlete information.
                Our system will automatically generate scripts, narration, and compile videos.
              </p>
              <VideoGenerationForm />
            </div>
          )}
          
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manual Video Upload</h2>
              <p className="text-gray-400 mb-6">
                Upload pre-made videos to the platform with complete metadata.
              </p>
              <VideoUpload />
            </div>
          )}
          
          {activeTab === 'jobs' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Job Monitoring</h2>
              <p className="text-gray-400 mb-6">
                Track and manage video generation jobs, view status updates, and retry failed jobs.
              </p>
              <JobMonitoringDashboard />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Analytics & Insights</h2>
              <p className="text-gray-400 mb-6">
                Track usage patterns, performance metrics, and generation statistics.
              </p>
              <AnalyticsDashboard />
            </div>
          )}
          
          {activeTab === 'manage' && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Content Management</h2>
              <p className="text-gray-400 mb-6">
                View, edit, and delete your sports celebrity reels content.
              </p>
              
              {/* This would be expanded in a real implementation */}
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-400">Content management interface coming soon</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}