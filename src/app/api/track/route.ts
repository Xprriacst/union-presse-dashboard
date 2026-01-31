import { NextRequest, NextResponse } from 'next/server';

// Shared tracking store (in production, use Redis/DB)
// For now, we'll use Google Sheets via the existing integration

interface TrackingRecord {
  tracking_id: string;
  opportunity_id: string;
  contact_email: string;
  email_type: 'initial' | 'followup';
  sent_at: string;
  opened_at: string | null;
  open_count: number;
}

// In-memory store for demo
const trackingRecords = new Map<string, TrackingRecord>();

// Get all tracking records
export async function GET() {
  const records = Array.from(trackingRecords.values());
  return NextResponse.json(records);
}

// Create a new tracking record
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { opportunity_id, contact_email, email_type } = body;

  // Generate unique tracking ID
  const tracking_id = `trk_${opportunity_id}_${email_type}_${Date.now()}`;

  const record: TrackingRecord = {
    tracking_id,
    opportunity_id,
    contact_email,
    email_type: email_type || 'initial',
    sent_at: new Date().toISOString(),
    opened_at: null,
    open_count: 0,
  };

  trackingRecords.set(tracking_id, record);

  // Generate the tracking pixel URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pixel_url = `${baseUrl}/api/track/${tracking_id}`;

  return NextResponse.json({
    ...record,
    pixel_url,
    pixel_html: `<img src="${pixel_url}" width="1" height="1" style="display:none" alt="" />`,
  });
}
