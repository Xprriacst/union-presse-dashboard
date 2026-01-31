// Demo data for testing the dashboard without Google Sheets connection

export const DEMO_DATA = {
  articles: [
    {
      url: 'https://union-presse.fr/articles/test-magazine-lancement',
      title: 'Test Magazine lance sa nouvelle formule digitale',
      summary: 'Test Magazine annonce une refonte complète de son offre digitale avec un investissement massif dans les outils de production automatisée.',
      publisher: 'Test Magazine',
      category: 'Lancement',
      published_date: '2026-01-31',
      scraped_at: '2026-01-31T10:00:00Z',
    },
    {
      url: 'https://union-presse.fr/articles/figaro-recrute',
      title: 'Le Figaro recrute 10 commerciaux pour accélérer sa croissance digitale',
      summary: 'Le groupe de presse cherche à renforcer ses équipes commerciales face à la concurrence accrue sur le marché publicitaire digital. Cette expansion s\'inscrit dans un plan de transformation digitale ambitieux.',
      publisher: 'Le Figaro',
      category: 'Recrutement',
      published_date: '2026-01-28',
      scraped_at: '2026-01-29T09:00:00Z',
    },
    {
      url: 'https://union-presse.fr/articles/ouest-france-magazine',
      title: 'Ouest-France lance un nouveau magazine mensuel lifestyle',
      summary: 'Le quotidien régional diversifie son offre avec un nouveau titre print nécessitant une équipe éditoriale dédiée. Le magazine sera disponible en kiosque dès mars.',
      publisher: 'Ouest-France',
      category: 'Lancement',
      published_date: '2026-01-27',
      scraped_at: '2026-01-28T09:00:00Z',
    },
    {
      url: 'https://union-presse.fr/articles/marie-claire-transformation',
      title: 'Groupe Marie Claire annonce sa transformation digitale complète',
      summary: 'Le groupe investit 50M€ dans la modernisation de ses outils. Recrutement prévu de 20 profils tech et commercial. Automatisation des processus éditoriaux au programme.',
      publisher: 'Groupe Marie Claire',
      category: 'Stratégie',
      published_date: '2026-01-26',
      scraped_at: '2026-01-27T09:00:00Z',
    },
  ],

  opportunities: [
    {
      id: 'opp-test',
      article_url: 'https://union-presse.fr/articles/test-magazine-lancement',
      article_title: 'Test Magazine lance sa nouvelle formule digitale',
      article_publisher: 'Test Magazine',
      opportunity_type: 'lancement',
      score: 9,
      reasoning: 'Lancement digital = besoin d\'automatisation. Prospect test pour valider la séquence email.',
      detected_at: '2026-01-31T10:05:00Z',
    },
    {
      id: 'opp-001',
      article_url: 'https://union-presse.fr/articles/figaro-recrute',
      article_title: 'Le Figaro recrute 10 commerciaux pour accélérer sa croissance digitale',
      article_publisher: 'Le Figaro',
      opportunity_type: 'prospection_automation',
      score: 8,
      reasoning: 'Recrutement massif de commerciaux = besoin d\'efficacité prospection. Phase de croissance avec pression concurrentielle, timing idéal pour automatisation.',
      detected_at: '2026-01-29T09:05:00Z',
    },
    {
      id: 'opp-002',
      article_url: 'https://union-presse.fr/articles/ouest-france-magazine',
      article_title: 'Ouest-France lance un nouveau magazine mensuel lifestyle',
      article_publisher: 'Ouest-France',
      opportunity_type: 'layout_automation',
      score: 7,
      reasoning: 'Nouveau magazine = nouvelle mise en page régulière. Volume de production augmenté, opportunité d\'automatiser les layouts.',
      detected_at: '2026-01-28T09:05:00Z',
    },
    {
      id: 'opp-003',
      article_url: 'https://union-presse.fr/articles/marie-claire-transformation',
      article_title: 'Groupe Marie Claire annonce sa transformation digitale complète',
      article_publisher: 'Groupe Marie Claire',
      opportunity_type: 'prospection_automation',
      score: 9,
      reasoning: 'Transformation digitale complète avec budget 50M€ et recrutement commercial. Timing parfait pour proposer automatisation prospection.',
      detected_at: '2026-01-27T09:05:00Z',
    },
  ],

  contacts: [
    {
      email: 'xisem85454@juhxs.com',
      first_name: 'Thomas',
      last_name: 'Durand',
      job_title: 'Directeur Digital',
      company: 'Test Magazine',
      linkedin_url: 'https://linkedin.com/in/thomas-durand',
      apollo_id: 'apollo_test',
      relevance_score: 95,
      relevance_reason: '✅ Direction digitale - décideur stratégique pour l\'automatisation',
      is_recommended: true,
      is_large_company: false,
    },
    {
      email: 'jean.dupont@lefigaro.fr',
      first_name: 'Jean',
      last_name: 'Dupont',
      job_title: 'Directeur Commercial',
      company: 'Le Figaro',
      linkedin_url: 'https://linkedin.com/in/jean-dupont',
      apollo_id: 'apollo_001',
    },
    {
      email: 'marie.martin@ouest-france.fr',
      first_name: 'Marie',
      last_name: 'Martin',
      job_title: 'Directrice de la Rédaction',
      company: 'Ouest-France',
      linkedin_url: 'https://linkedin.com/in/marie-martin',
      apollo_id: 'apollo_002',
    },
    {
      email: 'pierre.durand@marieclaire.fr',
      first_name: 'Pierre',
      last_name: 'Durand',
      job_title: 'Chief Digital Officer',
      company: 'Groupe Marie Claire',
      linkedin_url: 'https://linkedin.com/in/pierre-durand',
      apollo_id: 'apollo_003',
    },
  ],

  emails: [
    {
      opportunity_id: 'opp-test',
      subject: 'Test Magazine - votre transformation digitale',
      body: `Bonjour Thomas,

Je vous contacte car j'ai vu l'annonce du lancement de la nouvelle formule digitale de Test Magazine. Une transformation comme celle-ci nécessite souvent de repenser les process de production.

J'imagine que vous cherchez à optimiser les workflows et automatiser les tâches répétitives. C'est exactement ce sur quoi nous accompagnons les éditeurs de presse : automatisation des mises en page, génération de contenus, workflow éditorial.

Est-ce que vous auriez quelques minutes dans la semaine pour échanger ?

Alexandre`,
    },
    {
      opportunity_id: 'opp-001',
      subject: 'Une idée pour votre équipe commerciale',
      body: `Jean,

J'ai vu l'annonce de vos recrutements commerciaux. Avec 10 nouveaux profils à intégrer, vous allez sans doute chercher à maximiser leur efficacité rapidement.

Nous accompagnons des groupes de presse comme le vôtre pour automatiser la prospection : identification des bons contacts, emails personnalisés par IA, relances intelligentes. Nos clients gagnent en moyenne 2h par commercial par jour.

Un call de 15 minutes pour en discuter ?

Alexandre`,
    },
    {
      opportunity_id: 'opp-002',
      subject: 'Automatiser les mises en page du nouveau mag ?',
      body: `Marie,

Félicitations pour le lancement du magazine lifestyle ! Créer une nouvelle identité visuelle et la maintenir sur le long terme, c'est un défi.

Nous avons développé des outils d'IA générative qui automatisent 70% des mises en page courantes, tout en gardant votre charte graphique. Vos équipes se concentrent sur les pages créatives, l'IA gère le reste.

Intéressée par une démo de 15 minutes ?

Alexandre`,
    },
    {
      opportunity_id: 'opp-003',
      subject: 'Votre transformation digitale et la prospection',
      body: `Pierre,

Votre annonce sur la transformation digitale du groupe m'a interpellé. Avec 20 recrutements prévus côté commercial, l'efficacité de la prospection va devenir clé.

Nous avons accompagné des groupes médias similaires pour automatiser leur prospection : IA qui qualifie les leads, emails personnalisés à grande échelle, CRM enrichi automatiquement. Résultat : +40% de rendez-vous qualifiés.

15 minutes pour vous montrer comment ?

Alexandre`,
    },
  ],
};

export function getDemoOpportunities() {
  return DEMO_DATA.opportunities.map(opp => {
    const article = DEMO_DATA.articles.find(a => a.url === opp.article_url);
    const contact = DEMO_DATA.contacts.find(c => c.company === opp.article_publisher) as any;
    const email = DEMO_DATA.emails.find(e => e.opportunity_id === opp.id);

    return {
      article: article || {
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
        score: opp.score,
        reasoning: opp.reasoning,
        detected_at: opp.detected_at,
      },
      contact: contact ? {
        email: contact.email,
        first_name: contact.first_name,
        last_name: contact.last_name,
        job_title: contact.job_title,
        company: contact.company,
        linkedin_url: contact.linkedin_url,
        apollo_id: contact.apollo_id,
        relevance_score: contact.relevance_score,
        relevance_reason: contact.relevance_reason,
        is_recommended: contact.is_recommended,
        is_large_company: contact.is_large_company,
      } : null,
      email: email ? { subject: email.subject, body: email.body } : null,
      status: 'pending' as const,
    };
  });
}
