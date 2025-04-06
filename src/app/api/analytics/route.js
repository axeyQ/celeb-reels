// src/app/api/analytics/route.js
import { NextResponse } from 'next/server';
import { 
  getAnalytics, 
  getTopAthletes, 
  getTopSports, 
  getSuccessRate 
} from '@/lib/ai-generation/analytics-service';

/**
 * GET handler to retrieve analytics data
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    if (type === 'top-athletes') {
      const limit = parseInt(url.searchParams.get('limit') || '10');
      return NextResponse.json(getTopAthletes(limit));
    }
    
    if (type === 'top-sports') {
      const limit = parseInt(url.searchParams.get('limit') || '10');
      return NextResponse.json(getTopSports(limit));
    }
    
    if (type === 'success-rate') {
      return NextResponse.json({ rate: getSuccessRate() });
    }
    
    // Default: return all analytics
    return NextResponse.json(getAnalytics());
    
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}