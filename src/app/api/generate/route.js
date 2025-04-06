// src/app/api/generate/route.js
import { NextResponse } from 'next/server';
import { generateScript } from '@/lib/ai-generation/openai-service';
import { synthesizeSpeech, enhanceScriptWithSSML, uploadAudioToS3 } from '@/lib/ai-generation/polly-service';
import { sourceImages, trackAttribution } from '@/lib/ai-generation/media-asset-service';
import { compileVideo, performQualityCheck } from '@/lib/ai-generation/video-compilation-service';

/**
 * POST handler to generate a video using AI
 * @param {Request} request - The incoming request with JSON body
 * @returns {Promise<NextResponse>} - The response with generation status
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { athlete, sport, focus, duration } = body;
    
    // Validate required parameters
    if (!athlete || !sport) {
      return NextResponse.json(
        { error: 'Missing required parameters: athlete and sport are required' },
        { status: 400 }
      );
    }
    
    // Step 1: Generate script
    const scriptResult = await generateScript({
      athlete,
      sport,
      focus: focus || 'career highlights',
      duration: duration || 30,
    });
    
    // Step 2: Convert script to speech
    const enhancedScript = enhanceScriptWithSSML(scriptResult.script);
    const audioBuffer = await synthesizeSpeech({
      text: enhancedScript,
      voiceId: 'Matthew', // You could select different voices based on content
    });
    
    // Upload audio to S3
    const audioFileName = `${athlete.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.mp3`;
    const audioUrl = await uploadAudioToS3(audioBuffer, audioFileName);
    
    // Step 3: Source images
    const images = await sourceImages({
      searchTerms: scriptResult.imageSearchTerms,
      athlete,
      sport,
      count: 15, // More than needed to allow for selection
    });
    
    // Step 4: Compile video
    const title = scriptResult.titleOptions[0] || `${athlete}'s ${sport} Highlights`;
    const videoResult = await compileVideo({
      script: scriptResult.script,
      audioUrl,
      images,
      title,
      athlete,
      sport,
      musicStyle: scriptResult.musicSuggestion,
    });
    
    // Step 5: Track attribution for used images
    await trackAttribution({
      images,
      videoId: videoResult.id,
    });
    
    // Step 6: Perform quality check
    const qualityCheck = await performQualityCheck(videoResult.id);
    
    // Return the result
    return NextResponse.json({
      success: true,
      message: 'Video generated successfully',
      video: {
        id: videoResult.id,
        title: videoResult.title,
        videoUrl: videoResult.videoUrl,
        thumbnailUrl: videoResult.thumbnailUrl,
        duration: videoResult.duration,
        athlete,
        sport,
        generatedAt: new Date().toISOString(),
      },
      qualityStatus: qualityCheck.overall,
    });
    
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve generation status
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - The response with generation status
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing video ID parameter' },
        { status: 400 }
      );
    }
    
    // In a real implementation, we would check a database or queue for the status
    // For demo purposes, we'll return a mock status
    
    return NextResponse.json({
      id,
      status: 'completed', // Options: pending, processing, completed, failed
      progress: 100,
      message: 'Video generation complete',
      completedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error checking generation status:', error);
    return NextResponse.json(
      { error: 'Failed to check generation status' },
      { status: 500 }
    );
  }
}