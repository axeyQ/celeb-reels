// src/lib/ai-generation/service-factory.js
import config from '../config';

// Real service implementations
import { generateScript } from './openai-service';
import { synthesizeSpeech, uploadAudioToS3 } from './polly-service';
import { sourceImages, trackAttribution } from './media-asset-service';
import { compileVideo, performQualityCheck } from './video-compilation-service';

// Mock service implementations
import {
  mockScriptGeneration,
  mockSpeechSynthesis,
  mockS3Upload,
  mockImageSourcing,
  mockVideoCompilation,
  initMockEnvironment
} from './mock-service';

// Initialize services based on configuration
let scriptService;
let speechService;
let imageService;
let videoService;
let attributionService;
let audioUploadService;
let qualityCheckService;

// Determine if we should use mock services
const shouldUseMocks = config.app.useMockServices || config.isDevelopment;

// Initialize the appropriate services
if (shouldUseMocks) {
  console.log('🧪 Using mock AI generation services');
  initMockEnvironment();
  
  scriptService = mockScriptGeneration;
  speechService = mockSpeechSynthesis;
  imageService = mockImageSourcing;
  videoService = mockVideoCompilation;
  audioUploadService = mockS3Upload;
  
  // These don't have specific mocks, so we'll create simple ones
  attributionService = async (params) => {
    console.log('Mock attribution tracking:', params);
    return { success: true, trackingId: `mock-${Date.now()}` };
  };
  
  qualityCheckService = async (videoKey) => {
    console.log('Mock quality check for:', videoKey);
    return { 
      videoKey, 
      status: 'passed',
      checks: [
        { name: 'mock-check-1', status: 'passed' },
        { name: 'mock-check-2', status: 'passed' }
      ]
    };
  };
} else {
  console.log('Using real AI generation services');
  
  scriptService = generateScript;
  speechService = synthesizeSpeech;
  imageService = sourceImages;
  videoService = compileVideo;
  attributionService = trackAttribution;
  audioUploadService = uploadAudioToS3;
  qualityCheckService = performQualityCheck;
}

// Export the appropriate services
export const getScriptService = () => scriptService;
export const getSpeechService = () => speechService;
export const getImageService = () => imageService;
export const getVideoService = () => videoService;
export const getAttributionService = () => attributionService;
export const getAudioUploadService = () => audioUploadService;
export const getQualityCheckService = () => qualityCheckService;

// Helper to get all services
export const getAllServices = () => ({
  scriptService,
  speechService,
  imageService,
  videoService,
  attributionService,
  audioUploadService,
  qualityCheckService,
});