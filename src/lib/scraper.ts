// Scraper for Union Presse website

import * as cheerio from 'cheerio';

export interface ScrapedArticle {
  url: string;
  title: string;
  summary: string;
  publisher: string;
  image_url: string | null;
  scraped_at: string;
}

const UNION_PRESSE_URL = 'https://www.unionpresse.fr';

export async function scrapeUnionPresse(): Promise<ScrapedArticle[]> {
  try {
    const response = await fetch(UNION_PRESSE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const articles: ScrapedArticle[] = [];

    // Parse article cards from the homepage
    $('article, .node--type-article, .views-row').each((_, element) => {
      const $el = $(element);

      // Try different selectors for title
      const titleEl = $el.find('h2 a, h3 a, .field--name-title a, .node__title a').first();
      const title = titleEl.text().trim();
      const relativeUrl = titleEl.attr('href');

      if (!title || !relativeUrl) return;

      const url = relativeUrl.startsWith('http') ? relativeUrl : `${UNION_PRESSE_URL}${relativeUrl}`;

      // Get summary/teaser
      const summary = $el.find('.field--name-body, .node__content p, .field--type-text-with-summary').first().text().trim().slice(0, 300);

      // Try to extract publisher from title or content
      const publisher = extractPublisher(title);

      // Get image if available
      const imageUrl = $el.find('img').first().attr('src') || null;

      articles.push({
        url,
        title,
        summary: summary || '',
        publisher,
        image_url: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${UNION_PRESSE_URL}${imageUrl}`) : null,
        scraped_at: new Date().toISOString(),
      });
    });

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueArticles = articles.filter(article => {
      if (seen.has(article.url)) return false;
      seen.add(article.url);
      return true;
    });

    return uniqueArticles;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

// Extract publisher name from article title
function extractPublisher(title: string): string {
  // Common patterns: "Publisher does something" or "Something about Publisher"
  const knownPublishers = [
    'Auto Plus', 'Haute Fidélité', 'Libération', 'Premiere', 'AUTOhebdo',
    'L\'Equipe', 'L\'Équipe', 'Voyages & Hôtels de Rêve', 'Le Figaro',
    'Le Monde', 'Paris Match', 'Marie Claire', 'Elle', 'GQ', 'Vogue',
    'Ouest-France', 'Le Parisien', 'Les Echos', 'La Tribune', 'Capital',
    'Challenges', 'L\'Express', 'Le Point', 'Marianne', 'Télérama',
    'Courrier International', 'Sciences et Avenir', 'Ca m\'intéresse',
    'Ça m\'intéresse', 'Geo', 'GEO', 'National Geographic', 'Historia',
    'Première', 'Téléstar', 'Télé 7 Jours', 'TV Magazine', 'Grazia',
    'Closer', 'Voici', 'Gala', 'Public', 'France Football', 'So Foot',
    'Rock & Folk', 'Les Inrockuptibles', 'Technikart', 'Beaux Arts',
    'Connaissance des Arts', 'Art Press', 'Reworld Media', 'Prisma Media',
    'Alternatives Economiques', 'Marie France', 'ELLE', 'Harper\'s Bazaar',
  ];

  for (const publisher of knownPublishers) {
    if (title.toLowerCase().includes(publisher.toLowerCase())) {
      return publisher;
    }
  }

  // Try to extract first capitalized words as publisher
  const match = title.match(/^([A-ZÀ-Ÿ][a-zà-ÿ]*(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]*)*)/);
  if (match && match[1].length > 2) {
    return match[1];
  }

  return 'Non identifié';
}

// Scrape a single article page for more details
export async function scrapeArticleDetails(url: string): Promise<{ fullContent: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Get full article content
    const fullContent = $('.field--name-body, .node__content, article .content')
      .text()
      .trim()
      .slice(0, 2000);

    return { fullContent };
  } catch (error) {
    console.error('Article scraping error:', error);
    return { fullContent: '' };
  }
}
