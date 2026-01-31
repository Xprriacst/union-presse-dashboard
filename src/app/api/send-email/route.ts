import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { opportunityId, contactEmail, subject, body } = await request.json();

    if (!opportunityId || !contactEmail || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email via Apollo API
    const apolloResponse = await fetch('https://api.apollo.io/v1/emailer_campaigns/add_contact_to_campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.APOLLO_API_KEY || '',
      },
      body: JSON.stringify({
        contact_email: contactEmail,
        emailer_campaign_id: 'union-presse-prospection',
        send_email_from_email_account_id: 'default',
        email_subject: subject,
        email_body: body,
      }),
    });

    if (!apolloResponse.ok) {
      const error = await apolloResponse.text();
      console.error('Apollo API error:', error);
      return NextResponse.json({ error: 'Failed to send email via Apollo' }, { status: 500 });
    }

    const apolloData = await apolloResponse.json();

    // Record the sent email in database
    await query(`
      INSERT INTO sent_emails (opportunity_id, contact_email, email_subject, email_body, apollo_campaign_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [opportunityId, contactEmail, subject, body, apolloData.id || 'manual']);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
