// src/lib/ai-generation/mock-service.js
/**
 * Mock services for testing the video generation pipeline without actual AWS dependencies
 * This can be used during development or in test environments
 */

/**
 * Mock OpenAI script generation service
 */
export async function mockScriptGeneration({ athlete, sport, focus, duration }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const script = `
  [TIME 00:00] In the world of ${sport}, few names resonate as powerfully as ${athlete}.
  
  [TIME 00:05] Born with natural talent and an unrelenting work ethic, ${athlete}'s journey to greatness began in their early years.
  
  [TIME 00:10] Their ${focus} showcased a rare combination of skill, determination, and competitive spirit.
  
  [TIME 00:15] Critics and fans alike watched in awe as records fell and expectations were shattered.
  
  [TIME 00:20] Through challenges and setbacks, ${athlete} demonstrated the heart of a true champion.
  
  [TIME 00:25] Today, their legacy stands as a testament to what can be achieved through dedication and passion.
  
  [TIME 00:30] ${athlete} - a name forever etched in the annals of ${sport} history.
  `;
  
    const imageSearchTerms = [
      `${athlete} action shot ${sport}`,
      `${athlete} championship moment`,
      `${athlete} training`,
      `${athlete} career highlight`,
      `${athlete} victory celebration`,
    ];
  
    const titleOptions = [
      `${athlete}: The Extraordinary Journey`,
      `Rise of a Legend: ${athlete}'s Story`,
      `${athlete}'s Path to Greatness`,
    ];
  
    return {
      script,
      imageSearchTerms,
      titleOptions,
      musicSuggestion: 'Inspirational orchestral with building dynamics',
      athlete,
      sport,
      focus,
      targetDuration: duration,
      generatedAt: new Date().toISOString(),
    };
  }
  
  /**
   * Mock Amazon Polly TTS service
   */
  export async function mockSpeechSynthesis({ text }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real implementation, this would return audio data
    // For testing, we'll return a mock buffer
    return Buffer.from('Mock audio data');
  }
  
  /**
   * Mock S3 upload service
   */
  export async function mockS3Upload(data, key, contentType) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock S3 URL
    const mockUrl = `https://mock-bucket.s3.amazonaws.com/${key}`;
    
    console.log(`Mock S3 upload: ${key} (${contentType})`);
    
    return {
      url: mockUrl,
      key,
      contentType,
      uploadedAt: new Date().toISOString(),
    };
  }
  
  /**
   * Mock image sourcing service
   */
  export async function mockImageSourcing({ searchTerms, athlete, sport, count }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const images = [];
    
    // Create mock image data
    for (let i = 0; i < count; i++) {
      const searchTerm = searchTerms[i % searchTerms.length];
      const id = `img_${Date.now()}_${i}`;
      
      images.push({
        id,
        searchTerm,
        originalUrl: `https://placehold.co/1080x1920/111827/FFFFFF/png?text=${encodeURIComponent(searchTerm)}`,
        processedUrl: `https://mock-bucket.s3.amazonaws.com/images/${athlete.replace(/\s+/g, '-').toLowerCase()}/${id}.jpg`,
        athlete,
        sport,
        sourceType: 'mock',
        attribution: 'Mock Image Service',
        licenseInfo: 'Mock License',
        timestamp: new Date().toISOString(),
      });
    }
    
    return images;
  }
  
  /**
   * Mock video compilation service
   */
  export async function mockVideoCompilation(options) {
    // Simulate API delay for a longer process
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    const { title, athlete, sport, images } = options;
    
    // Create a mock video result
    return {
      id: `video-${Date.now()}`,
      title,
      athlete,
      sport,
      videoUrl: `https://mock-bucket.s3.amazonaws.com/videos/${athlete.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.mp4`,
      thumbnailUrl: images[0]?.processedUrl || '',
      duration: '00:30',
      metadata: {
        title,
        description: `AI-generated highlight reel featuring ${athlete}'s career in ${sport}`,
        athlete,
        sport,
        uploadedAt: new Date().toISOString(),
        views: '0',
        likes: '0',
      },
      status: 'completed',
    };
  }
  
  /**
   * Initialize the mock environment
   * This replaces actual service connections with mock versions for testing
   */
  export function initMockEnvironment() {
    console.log('🧪 Mock environment initialized for testing');
    
    // In a real implementation, you could use dependency injection
    // or module mocking to replace the actual services with these mocks
    
    return {
      generateScript: mockScriptGeneration,
      synthesizeSpeech: mockSpeechSynthesis,
      uploadToS3: mockS3Upload,
      sourceImages: mockImageSourcing,
      compileVideo: mockVideoCompilation,
    };
  }
  
  /**
   * Test the full video generation pipeline using mock services
   */
  export async function testGenerationPipeline({ athlete, sport, focus, duration }) {
    console.log(`🧪 Testing generation pipeline for ${athlete} (${sport})`);
    
    try {
      // Step 1: Generate script
      console.log('Step 1: Generating script...');
      const scriptResult = await mockScriptGeneration({ athlete, sport, focus, duration });
      console.log('✅ Script generation complete');
      
      // Step 2: Convert script to speech
      console.log('Step 2: Converting script to speech...');
      const audioBuffer = await mockSpeechSynthesis({ text: scriptResult.script });
      const audioUrl = (await mockS3Upload(
        audioBuffer,
        `audio/${athlete.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.mp3`,
        'audio/mp3'
      )).url;
      console.log('✅ Speech synthesis complete');
      
      // Step 3: Source images
      console.log('Step 3: Sourcing images...');
      const images = await mockImageSourcing({
        searchTerms: scriptResult.imageSearchTerms,
        athlete,
        sport,
        count: 10,
      });
      console.log('✅ Image sourcing complete');
      
      // Step 4: Compile video
      console.log('Step 4: Compiling video...');
      const title = scriptResult.titleOptions[0];
      const videoResult = await mockVideoCompilation({
        script: scriptResult.script,
        audioUrl,
        images,
        title,
        athlete,
        sport,
        musicStyle: scriptResult.musicSuggestion,
      });
      console.log('✅ Video compilation complete');
      
      // Return the complete result
      return {
        success: true,
        message: 'Test video generation completed successfully',
        video: videoResult,
        processingTime: {
          scriptGeneration: '2.0s',
          speechSynthesis: '3.0s',
          imageSourcing: '4.0s',
          videoCompilation: '8.0s',
          total: '17.0s',
        },
      };
    } catch (error) {
      console.error('❌ Test generation pipeline failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }