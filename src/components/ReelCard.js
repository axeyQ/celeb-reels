'use client';

import { useRef, useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';

export default function ReelCard({ video, isPlaying }) {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasShownHint, setHasShownHint] = useState(false);

  // Handle video play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
      
      // Show controls initially, then hide after 3 seconds
      setShowControls(true);
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isPlaying]);

  // Show swipe hint only once
  useEffect(() => {
    // If playing and hint hasn't been shown yet
    if (isPlaying && !hasShownHint) {
      // Set local state to true to avoid showing hint again
      setHasShownHint(true);
      
      // Also store in localStorage for persistence across sessions
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('swipeHintShown', 'true');
        }
      } catch (error) {
        // Handle potential localStorage errors
        console.log('Could not access localStorage');
      }
    }
  }, [isPlaying, hasShownHint]);

  // Handle video load event
  const handleVideoLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle video time update to update progress bar
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle like
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Format view count with K/M suffix
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  // Handle swipe gestures
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => console.log('Swiped up to next video'),
    onSwipedDown: () => console.log('Swiped down to previous video'),
    onTap: () => toggleControls(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // Check if hint should be shown
  const shouldShowHint = () => {
    if (!isPlaying || hasShownHint) return false;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return !localStorage.getItem('swipeHintShown');
      }
      return true;
    } catch (e) {
      return true; // If localStorage fails, default to showing the hint
    }
  };

  return (
    <div 
      {...swipeHandlers}
      className="relative h-full w-full flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-700 h-16 w-16 mb-4"></div>
            <div className="h-2 bg-gray-700 rounded w-48 mb-2.5"></div>
            <div className="h-2 bg-gray-700 rounded w-40"></div>
          </div>
        </div>
      )}

      {/* Full-screen video player */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="h-full w-full object-cover absolute inset-0"
        playsInline
        loop
        muted={isMuted}
        onLoadedData={handleVideoLoad}
        onTimeUpdate={handleTimeUpdate}
        poster={video.thumbnailUrl}
      />

      {/* Gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none"></div>

      {/* Video information overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-start mb-3">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold line-clamp-1">{video.title}</h2>
            <p className="text-sm text-gray-300 mt-1 font-medium">{video.athlete}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatViewCount(video.views)} views</p>
            
            <p className="text-sm mt-3 line-clamp-2 text-gray-100">{video.description}</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1 mt-4 bg-gray-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Right side controls */}
      <div className={`absolute right-4 bottom-24 flex flex-col items-center space-y-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={toggleLike}
          className="flex flex-col items-center"
          aria-label="Like video"
        >
          <div className={`p-2 rounded-full bg-black/30 backdrop-blur-sm ${isLiked ? 'text-red-500' : 'text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xs font-medium mt-1">{isLiked ? video.likes + 1 : video.likes}</span>
        </button>
        
        <button 
          onClick={toggleMute}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
        
        <button 
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label="Share"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
      
      {/* Sport badge */}
      <div className="absolute top-20 left-4 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-md">
        <span className="text-xs font-medium">{video.sport}</span>
      </div>
      
      {/* Swipe indicator - using the shouldShowHint helper function */}
      {shouldShowHint() && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="text-center space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <p className="text-lg font-medium">Swipe up for next video</p>
          </div>
        </div>
      )}
    </div>
  );
}