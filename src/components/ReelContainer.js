'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import ReelCard from './ReelCard';

export default function ReelContainer({ category = 'All' }) {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/videos');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Function to handle when a video has been viewed
  const handleVideoViewed = (index) => {
    setCurrentVideoIndex(index);
  };

  // Filter videos by category
  const filteredVideos = category === 'All' 
    ? videos 
    : videos.filter(video => video.sport === category);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="text-gray-400">Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black">
      {filteredVideos.length === 0 ? (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-lg text-gray-400">No videos found for {category}</p>
        </div>
      ) : (
        filteredVideos.map((video, index) => (
          <ReelCardWrapper 
            key={video.id} 
            video={video} 
            index={index}
            isActive={index === currentVideoIndex}
            onVideoViewed={handleVideoViewed}
          />
        ))
      )}
    </div>
  );
}

// Wrapper component to handle intersection observer
function ReelCardWrapper({ video, index, isActive, onVideoViewed }) {
  const { ref, inView } = useInView({
    threshold: 0.6, // Consider it in view when 60% visible
    triggerOnce: false,
  });

  // Update current video index when this card comes into view
  useEffect(() => {
    if (inView) {
      onVideoViewed(index);
    }
  }, [inView, index, onVideoViewed]);

  return (
    <div 
      ref={ref} 
      className="h-full w-full snap-start snap-always relative"
    >
      <ReelCard video={video} isPlaying={inView} />
    </div>
  );
}

// Add custom CSS to hide scrollbars while preserving functionality
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Add the style to the document
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarHideStyle;
  document.head.appendChild(style);
}