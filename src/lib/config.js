// src/lib/config.js

/**
 * Application configuration derived from environment variables
 * with sensible defaults for development
 */
const config = {
    // AWS Configuration
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucketName: process.env.AWS_BUCKET_NAME || 'sports-reels-dev',
    },
    
    // OpenAI Configuration
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
    },
    
    // Lambda Configuration
    lambda: {
      videoCompilerFunction: process.env.VIDEO_COMPILER_LAMBDA || 'sports-reels-video-compiler',
    },
    
    // General Application Settings
    app: {
      maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
      useMockServices: process.env.USE_MOCK_SERVICES === 'true',
      defaultVideoLength: 30, // seconds
      maxVideoLength: 60, // seconds
    },
    
    // Polly Configuration
    polly: {
      defaultVoice: process.env.POLLY_DEFAULT_VOICE || 'Matthew',
      defaultEngine: process.env.POLLY_ENGINE || 'neural',
      defaultFormat: 'mp3',
    },
    
    // Development & Testing
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
  
  // Validation
  if (config.isProduction) {
    const requiredVars = [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_BUCKET_NAME',
      'OPENAI_API_KEY',
    ];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        console.error(`Error: Environment variable ${varName} is required in production`);
        // In a real app, you might want to throw an error or exit the process
      }
    }
  }
  
  export default config;