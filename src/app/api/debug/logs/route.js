// src/app/api/debug/logs/route.js
import { NextResponse } from 'next/server';
import { getLogs, clearLogs } from '@/lib/ai-generation/logging-service';
import config from '@/lib/config';

/**
 * GET handler to retrieve debug logs
 * Only available in development
 */
export async function GET() {
  if (!config.isDevelopment) {
    return NextResponse.json(
      { error: 'Debug API not available in production' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ logs: getLogs() });
}

/**
 * DELETE handler to clear debug logs
 * Only available in development
 */
export async function DELETE() {
  if (!config.isDevelopment) {
    return NextResponse.json(
      { error: 'Debug API not available in production' },
      { status: 404 }
    );
  }
  
  clearLogs();
  return NextResponse.json({ message: 'Logs cleared' });
}