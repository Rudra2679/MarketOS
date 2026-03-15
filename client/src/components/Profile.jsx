import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../styles/profile.css';

export default function Profile() {
  const { company, updateCompany } = useAuth();
  const [form, setForm] = useState({
    companyName:    company?.companyName    || '',
    product:        company?.product        || '',
    targetAudience: company?.targetAudience || '',
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const d = await api.updateProfile(form);
      updateCompany(d.company);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-sub">Manage your company information. This data powers your AI recommendations.</p>
      </div>

      <div className="profile-layout">
        {/* Avatar card */}
        <div className="profile-card glass-card">
          <div className="profile-avatar-lg">
            {company?.companyName?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="profile-id">
            <h3>{company?.companyName}</h3>
            <span>{company?.email}</span>
          </div>
          <div className="profile-divider" />
          <div className="profile-stat-rows">
            <div className="profile-stat">
              <span className="profile-stat-label">Member since</span>
              <span className="profile-stat-value">
                {company?.createdAt ? new Date(company.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-label">Account ID</span>
              <span className="profile-stat-value mono">{company?._id?.slice(-8)}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="profile-form-card glass-card">
          <h2 className="form-section-title">Company Details</h2>
          <p className="form-section-sub">
            These details are used by the AI to tailor suggestions and lead profiles specifically for your business.
          </p>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">✓ {success}</div>}

          <form onSubmit={submit} className="profile-form">
            <div className="input-group">
              <label className="input-label">Company Name</label>
              <input className="input" name="companyName" value={form.companyName} onChange={handle} placeholder="Acme Corp" required />
            </div>

            <div className="input-group">
              <label className="input-label">Product / Service</label>
              <textarea className="textarea" name="product" value={form.product} onChange={handle}
                placeholder="Describe what you sell or offer in detail. The more specific, the better your AI recommendations."
                style={{ minHeight: 110 }} />
            </div>

            <div className="input-group">
              <label className="input-label">Target Audience</label>
              <textarea className="textarea" name="targetAudience" value={form.targetAudience} onChange={handle}
                placeholder="Who are your ideal customers? Include demographics, job titles, interests, pain points, and buying behavior."
                style={{ minHeight: 110 }} />
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" />Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Read-only credentials */}
      <div className="credentials-card glass-card">
        <h2 className="form-section-title">Account Credentials</h2>
        <p className="form-section-sub">Your login email. Password changes are not yet supported in this interface.</p>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input className="input" value={company?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
      </div>
    </div>
  );
}