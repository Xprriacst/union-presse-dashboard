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

export interface ScoredContact extends HunterContact {
  relevance_score: number;
  relevance_reason: string;
  is_recommended: boolean;
  is_large_company: boolean;
}

export interface HunterResult {
  organization: string | null;
  pattern: string | null;
  estimated_employees: number | null;
  contacts: ScoredContact[];
}

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;

// Positions to EXCLUDE (not relevant for selling automation to publishers)
const EXCLUDED_POSITIONS = [
  'product owner', 'product manager', 'developer', 'développeur', 'engineer',
  'ingénieur', 'designer', 'ux', 'ui', 'qa', 'test', 'devops', 'data analyst',
  'data scientist', 'stagiaire', 'intern', 'assistant', 'assistante',
  'comptable', 'accountant', 'juridique', 'legal', 'avocat', 'lawyer',
  'rh', 'human resources', 'recruiter', 'recruteur', 'talent',
  'support', 'customer service', 'service client'
];

// Ideal positions for SMALL companies (< 50 employees) - target leadership
const SMALL_COMPANY_POSITIONS = [
  { keywords: ['ceo', 'pdg', 'président', 'president', 'fondateur', 'founder', 'co-founder'], score: 100, reason: 'Dirigeant - décideur principal' },
  { keywords: ['directeur général', 'director general', 'general manager', 'dg', 'gérant'], score: 95, reason: 'Direction générale' },
  { keywords: ['directeur', 'director', 'head of'], score: 80, reason: 'Direction' },
  { keywords: ['responsable', 'manager', 'chef'], score: 60, reason: 'Management' },
];

// Ideal positions for LARGE companies (50+ employees) - target commercial/business decision makers
const LARGE_COMPANY_POSITIONS = [
  { keywords: ['directeur commercial', 'sales director', 'chief commercial', 'cco', 'chief revenue'], score: 100, reason: 'Direction commerciale - décideur achat' },
  { keywords: ['directeur marketing', 'marketing director', 'cmo', 'chief marketing'], score: 95, reason: 'Direction marketing' },
  { keywords: ['directeur digital', 'digital director', 'cdo', 'chief digital'], score: 90, reason: 'Direction digitale - sensible à l\'automatisation' },
  { keywords: ['directeur des opérations', 'coo', 'operations director'], score: 85, reason: 'Direction opérations - décideur process' },
  { keywords: ['head of sales', 'head of business', 'head of commercial'], score: 80, reason: 'Responsable commercial' },
  { keywords: ['business development', 'bizdev'], score: 70, reason: 'Développement commercial' },
  { keywords: ['directeur', 'director'], score: 60, reason: 'Direction' },
];

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

// Known large publishers (50+ employees)
const LARGE_PUBLISHERS = [
  'reworldmedia.com', 'prismamedia.com', 'lefigaro.fr', 'lemonde.fr',
  'lequipe.fr', 'liberation.fr', 'lagardere.com', 'ouest-france.fr',
  'cmimedia.fr', 'marieclaire.fr'
];

// Find domain for a publisher
export function getPublisherDomain(publisher: string): string | null {
  if (PUBLISHER_DOMAINS[publisher]) {
    return PUBLISHER_DOMAINS[publisher];
  }

  for (const [name, domain] of Object.entries(PUBLISHER_DOMAINS)) {
    if (publisher.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(publisher.toLowerCase())) {
      return domain;
    }
  }

  return null;
}

// Check if position should be excluded
function isExcludedPosition(position: string | null): boolean {
  if (!position) return false;
  const lower = position.toLowerCase();
  return EXCLUDED_POSITIONS.some(excluded => lower.includes(excluded));
}

// Score a contact based on company size and position
function scoreContact(contact: HunterContact, isLargeCompany: boolean): ScoredContact {
  const position = contact.position?.toLowerCase() || '';

  // Check if excluded
  if (isExcludedPosition(contact.position)) {
    return {
      ...contact,
      relevance_score: 0,
      relevance_reason: '❌ Profil non pertinent pour la vente B2B',
      is_recommended: false,
      is_large_company: isLargeCompany,
    };
  }

  const positionRules = isLargeCompany ? LARGE_COMPANY_POSITIONS : SMALL_COMPANY_POSITIONS;

  for (const rule of positionRules) {
    if (rule.keywords.some(kw => position.includes(kw))) {
      return {
        ...contact,
        relevance_score: rule.score,
        relevance_reason: `✅ ${rule.reason}`,
        is_recommended: rule.score >= 70,
        is_large_company: isLargeCompany,
      };
    }
  }

  // Default score based on seniority
  const seniorityScores: Record<string, number> = {
    'executive': 50,
    'senior': 30,
    'junior': 10,
  };

  const seniorityScore = seniorityScores[contact.seniority || ''] || 20;

  return {
    ...contact,
    relevance_score: seniorityScore,
    relevance_reason: contact.seniority === 'executive'
      ? '⚠️ Profil senior mais fonction non identifiée'
      : '⚠️ Pertinence incertaine - vérifier manuellement',
    is_recommended: false,
    is_large_company: isLargeCompany,
  };
}

// Search for contacts at a company using Hunter.io
export async function findContacts(domain: string): Promise<HunterResult> {
  if (!HUNTER_API_KEY) {
    console.warn('HUNTER_API_KEY not set');
    return { organization: null, pattern: null, estimated_employees: null, contacts: [] };
  }

  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${HUNTER_API_KEY}&limit=10`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Hunter API error:', response.status);
      return { organization: null, pattern: null, estimated_employees: null, contacts: [] };
    }

    const data = await response.json();

    if (!data.data) {
      return { organization: null, pattern: null, estimated_employees: null, contacts: [] };
    }

    const isLargeCompany = LARGE_PUBLISHERS.includes(domain);

    const contacts: ScoredContact[] = (data.data.emails || [])
      .filter((email: any) => email.confidence >= 50)
      .map((email: any) => {
        const baseContact: HunterContact = {
          email: email.value,
          first_name: email.first_name || null,
          last_name: email.last_name || null,
          position: email.position || null,
          linkedin: email.linkedin || null,
          confidence: email.confidence,
          department: email.department || null,
          seniority: email.seniority || null,
        };
        return scoreContact(baseContact, isLargeCompany);
      })
      .filter((c: ScoredContact) => c.relevance_score > 0) // Remove excluded contacts
      .sort((a: ScoredContact, b: ScoredContact) => b.relevance_score - a.relevance_score);

    return {
      organization: data.data.organization || null,
      pattern: data.data.pattern || null,
      estimated_employees: null, // Hunter free doesn't give this
      contacts,
    };
  } catch (error) {
    console.error('Hunter API error:', error);
    return { organization: null, pattern: null, estimated_employees: null, contacts: [] };
  }
}

// Find the best contact for a publisher
export async function findBestContact(publisher: string): Promise<ScoredContact | null> {
  const domain = getPublisherDomain(publisher);

  if (!domain) {
    console.log(`No domain found for publisher: ${publisher}`);
    return null;
  }

  const result = await findContacts(domain);

  if (result.contacts.length === 0) {
    return null;
  }

  // Return highest scored contact
  return result.contacts[0];
}
