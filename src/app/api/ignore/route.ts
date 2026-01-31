import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { opportunityId } = await request.json();

    if (!opportunityId) {
      return NextResponse.json({ error: 'Missing opportunity ID' }, { status: 400 });
    }

    // Mark opportunity as ignored by setting score to 0
    await query(`
      UPDATE opportunities
      SET score = 0, reasoning = reasoning || ' [IGNORED BY USER]'
      WHERE id = $1
    `, [opportunityId]);

    return NextResponse.json({ success: true, message: 'Opportunity ignored' });
  } catch (error) {
    console.error('Error ignoring opportunity:', error);
    return NextResponse.json({ error: 'Failed to ignore opportunity' }, { status: 500 });
  }
}
