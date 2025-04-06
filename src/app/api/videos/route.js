import { NextResponse } from 'next/server';
import { mockVideos } from '../../../data/mockVideos';

// GET handler to fetch videos
export async function GET(request) {
  // In a real application, this would fetch from a database or S3
  // For now, we'll use our mock data
  
  // Simulate a slight delay as would happen with a real API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return the mock videos
  return NextResponse.json(mockVideos);
}