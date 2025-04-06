'use client';

import { useState } from 'react';

export default function VideoUpload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    athlete: '',
    sport: 'Basketball',
    thumbnailUrl: '',
  });
  const [uploadStatus, setUploadStatus] = useState(null);

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a video file');
      return;
    }
    
    if (!formData.title || !formData.athlete) {
      alert('Title and athlete name are required');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    
    try {
      // Create FormData for the upload
      const uploadData = new FormData();
      uploadData.append('video', file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('athlete', formData.athlete);
      uploadData.append('sport', formData.sport);
      uploadData.append('thumbnailUrl', formData.thumbnailUrl);
      
      // Simulate upload progress (in a real app, you'd use XHR or a library with progress support)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Submit the form
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: uploadData,
      });
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      // Set upload complete
      setUploadProgress(100);
      setUploadStatus({
        success: true,
        message: 'Video uploaded successfully!',
        data: result,
      });
      
      // Reset form after successful upload
      setFile(null);
      setFormData({
        title: '',
        description: '',
        athlete: '',
        sport: 'Basketball',
        thumbnailUrl: '',
      });
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading video:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to upload video. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload New Video</h2>
      
      {uploadStatus && (
        <div 
          className={`p-4 mb-6 rounded-md ${
            uploadStatus.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}
        >
          {uploadStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Video file input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Video File <span className="text-red-500">*</span>
          </label>
          <div 
            className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors"
            onClick={() => document.getElementById('video-file').click()}
          >
            {file ? (
              <div className="text-green-400">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-400">Click to select or drop a video file</p>
                <p className="text-sm text-gray-500 mt-1">MP4, WebM, or MOV format recommended</p>
              </div>
            )}
            <input
              id="video-file"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            placeholder="e.g., Michael Jordan: The GOAT Journey"
          />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            placeholder="Brief description of the video..."
            rows="3"
          />
        </div>
        
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
        
        {/* Thumbnail URL (optional) */}
        <div className="space-y-2">
          <label htmlFor="thumbnailUrl" className="block text-sm font-medium">
            Thumbnail URL (optional)
          </label>
          <input
            type="url"
            id="thumbnailUrl"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        {/* Progress bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex justify-between">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${
            isUploading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}