'use client';

import { useState } from 'react';
import Link from 'next/link';
import VideoUpload from '@/components/VideoUpload';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('upload');
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Sports Celebrity Reels Admin</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Back to Home
          </Link>
        </div>
      </header>
      
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4">
            <button
              className={`py-4 px-4 font-medium border-b-2 ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Video
            </button>
            <button
              className={`py-4 px-4 font-medium border-b-2 ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('manage')}
            >
              Manage Videos
            </button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'upload' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Upload New Video</h2>
            <VideoUpload />
          </div>
        )}
        
        {activeTab === 'manage' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Videos</h2>
            <p className="text-gray-400">
              Video management features coming soon. This will include video listing, editing metadata, and deletion.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}