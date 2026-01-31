import { NextResponse } from 'next/server';
import { getDemoOpportunities } from '@/lib/demo-data';
import { getSheetData, rowsToObjects } from '@/lib/google-sheets';
import { scrapeUnionPresse, ScrapedArticle } from '@/lib/scraper';
import { findBestContact, getPublisherDomain } from '@/lib/hunter';

interface Article {
  url: string;
  title: string;
  summary: string;
  publisher: string;
  category: string;
  published_date: string;
  scraped_at: string;
}

interface Opportunity {
  id: string;
  article_url: string;
  article_title: string;
  article_publisher: string;
  opportunity_type: string;
  score: string;
  reasoning: string;
  detected_at: string;
}

interface Contact {
  email: string;
  first_name: string;
  last_name: string;
  job_title: string;
  company: string;
  linkedin_url: string;
  apollo_id: string;
}

interface SentEmail {
  id: string;
  opportunity_id: string;
  contact_email: string;
  email_subject: string;
  email_body: string;
  sent_at: string;
}

// Detect opportunity type and score from article content
function detectOpportunity(article: ScrapedArticle): { type: string; score: number; reasoning: string } | null {
  const text = `${article.title} ${article.summary}`.toLowerCase();

  // Keywords for different opportunity types
  const patterns = [
    {
      type: 'nouvelle_formule',
      keywords: ['nouvelle formule', 'nouveau format', 'refonte', 'modernise', 'réinvente'],
      score: 8,
      reasoning: 'Nouvelle formule = besoin potentiel d\'outils de mise en page et production.',
    },
    {
      type: 'lancement',
      keywords: ['lance', 'lancement', 'nouveau magazine', 'nouveau titre', 'nouvelle publication'],
      score: 9,
      reasoning: 'Lancement = équipes en croissance, besoin d\'efficacité opérationnelle.',
    },
    {
      type: 'recrutement',
      keywords: ['recrute', 'recrutement', 'embauche', 'recherche', 'poste'],
      score: 7,
      reasoning: 'Recrutement = phase de croissance, opportunité d\'automatisation.',
    },
    {
      type: 'transformation_digitale',
      keywords: ['digital', 'transformation', 'numérique', 'tech', 'innovation'],
      score: 9,
      reasoning: 'Transformation digitale = budget disponible pour nouveaux outils.',
    },
    {
      type: 'evenement',
      keywords: ['jeux olympiques', 'jo', 'coupe du monde', 'élection', 'événement'],
      score: 6,
      reasoning: 'Événement majeur = pic d\'activité, besoin d\'efficacité.',
    },
    {
      type: 'prix_augmentation',
      keywords: ['augmente', 'prix', 'hausse', 'euro'],
      score: 5,
      reasoning: 'Hausse de prix = recherche de valeur ajoutée pour justifier le tarif.',
    },
    {
      type: 'hors_serie',
      keywords: ['hors-série', 'hors série', 'spécial', 'collector', 'numéro spécial'],
      score: 6,
      reasoning: 'Hors-série = production supplémentaire, opportunité d\'automatisation.',
    },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some(kw => text.includes(kw))) {
      return {
        type: pattern.type,
        score: pattern.score,
        reasoning: pattern.reasoning,
      };
    }
  }

  return null;
}

// Generate email suggestion based on opportunity
function generateEmailSuggestion(
  article: ScrapedArticle,
  opportunityType: string,
  contact?: { first_name: string | null; last_name: string | null } | null
): { subject: string; body: string } {
  const publisherName = article.publisher;
  const firstName = contact?.first_name || '';
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';

  // Structure: Introduction (Je vous contacte car) + Proposition (J'imagine que) + CTA (Est-ce que vous auriez)
  const templates: Record<string, { subject: string; body: string }> = {
    nouvelle_formule: {
      subject: `${publisherName} - nouvelle formule`,
      body: `${greeting}

Je vous contacte car j'ai vu l'annonce de la nouvelle formule de ${publisherName}. Une refonte éditoriale est souvent synonyme de nouveaux process à mettre en place.

J'imagine que vous cherchez à optimiser les workflows de production pour cette nouvelle version — c'est exactement ce sur quoi nous accompagnons les éditeurs de presse : automatisation des mises en page, génération de contenus, workflow éditorial.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
    lancement: {
      subject: `${publisherName} - nouveau lancement`,
      body: `${greeting}

Je vous contacte car j'ai appris le lancement de votre nouveau titre chez ${publisherName}. Félicitations !

J'imagine que la montée en charge de la production va être un enjeu clé dans les prochaines semaines. Nous accompagnons des éditeurs comme vous pour automatiser les tâches répétitives et gagner du temps sur ce qui compte : le contenu.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
    recrutement: {
      subject: `${publisherName} - vos recrutements`,
      body: `${greeting}

Je vous contacte car j'ai vu que ${publisherName} est en phase de recrutement. Intégrer de nouvelles équipes, c'est toujours un moment clé.

J'imagine que vous cherchez à maximiser rapidement leur efficacité. Nous accompagnons des éditeurs pour automatiser les tâches répétitives — nos clients gagnent en moyenne 2h par jour et par collaborateur.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
    transformation_digitale: {
      subject: `${publisherName} - transformation digitale`,
      body: `${greeting}

Je vous contacte car votre projet de transformation digitale chez ${publisherName} a retenu mon attention.

J'imagine que vous êtes en train de repenser vos outils et process. C'est exactement le bon moment pour intégrer de l'automatisation intelligente. Nous avons accompagné des groupes média similaires avec des résultats mesurables.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
    evenement: {
      subject: `${publisherName} - couverture événementielle`,
      body: `${greeting}

Je vous contacte car j'ai vu que ${publisherName} prépare une couverture événementielle importante.

J'imagine que ces pics d'activité demandent une organisation sans faille. Nous aidons les rédactions à automatiser les tâches répétitives pour se concentrer sur le terrain et la qualité éditoriale.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
    prix_augmentation: {
      subject: `${publisherName} - évolution tarifaire`,
      body: `${greeting}

Je vous contacte car j'ai remarqué l'évolution tarifaire de ${publisherName}.

J'imagine que vous cherchez à renforcer la valeur perçue par vos lecteurs. L'automatisation des process permet de réinvestir du temps dans ce qui fait la différence : la qualité du contenu et l'expérience lecteur.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
    hors_serie: {
      subject: `${publisherName} - hors-série`,
      body: `${greeting}

Je vous contacte car j'ai vu la sortie de votre nouveau hors-série chez ${publisherName}.

J'imagine que la production de ces numéros spéciaux mobilise beaucoup de ressources. Nous accompagnons des éditeurs pour automatiser les tâches répétitives et libérer du temps pour la création.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
    default: {
      subject: `${publisherName} - actualités`,
      body: `${greeting}

Je vous contacte car j'ai lu avec intérêt les dernières actualités de ${publisherName}.

J'imagine que l'optimisation des process est un sujet pour vous. Nous accompagnons les éditeurs de presse dans leur transformation : automatisation, IA générative, optimisation des workflows.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
  };

  return templates[opportunityType] || templates.default;
}

export async function GET() {
  // Demo mode - return mock data
  if (process.env.DEMO_MODE === 'true') {
    console.log('Using demo data');
    return NextResponse.json(getDemoOpportunities());
  }

  // Scrape mode - fetch directly from Union Presse
  if (process.env.SCRAPE_MODE === 'true' || !process.env.GOOGLE_SHEET_ID) {
    console.log('Using live scraping');
    try {
      const articles = await scrapeUnionPresse();

      // Get unique publishers and fetch contacts
      const publishers = [...new Set(articles.map(a => a.publisher))];
      const contactsCache: Record<string, any> = {};

      // Fetch contacts for each publisher (in parallel, limited)
      await Promise.all(
        publishers.slice(0, 10).map(async (publisher) => {
          const domain = getPublisherDomain(publisher);
          if (domain && !contactsCache[domain]) {
            const contact = await findBestContact(publisher);
            if (contact) {
              contactsCache[publisher] = contact;
            }
          }
        })
      );

      const opportunities = articles
        .map((article, index) => {
          const opp = detectOpportunity(article);
          if (!opp) return null;

          const contact = contactsCache[article.publisher];
          const email = generateEmailSuggestion(article, opp.type, contact);

          return {
            article: {
              url: article.url,
              title: article.title,
              summary: article.summary,
              publisher: article.publisher,
              category: opp.type,
              published_date: '',
              scraped_at: article.scraped_at,
              image_url: article.image_url,
            },
            opportunity: {
              id: `opp-${index + 1}`,
              article_url: article.url,
              opportunity_type: opp.type,
              score: opp.score,
              reasoning: opp.reasoning,
              detected_at: article.scraped_at,
            },
            contact: contact ? {
              email: contact.email,
              first_name: contact.first_name,
              last_name: contact.last_name,
              job_title: contact.position,
              company: article.publisher,
              linkedin_url: contact.linkedin,
              relevance_score: contact.relevance_score,
              relevance_reason: contact.relevance_reason,
              is_recommended: contact.is_recommended,
              is_large_company: contact.is_large_company,
            } : null,
            email: {
              subject: email.subject,
              body: email.body,
            },
            status: 'pending' as const,
          };
        })
        .filter(Boolean);

      // Sort by score descending
      opportunities.sort((a, b) => (b?.opportunity.score || 0) - (a?.opportunity.score || 0));

      return NextResponse.json(opportunities);
    } catch (error) {
      console.error('Scraping error:', error);
      return NextResponse.json(getDemoOpportunities());
    }
  }

  // Google Sheets mode
  try {
    const [articlesRows, opportunitiesRows, contactsRows, sentEmailsRows] = await Promise.all([
      getSheetData('Articles'),
      getSheetData('Opportunities'),
      getSheetData('Contacts'),
      getSheetData('Sent_Emails'),
    ]);

    const articles = rowsToObjects<Article>(articlesRows);
    const opportunities = rowsToObjects<Opportunity>(opportunitiesRows);
    const contacts = rowsToObjects<Contact>(contactsRows);
    const sentEmails = rowsToObjects<SentEmail>(sentEmailsRows);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOpportunities = opportunities.filter(opp => {
      const detectedAt = new Date(opp.detected_at);
      return detectedAt >= sevenDaysAgo;
    });

    const result = recentOpportunities.map(opp => {
      const article = articles.find(a => a.url === opp.article_url);
      const contact = contacts.find(c => c.company === opp.article_publisher);
      const sentEmail = sentEmails.find(e => e.opportunity_id === opp.id);

      return {
        article: article ? {
          url: article.url,
          title: article.title,
          summary: article.summary,
          publisher: article.publisher,
          category: article.category || null,
          published_date: article.published_date,
          scraped_at: article.scraped_at,
        } : {
          url: opp.article_url,
          title: opp.article_title,
          summary: '',
          publisher: opp.article_publisher,
          category: null,
          published_date: '',
          scraped_at: opp.detected_at,
        },
        opportunity: {
          id: opp.id,
          article_url: opp.article_url,
          opportunity_type: opp.opportunity_type,
          score: parseInt(opp.score) || 0,
          reasoning: opp.reasoning,
          detected_at: opp.detected_at,
        },
        contact: contact ? {
          email: contact.email,
          first_name: contact.first_name,
          last_name: contact.last_name,
          job_title: contact.job_title,
          company: contact.company,
          linkedin_url: contact.linkedin_url || null,
          apollo_id: contact.apollo_id || null,
        } : null,
        email: sentEmail ? {
          subject: sentEmail.email_subject,
          body: sentEmail.email_body,
        } : null,
        status: sentEmail ? 'sent' : 'pending',
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    console.log('Falling back to demo data');
    return NextResponse.json(getDemoOpportunities());
  }
}
