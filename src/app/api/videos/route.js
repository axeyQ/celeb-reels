import { NextResponse } from 'next/server';
import { listVideosFromS3, getVideoPresignedUrl, getVideoMetadata } from '@/lib/s3-utils';
import { mockVideos } from '@/data/mockVideos';

// Helper to parse query parameters from request URL
function getQueryParams(request) {
  const url = new URL(request.url);
  return {
    category: url.searchParams.get('category') || 'All',
    limit: parseInt(url.searchParams.get('limit') || '20'),
    offset: parseInt(url.searchParams.get('offset') || '0'),
  };
}

/**
 * GET handler to fetch videos
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - The response with video data
 */
export async function GET(request) {
  try {
    const { category, limit, offset } = getQueryParams(request);
    
    // In development, we can use mock data for testing
    if (process.env.NODE_ENV === 'development') {
      // Filter by category if specified
      const filteredVideos = category === 'All'
        ? mockVideos
        : mockVideos.filter(video => video.sport === category);
      
      // Apply pagination
      const paginatedVideos = filteredVideos.slice(offset, offset + limit);
      
      // Simulate a short delay as would happen with a real API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json({
        videos: paginatedVideos,
        total: filteredVideos.length,
        limit,
        offset,
      });
    }
    
    // In production, fetch from S3
    const allVideos = await listVideosFromS3();
    
    // Process videos to get their metadata and presigned URLs
    const processedVideos = await Promise.all(
      allVideos.map(async (video) => {
        try {
          const metadata = await getVideoMetadata(video.key);
          const url = await getVideoPresignedUrl(video.key);
          
          // Parse the sport category from metadata or filename
          const sport = metadata.metadata?.sport || 'Uncategorized';
          
          return {
            id: video.key.split('/').pop().split('.')[0],
            title: metadata.metadata?.title || 'Untitled Video',
            description: metadata.metadata?.description || '',
            videoUrl: url,
            thumbnailUrl: metadata.metadata?.thumbnailUrl || '',
            duration: metadata.metadata?.duration || '00:00',
            athlete: metadata.metadata?.athlete || 'Unknown Athlete',
            sport: sport,
            views: parseInt(metadata.metadata?.views || '0'),
            likes: parseInt(metadata.metadata?.likes || '0'),
            lastModified: video.lastModified,
          };
        } catch (error) {
          console.error(`Error processing video ${video.key}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any failed video processing and by category if specified
    const filteredVideos = processedVideos
      .filter(video => video !== null)
      .filter(video => category === 'All' || video.sport === category);
    
    // Apply pagination
    const paginatedVideos = filteredVideos.slice(offset, offset + limit);
    
    return NextResponse.json({
      videos: paginatedVideos,
      total: filteredVideos.length,
      limit,
      offset,
    });
    
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}