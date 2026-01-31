import { NextResponse } from 'next/server';
import { scrapeUnionPresse } from '@/lib/scraper';

export async function GET() {
  try {
    const articles = await scrapeUnionPresse();

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
      scraped_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Scraping failed'
      },
      { status: 500 }
    );
  }
}
