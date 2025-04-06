// src/components/VideoGenerationForm.js
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function VideoGenerationForm() {
  const [formData, setFormData] = useState({
    athlete: '',
    sport: 'Basketball',
    focus: 'career highlights',
    duration: 30,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  
  const sportOptions = [
    'Basketball',
    'Football',
    'Tennis',
    'Baseball',
    'Soccer',
    'Golf',
    'Gymnastics',
    'Track & Field',
  ];
  
  const focusOptions = [
    'career highlights',
    'rookie season',
    'championship moments',
    'comeback story',
    'rivalry with another athlete',
    'training routine',
    'legacy and influence',
    'personal journey',
  ];
  
  const durationOptions = [
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 45, label: '45 seconds' },
    { value: 60, label: '1 minute' },
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.athlete) {
      alert('Please enter an athlete name');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('starting');
    setGeneratedVideo(null);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
        
        // Update status messages based on progress
        if (generationProgress < 20) {
          setGenerationStatus('Generating script...');
        } else if (generationProgress < 40) {
          setGenerationStatus('Creating narration audio...');
        } else if (generationProgress < 60) {
          setGenerationStatus('Sourcing images...');
        } else if (generationProgress < 80) {
          setGenerationStatus('Compiling video...');
        } else {
          setGenerationStatus('Finalizing and uploading...');
        }
      }, 1000);
      
      // Make the actual API call
      const response = await axios.post('/api/generate', formData);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      if (response.data.success) {
        // Set generation complete
        setGenerationProgress(100);
        setGenerationStatus('Video generation complete!');
        setGeneratedVideo(response.data.video);
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setGenerationStatus(`Generation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl overflow-visible">
      <h2 className="text-2xl font-bold mb-6 text-center">Generate AI Sports Reel</h2>
      
      {generatedVideo ? (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold mb-2">{generatedVideo.title}</h3>
          <div className="aspect-[9/16] w-full bg-gray-700 rounded-md overflow-hidden mb-4">
            {/* This would be a video player in production */}
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={generatedVideo.thumbnailUrl || "https://placehold.co/1080x1920/111827/FFFFFF/png?text=Generated+Video"} 
                alt={generatedVideo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-between mb-4">
            <p className="text-gray-300">{generatedVideo.athlete}</p>
            <p className="text-gray-300">{generatedVideo.sport} • {generatedVideo.duration}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(generatedVideo.videoUrl, '_blank')}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={() => setGeneratedVideo(null)}
              className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Athlete Name */}
          <div className="space-y-2">
            <label htmlFor="athlete" className="block text-sm font-medium">
              Athlete Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="athlete"
              name="athlete"
              value={formData.athlete}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              placeholder="e.g., Michael Jordan"
            />
          </div>
          
          {/* Sport */}
          <div className="space-y-2">
            <label htmlFor="sport" className="block text-sm font-medium">
              Sport
            </label>
            <select
              id="sport"
              name="sport"
              value={formData.sport}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              {sportOptions.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>
          
          {/* Focus */}
          <div className="space-y-2">
            <label htmlFor="focus" className="block text-sm font-medium">
              Content Focus
            </label>
            <select
              id="focus"
              name="focus"
              value={formData.focus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              {focusOptions.map((focus) => (
                <option key={focus} value={focus}>
                  {focus.charAt(0).toUpperCase() + focus.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-medium">
              Video Duration
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Progress bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="text-sm font-medium flex justify-between">
                <span>{generationStatus}</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-md font-medium text-white ${
              isGenerating
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Video'}
          </button>

          {/* Helper text */}
          <p className="text-xs text-gray-400 text-center mt-2">
            AI will generate a script, narration, and source relevant images to compile the video automatically.
          </p>
        </form>
      )}
    </div>
  );
}