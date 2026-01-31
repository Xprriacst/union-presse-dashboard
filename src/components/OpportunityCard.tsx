'use client';

import { useState } from 'react';
import { Send, X, Edit3, CheckCircle, ExternalLink, User, Mail, Building } from 'lucide-react';

interface Article {
  url: string;
  title: string;
  summary: string;
  publisher: string;
  published_date: string;
}

interface Opportunity {
  id: string;
  opportunity_type: string;
  score: number;
  reasoning: string;
}

interface Contact {
  email: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  company: string;
  linkedin_url: string | null;
  relevance_score?: number;
  relevance_reason?: string;
  is_recommended?: boolean;
  is_large_company?: boolean;
}

interface Email {
  subject: string;
  body: string;
}

interface Props {
  article: Article;
  opportunity: Opportunity;
  contact: Contact | null;
  email: Email | null;
  status: 'pending' | 'sent' | 'ignored';
  onSend: (data: {
    opportunityId: string;
    contactEmail: string;
    contactFirstName?: string;
    contactLastName?: string;
    company?: string;
    subject: string;
    body: string;
    articleTitle?: string;
    articleUrl?: string;
  }) => Promise<void>;
  onIgnore: (opportunityId: string) => Promise<void>;
}

export default function OpportunityCard({ article, opportunity, contact, email, status, onSend, onIgnore }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(email?.subject || '');
  const [editedBody, setEditedBody] = useState(email?.body || '');
  const [isSending, setIsSending] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);

  const opportunityLabels: Record<string, string> = {
    nouvelle_formule: 'Nouvelle formule',
    lancement: 'Lancement',
    recrutement: 'Recrutement',
    transformation_digitale: 'Digital',
    evenement: 'Événement',
    prix_augmentation: 'Prix',
    hors_serie: 'Hors-série',
    prospection_automation: 'Prospection',
    layout_automation: 'Layout',
  };
  const opportunityLabel = opportunityLabels[opportunity.opportunity_type] || opportunity.opportunity_type;

  const scoreColor = opportunity.score >= 8
    ? 'text-green-600 bg-green-100'
    : opportunity.score >= 6
    ? 'text-yellow-600 bg-yellow-100'
    : 'text-gray-600 bg-gray-100';

  const handleSend = async () => {
    if (!contact || !email) return;
    setIsSending(true);
    try {
      await onSend({
        opportunityId: opportunity.id,
        contactEmail: contact.email,
        contactFirstName: contact.first_name || undefined,
        contactLastName: contact.last_name || undefined,
        company: contact.company,
        subject: isEditing ? editedSubject : email.subject,
        body: isEditing ? editedBody : email.body,
        articleTitle: article.title,
        articleUrl: article.url,
      });
      setLocalStatus('sent');
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleIgnore = async () => {
    try {
      await onIgnore(opportunity.id);
      setLocalStatus('ignored');
    } catch (error) {
      console.error('Failed to ignore:', error);
    }
  };

  if (localStatus === 'sent') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 opacity-75">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Séquence lancée pour {contact?.first_name || ''} {contact?.last_name || ''}</span>
        </div>
        <p className="text-sm text-green-600 mt-1">{article.title}</p>
        <p className="text-xs text-green-500 mt-2">📧 Email initial envoyé • ⏰ Relance prévue dans 4 jours</p>
      </div>
    );
  }

  if (localStatus === 'ignored') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 opacity-50">
        <div className="flex items-center gap-2 text-gray-500">
          <X className="w-5 h-5" />
          <span className="font-medium">Ignoré</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{article.title}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreColor}`}>
                Score: {opportunity.score}/10
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {opportunityLabel}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Building className="w-4 h-4" />
              <span>{article.publisher}</span>
              {article.published_date && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{new Date(article.published_date).toLocaleDateString('fr-FR')}</span>
                </>
              )}
            </div>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
        <p className="text-sm text-gray-600 mt-3">{article.summary}</p>
        <p className="text-sm text-blue-600 mt-2 italic">💡 {opportunity.reasoning}</p>
      </div>

      {/* Contact */}
      {contact ? (
        <div className={`px-6 py-4 border-b border-gray-100 ${contact.is_recommended ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
              contact.is_recommended
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              {(contact.first_name?.[0] || '?')}{(contact.last_name?.[0] || '')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {contact.first_name || ''} {contact.last_name || ''}
                </span>
                {contact.linkedin_url && (
                  <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                    <User className="w-4 h-4" />
                  </a>
                )}
                {contact.is_recommended && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Recommandé
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {contact.job_title && <span>{contact.job_title}</span>}
                {contact.job_title && <span className="text-gray-300">•</span>}
                <span>{contact.company}</span>
              </div>
              {contact.relevance_reason && (
                <div className="mt-2 p-2 bg-white/50 rounded text-xs text-gray-600">
                  <p>{contact.relevance_reason}</p>
                  <p className="text-gray-400 mt-1">
                    {contact.is_large_company
                      ? '🏢 Grand groupe → cible décideur commercial'
                      : '🏠 Petite structure → cible dirigeant'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-4 bg-yellow-50 border-b border-gray-100">
          <p className="text-sm text-yellow-700">⚠️ Aucun contact trouvé pour cet éditeur</p>
        </div>
      )}

      {/* Email */}
      {email && contact && (
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objet</label>
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail className="w-4 h-4" />
                <span className="font-medium">Objet:</span>
                <span>{email.subject}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-line text-sm">{email.body}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Lancement...' : 'Lancer la séquence'}
            </button>
            <button
              onClick={() => {
                if (isEditing) {
                  setEditedSubject(email.subject);
                  setEditedBody(email.body);
                }
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
            <button
              onClick={handleIgnore}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Ignorer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
