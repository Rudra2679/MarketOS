import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../styles/overview.css';

const STATUS_MAP = {
  active:    { label: 'Active',    cls: 'badge-green' },
  draft:     { label: 'Draft',     cls: 'badge-gray' },
  paused:    { label: 'Paused',    cls: 'badge-yellow' },
  completed: { label: 'Completed', cls: 'badge-blue' },
};

export default function Overview() {
  const { company } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCampaigns()
      .then(d => setCampaigns(d.campaigns))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:     campaigns.length,
    active:    campaigns.filter(c => c.status === 'active').length,
    draft:     campaigns.filter(c => c.status === 'draft').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
  };

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
  const recent = campaigns.slice(0, 4);

  return (
    <div className="overview">
      {/* Header */}
      <div className="overview-header">
        <div>
          <h1 className="overview-greeting">
            Good {getTimeOfDay()},{' '}
            <span className="gradient-text">{company?.companyName}</span>
          </h1>
          <p className="overview-sub">Here's your campaign performance at a glance.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/campaigns')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Campaign
        </button>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {[
          { label: 'Total Campaigns', value: stats.total, icon: '📊', color: 'var(--accent)' },
          { label: 'Active',          value: stats.active, icon: '🚀', color: 'var(--emerald)' },
          { label: 'Drafts',          value: stats.draft,  icon: '✏️', color: 'var(--gold)' },
          { label: 'Total Budget',    value: `$${totalBudget.toLocaleString()}`, icon: '💰', color: 'var(--violet)' },
        ].map((s) => (
          <div key={s.label} className="stat-card glass-card">
            <div className="stat-icon" style={{ '--icon-color': s.color }}>{s.icon}</div>
            <div className="stat-body">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Company profile panel */}
      <div className="overview-panels">
        <div className="panel glass-card">
          <div className="panel-header">
            <h2 className="panel-title">Company Profile</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/profile')}>Edit</button>
          </div>
          <div className="profile-rows">
            <ProfileRow label="Product / Service" value={company?.product} />
            <ProfileRow label="Target Audience" value={company?.targetAudience} />
            <ProfileRow label="Email" value={company?.email} />
          </div>
        </div>

        <div className="panel glass-card">
          <div className="panel-header">
            <h2 className="panel-title">Recent Campaigns</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/campaigns')}>View all</button>
          </div>
          {loading ? (
            <div className="panel-loading"><div className="spinner" /></div>
          ) : recent.length === 0 ? (
            <div className="panel-empty">
              <span>No campaigns yet.</span>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/campaigns')}>Create one</button>
            </div>
          ) : (
            <div className="campaign-list">
              {recent.map(c => {
                const s = STATUS_MAP[c.status] || STATUS_MAP.draft;
                return (
                  <div key={c._id} className="campaign-row">
                    <div className="campaign-row-info">
                      <span className="campaign-row-name">{c.name}</span>
                      <span className="campaign-row-desc">{c.description || 'No description'}</span>
                    </div>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI CTA */}
      <div className="ai-cta glass-card">
        <div className="ai-cta-glow" />
        <div className="ai-cta-content">
          <div className="ai-cta-icon">✦</div>
          <div>
            <h3>AI-Powered Insights Ready</h3>
            <p>Get personalized marketing strategies and lead profiles generated for {company?.companyName}.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/ai')}>
          Open AI Hub →
        </button>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="profile-row">
      <span className="profile-row-label">{label}</span>
      <span className="profile-row-value">{value || '—'}</span>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}