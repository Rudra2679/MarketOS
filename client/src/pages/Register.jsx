import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../styles/auth.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '', product: '', targetAudience: '', email: '', password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = (e) => {
    e.preventDefault();
    if (!form.companyName || !form.product || !form.targetAudience) {
      setError('Please fill in all fields to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      login(data.token, data.company);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-panel auth-panel-wide page-enter">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L19 6.5V15.5L11 20L3 15.5V6.5L11 2Z" fill="currentColor" opacity="0.9"/>
              <path d="M11 6L16 8.75V14.25L11 17L6 14.25V8.75L11 6Z" fill="var(--bg-base)"/>
            </svg>
          </div>
          <span className="auth-brand-name">MarketOS</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Set up your workspace</h1>
          <p className="auth-subtitle">
            {step === 1 ? 'Tell us about your company to personalize your AI.' : 'Create your secure login.'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-dot">{step > 1 ? '✓' : '1'}</div>
            <span>Company Profile</span>
          </div>
          <div className="step-line" />
          <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-dot">2</div>
            <span>Account Setup</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={nextStep} className="auth-form">
            <div className="input-group">
              <label className="input-label">Company Name</label>
              <input className="input" type="text" name="companyName" placeholder="Acme Corp" value={form.companyName} onChange={handle} required />
            </div>
            <div className="input-group">
              <label className="input-label">Product / Service</label>
              <textarea className="textarea" name="product" placeholder="Describe what you sell or offer..." value={form.product} onChange={handle} required />
            </div>
            <div className="input-group">
              <label className="input-label">Target Audience</label>
              <textarea className="textarea" name="targetAudience" placeholder="Who are your ideal customers? Age, interests, job titles..." value={form.targetAudience} onChange={handle} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">Continue →</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submit} className="auth-form">
            <div className="input-group">
              <label className="input-label">Work Email</label>
              <input className="input" type="email" name="email" placeholder="you@company.com" value={form.email} onChange={handle} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handle} required minLength={6} />
            </div>
            <div className="auth-step-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" />Creating...</> : 'Launch workspace'}
              </button>
            </div>
          </form>
        )}

        <div className="divider">or</div>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}