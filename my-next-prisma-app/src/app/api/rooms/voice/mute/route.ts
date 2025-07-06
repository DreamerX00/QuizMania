import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, playerId, muted } = await request.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: 'Room ID and player ID required' }, { status: 400 });
    }

    // TODO: Implement voice mute logic via WebSocket server
    // This would typically send a message to the WebSocket server to mute/unmute the player
    
    return NextResponse.json({ 
      success: true, 
      message: `Player ${muted ? 'muted' : 'unmuted'} successfully` 
    });
  } catch (error) {
    console.error('Error updating voice mute status:', error);
    return NextResponse.json({ error: 'Failed to update voice mute status' }, { status: 500 });
  }
} 