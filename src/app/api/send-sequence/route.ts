import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_SEQUENCE_WEBHOOK;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      opportunity_id,
      contact_email,
      contact_first_name,
      contact_last_name,
      company,
      email_subject,
      email_body,
      article_title,
      article_url,
    } = body;

    // Generate tracking ID
    const tracking_id = `trk_${opportunity_id}_${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const pixel_url = `${baseUrl}/api/track/${tracking_id}`;

    // Add tracking pixel to email body
    const emailWithPixel = `${email_body}

<img src="${pixel_url}" width="1" height="1" style="display:none" alt="" />`;

    // Prepare follow-up email
    const followupSubject = `Re: ${email_subject}`;
    const followupBody = `Bonjour ${contact_first_name || ''},

Je me permets de vous relancer suite à mon précédent message concernant ${company}.

Avez-vous eu l'occasion d'y jeter un œil ?

Je reste disponible si vous souhaitez en discuter.

Alexandre

<img src="${baseUrl}/api/track/trk_${opportunity_id}_followup_${Date.now()}" width="1" height="1" style="display:none" alt="" />`;

    // Trigger n8n workflow
    if (N8N_WEBHOOK_URL) {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id,
          tracking_id,
          contact: {
            email: contact_email,
            first_name: contact_first_name,
            last_name: contact_last_name,
            company,
          },
          initial_email: {
            subject: email_subject,
            body: emailWithPixel,
          },
          followup_email: {
            subject: followupSubject,
            body: followupBody,
            delay_days: 4,
          },
          article: {
            title: article_title,
            url: article_url,
          },
          pixel_url,
        }),
      });

      if (!n8nResponse.ok) {
        throw new Error(`n8n webhook failed: ${n8nResponse.status}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Sequence triggered',
        tracking_id,
        n8n_triggered: true,
      });
    }

    // If no n8n webhook configured, return the prepared data
    return NextResponse.json({
      success: true,
      message: 'Sequence prepared (n8n not configured)',
      tracking_id,
      pixel_url,
      n8n_triggered: false,
      prepared_data: {
        initial_email: {
          to: contact_email,
          subject: email_subject,
          body: emailWithPixel,
        },
        followup_email: {
          to: contact_email,
          subject: followupSubject,
          body: followupBody,
          send_after_days: 4,
        },
      },
    });
  } catch (error) {
    console.error('Send sequence error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
