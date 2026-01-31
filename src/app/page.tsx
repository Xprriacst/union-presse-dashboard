'use client';

import { useEffect, useState } from 'react';
import { Newspaper, RefreshCw, Calendar, TrendingUp, Mail, CheckCircle } from 'lucide-react';
import OpportunityCard from '@/components/OpportunityCard';

interface WeeklyOpportunity {
  article: {
    url: string;
    title: string;
    summary: string;
    publisher: string;
    category: string | null;
    published_date: string;
    scraped_at: string;
  };
  opportunity: {
    id: string;
    article_url: string;
    opportunity_type: string;
    score: number;
    reasoning: string;
    detected_at: string;
  };
  contact: {
    email: string;
    first_name: string;
    last_name: string;
    job_title: string;
    company: string;
    linkedin_url: string | null;
    apollo_id: string | null;
  } | null;
  email: {
    subject: string;
    body: string;
  } | null;
  status: 'pending' | 'sent' | 'ignored';
}

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState<WeeklyOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/opportunities');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setOpportunities(data);
    } catch (err) {
      setError('Impossible de charger les opportunités. Vérifiez la connexion à la base de données.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleSend = async (data: { opportunityId: string; contactEmail: string; subject: string; body: string }) => {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to send email');
  };

  const handleIgnore = async (opportunityId: string) => {
    const response = await fetch('/api/ignore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId }),
    });
    if (!response.ok) throw new Error('Failed to ignore');
  };

  // Calculate stats
  const stats = {
    total: opportunities.length,
    pending: opportunities.filter(o => o.status === 'pending').length,
    sent: opportunities.filter(o => o.status === 'sent').length,
    avgScore: opportunities.length > 0
      ? (opportunities.reduce((acc, o) => acc + o.opportunity.score, 0) / opportunities.length).toFixed(1)
      : '0',
  };

  // Get date range
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateRange = `${weekAgo.toLocaleDateString('fr-FR')} - ${now.toLocaleDateString('fr-FR')}`;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Union Presse</h1>
                <p className="text-sm text-gray-500">Revue hebdomadaire</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{dateRange}</span>
              </div>
              <button
                onClick={fetchOpportunities}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Opportunités</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                <p className="text-sm text-gray-500">Envoyés</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.avgScore}</p>
                <p className="text-sm text-gray-500">Score moyen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Chargement des opportunités...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchOpportunities}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucune opportunité cette semaine</h3>
            <p className="text-gray-500 mt-1">Les nouvelles opportunités apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Opportunités à traiter ({stats.pending})
            </h2>
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.opportunity.id}
                article={opp.article}
                opportunity={opp.opportunity}
                contact={opp.contact}
                email={opp.email}
                status={opp.status}
                onSend={handleSend}
                onIgnore={handleIgnore}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
