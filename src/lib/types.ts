export interface Article {
  url: string;
  title: string;
  summary: string;
  publisher: string;
  category: string | null;
  published_date: string;
  scraped_at: string;
}

export interface Opportunity {
  id: string;
  article_url: string;
  opportunity_type: 'prospection_automation' | 'layout_automation';
  score: number;
  reasoning: string;
  detected_at: string;
}

export interface Contact {
  email: string;
  first_name: string;
  last_name: string;
  job_title: string;
  company: string;
  linkedin_url: string | null;
  apollo_id: string | null;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export interface WeeklyOpportunity {
  article: Article;
  opportunity: Opportunity;
  contact: Contact | null;
  email: GeneratedEmail | null;
  status: 'pending' | 'sent' | 'ignored';
}
