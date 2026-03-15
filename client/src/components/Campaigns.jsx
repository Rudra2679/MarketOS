import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import '../styles/campaigns.css';

const CHANNELS = ['social_media','email','seo','ppc','content','influencer','other'];
const STATUSES = ['draft','active','paused','completed'];

const STATUS_MAP = {
  active:    { label: 'Active',    cls: 'badge-green' },
  draft:     { label: 'Draft',     cls: 'badge-gray' },
  paused:    { label: 'Paused',    cls: 'badge-yellow' },
  completed: { label: 'Completed', cls: 'badge-blue' },
};

const EMPTY_FORM = { name:'', description:'', status:'draft', budget:'', channels:[], goals:'' };

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'create' | campaign obj
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try { const d = await api.getCampaigns(); setCampaigns(d.campaigns); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit   = (c) => {
    setForm({ name: c.name, description: c.description||'', status: c.status,
              budget: c.budget||'', channels: c.channels||[], goals: c.goals||'' });
    setError('');
    setModal(c);
  };
  const closeModal = () => setModal(null);

  const handleField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleChannel = (ch) => {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(x => x !== ch) : [...f.channels, ch],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, budget: form.budget ? Number(form.budget) : 0 };
      if (modal === 'create') {
        const d = await api.createCampaign(payload);
        setCampaigns(prev => [d.campaign, ...prev]);
      } else {
        const d = await api.updateCampaign(modal._id, payload);
        setCampaigns(prev => prev.map(c => c._id === modal._id ? d.campaign : c));
      }
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCampaign = async (id) => {
    setDeleting(id);
    try {
      await api.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="campaigns-page">
      <div className="campaigns-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-sub">Manage and track all your marketing campaigns.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Campaign
        </button>
      </div>

      {loading ? (
        <div className="campaigns-loading"><div className="spinner" style={{width:32,height:32}} /></div>
      ) : campaigns.length === 0 ? (
        <div className="campaigns-empty glass-card">
          <div className="empty-icon">📭</div>
          <h3>No campaigns yet</h3>
          <p>Create your first campaign and let the AI help you optimize it.</p>
          <button className="btn btn-primary" onClick={openCreate}>Create Campaign</button>
        </div>
      ) : (
        <div className="campaigns-grid">
          {campaigns.map(c => {
            const s = STATUS_MAP[c.status] || STATUS_MAP.draft;
            return (
              <div key={c._id} className="campaign-card glass-card">
                <div className="card-top">
                  <div className="card-title-row">
                    <h3 className="card-name">{c.name}</h3>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                  </div>
                  {c.description && <p className="card-desc">{c.description}</p>}
                </div>

                <div className="card-meta">
                  {c.budget > 0 && (
                    <div className="meta-item">
                      <span className="meta-label">Budget</span>
                      <span className="meta-value">${c.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {c.channels?.length > 0 && (
                    <div className="meta-item">
                      <span className="meta-label">Channels</span>
                      <div className="channel-tags">
                        {c.channels.map(ch => (
                          <span key={ch} className="channel-tag">{ch.replace('_',' ')}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.goals && (
                    <div className="meta-item">
                      <span className="meta-label">Goals</span>
                      <span className="meta-value">{c.goals}</span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deleting === c._id}
                    onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteCampaign(c._id); }}
                  >
                    {deleting === c._id ? <span className="spinner" /> : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal glass-card">
            <div className="modal-header">
              <h2>{modal === 'create' ? 'New Campaign' : 'Edit Campaign'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={submit} className="modal-form">
              <div className="input-group">
                <label className="input-label">Campaign Name *</label>
                <input className="input" name="name" value={form.name} onChange={handleField} placeholder="Q4 Product Launch" required />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="textarea" name="description" value={form.description} onChange={handleField} placeholder="Brief campaign overview..." />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Status</label>
                  <select className="select" name="status" value={form.status} onChange={handleField}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Budget ($)</label>
                  <input className="input" type="number" name="budget" value={form.budget} onChange={handleField} placeholder="5000" min="0" />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Channels</label>
                <div className="channel-picker">
                  {CHANNELS.map(ch => (
                    <button key={ch} type="button"
                      className={`channel-chip ${form.channels.includes(ch) ? 'selected' : ''}`}
                      onClick={() => toggleChannel(ch)}
                    >
                      {ch.replace('_',' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Goals</label>
                <textarea className="textarea" name="goals" value={form.goals} onChange={handleField} placeholder="What do you want to achieve?" style={{minHeight:70}} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" />{modal === 'create' ? 'Creating...' : 'Saving...'}</> : modal === 'create' ? 'Create Campaign' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}