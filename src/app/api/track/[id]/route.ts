import { NextRequest, NextResponse } from 'next/server';

// 1x1 transparent PNG pixel
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// In-memory store for demo (use Redis/DB in production)
const openedEmails = new Map<string, { opened_at: string; count: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Record the open
  const existing = openedEmails.get(id);
  if (existing) {
    existing.count += 1;
    openedEmails.set(id, existing);
  } else {
    openedEmails.set(id, {
      opened_at: new Date().toISOString(),
      count: 1,
    });
  }

  console.log(`📧 Email opened: ${id} at ${new Date().toISOString()}`);

  // TODO: Update Google Sheets or call n8n webhook to record open
  // await fetch(process.env.N8N_TRACKING_WEBHOOK, {
  //   method: 'POST',
  //   body: JSON.stringify({ tracking_id: id, event: 'opened' }),
  // });

  // Return transparent pixel
  return new NextResponse(TRANSPARENT_PIXEL, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

// API to check if an email was opened
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = openedEmails.get(id);

  return NextResponse.json({
    tracking_id: id,
    opened: !!data,
    ...data,
  });
}
