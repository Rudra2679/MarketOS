import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Overview from '../components/Overview';
import Campaigns from '../components/Campaigns';
import AIHub from '../components/AIHub';
import Profile from '../components/Profile';
import '../styles/dashboard.css';

const NAV = [
  {
    to: '/dashboard', label: 'Overview', end: true,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/dashboard/campaigns', label: 'Campaigns',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/></svg>,
  },
  {
    to: '/dashboard/ai', label: 'AI Hub',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
    badge: 'AI',
  },
  {
    to: '/dashboard/profile', label: 'Profile',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
];

export default function Dashboard() {
  const { company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dash-root">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L19 6.5V15.5L11 20L3 15.5V6.5L11 2Z" fill="currentColor" opacity="0.9"/>
              <path d="M11 6L16 8.75V14.25L11 17L6 14.25V8.75L11 6Z" fill="var(--bg-base)"/>
            </svg>
          </div>
          <div>
            <span className="sidebar-brand-name">MarketOS</span>
            <span className="sidebar-brand-sub">Campaign Intelligence</span>
          </div>
        </div>

        <div className="sidebar-company">
          <div className="company-avatar">
            {company?.companyName?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="company-info">
            <span className="company-name">{company?.companyName}</span>
            <span className="company-email">{company?.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Navigation</span>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-ghost btn-full sidebar-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        {/* Top bar (mobile) */}
        <div className="dash-topbar">
          <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="topbar-brand">MarketOS</span>
          <div className="company-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
            {company?.companyName?.[0]?.toUpperCase() || 'C'}
          </div>
        </div>

        <div className="dash-content page-enter">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="ai" element={<AIHub />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}