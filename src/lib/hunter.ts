// Hunter.io API integration for finding contacts

export interface HunterContact {
  email: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  linkedin: string | null;
  confidence: number;
  department: string | null;
  seniority: string | null;
}

export interface HunterResult {
  organization: string | null;
  pattern: string | null;
  contacts: HunterContact[];
}

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;

// Map publisher names to their domains
const PUBLISHER_DOMAINS: Record<string, string> = {
  'Auto Plus': 'reworldmedia.com',
  'AUTOhebdo': 'reworldmedia.com',
  'Reworld Media': 'reworldmedia.com',
  'Haute Fidélité': 'hautefidelite.fr',
  'Libération': 'liberation.fr',
  'Premiere': 'prismamedia.com',
  'Première': 'prismamedia.com',
  'L\'Equipe': 'lequipe.fr',
  'L\'Équipe': 'lequipe.fr',
  'Voyages & Hôtels de Rêve': 'voyagesethoteldereve.fr',
  'Le Figaro': 'lefigaro.fr',
  'Ouest-France': 'ouest-france.fr',
  'Marie Claire': 'marieclaire.fr',
  'Groupe Marie Claire': 'marieclaire.fr',
  'Prisma Media': 'prismamedia.com',
  'GQ': 'prismamedia.com',
  'GQ France': 'prismamedia.com',
  'Capital': 'prismamedia.com',
  'Alternatives Economiques': 'alternatives-economiques.fr',
  'Marie France': 'mariefrance.fr',
  'ELLE': 'lagardere.com',
  'Harper\'s Bazaar': 'cmimedia.fr',
  'Harper\'s Bazaar France': 'cmimedia.fr',
};

// Find domain for a publisher
export function getPublisherDomain(publisher: string): string | null {
  // Direct match
  if (PUBLISHER_DOMAINS[publisher]) {
    return PUBLISHER_DOMAINS[publisher];
  }

  // Partial match
  for (const [name, domain] of Object.entries(PUBLISHER_DOMAINS)) {
    if (publisher.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(publisher.toLowerCase())) {
      return domain;
    }
  }

  return null;
}

// Search for contacts at a company using Hunter.io
export async function findContacts(domain: string): Promise<HunterResult> {
  if (!HUNTER_API_KEY) {
    console.warn('HUNTER_API_KEY not set');
    return { organization: null, pattern: null, contacts: [] };
  }

  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${HUNTER_API_KEY}&limit=5`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Hunter API error:', response.status);
      return { organization: null, pattern: null, contacts: [] };
    }

    const data = await response.json();

    if (!data.data) {
      return { organization: null, pattern: null, contacts: [] };
    }

    const contacts: HunterContact[] = (data.data.emails || [])
      .filter((email: any) => email.confidence >= 50)
      .map((email: any) => ({
        email: email.value,
        first_name: email.first_name || null,
        last_name: email.last_name || null,
        position: email.position || null,
        linkedin: email.linkedin || null,
        confidence: email.confidence,
        department: email.department || null,
        seniority: email.seniority || null,
      }));

    // Sort by seniority (executive > senior > rest) and confidence
    const seniorityOrder: Record<string, number> = {
      'executive': 3,
      'senior': 2,
      'junior': 1,
    };

    contacts.sort((a, b) => {
      const seniorityA = seniorityOrder[a.seniority || ''] || 0;
      const seniorityB = seniorityOrder[b.seniority || ''] || 0;
      if (seniorityB !== seniorityA) return seniorityB - seniorityA;
      return b.confidence - a.confidence;
    });

    return {
      organization: data.data.organization || null,
      pattern: data.data.pattern || null,
      contacts,
    };
  } catch (error) {
    console.error('Hunter API error:', error);
    return { organization: null, pattern: null, contacts: [] };
  }
}

// Find the best contact for a publisher
export async function findBestContact(publisher: string): Promise<HunterContact | null> {
  const domain = getPublisherDomain(publisher);

  if (!domain) {
    console.log(`No domain found for publisher: ${publisher}`);
    return null;
  }

  const result = await findContacts(domain);

  if (result.contacts.length === 0) {
    return null;
  }

  // Prefer sales, marketing, or executive contacts
  const preferredDepartments = ['sales', 'marketing', 'executive', 'communication'];

  for (const dept of preferredDepartments) {
    const contact = result.contacts.find(c =>
      c.department?.toLowerCase() === dept ||
      c.position?.toLowerCase().includes(dept)
    );
    if (contact) return contact;
  }

  // Return highest ranked contact
  return result.contacts[0];
}
