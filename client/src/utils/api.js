const BASE = '/api'

// ── Token helpers ────────────────────────────────────
const getToken = () => localStorage.getItem('token')

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
})

// ── Base request ────────────────────────────────────
const request = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: headers(options.headers),
  })

  // read as text first — avoids crash on empty body
  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`)
  }

  return data
}

// ── Auth ─────────────────────────────────────────────
// POST /api/auth/register
// POST /api/auth/login
// GET  /api/auth/me
// PATCH /api/auth/profile

// ── Campaigns ────────────────────────────────────────
// GET    /api/campaigns
// POST   /api/campaigns
// GET    /api/campaigns/:id
// PATCH  /api/campaigns/:id
// DELETE /api/campaigns/:id

// ── AI ───────────────────────────────────────────────
// POST /api/ai/suggestions
// POST /api/ai/leads

export const api = {

  // Auth
  register:      (body) => request('/auth/register',
                   { method: 'POST', body: JSON.stringify(body) }),

  login:         (body) => request('/auth/login',
                   { method: 'POST', body: JSON.stringify(body) }),

  me:            ()     => request('/auth/me'),

  updateProfile: (body) => request('/auth/profile',
                   { method: 'PATCH', body: JSON.stringify(body) }),

  // Campaigns
  getCampaigns:    ()        => request('/campaigns'),

  createCampaign:  (body)    => request('/campaigns',
                     { method: 'POST', body: JSON.stringify(body) }),

  getCampaign:     (id)      => request(`/campaigns/${id}`),

  updateCampaign:  (id, body) => request(`/campaigns/${id}`,
                     { method: 'PATCH', body: JSON.stringify(body) }),

  deleteCampaign:  (id)      => request(`/campaigns/${id}`,
                     { method: 'DELETE' }),

  // AI
  getSuggestions:  (body)    => request('/ai/suggestions',
                     { method: 'POST', body: JSON.stringify(body) }),

  getLeads:        (body)    => request('/ai/leads',
                     { method: 'POST', body: JSON.stringify(body) }),
}
