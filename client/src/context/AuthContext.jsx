import { createContext, useContext, useState,
         useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

// ── Provider ────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verify stored token on first load
  const fetchMe = useCallback(async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok()) {
        const data = await res.json()
        setCompany(data.company)
      } else {
        localStorage.removeItem('token')
      }
    } catch {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchMe(token)
    else setLoading(false)
  }, [fetchMe])

  // Called after successful login / register
  const login = (token, companyData) => {
    localStorage.setItem('token', token)
    setCompany(companyData)
  }

  // Clears session completely
  const logout = () => {
    localStorage.removeItem('token')
    setCompany(null)
  }

  // Patch local state after profile edits
  const updateCompany = (updated) => setCompany(updated)

  return (
    <AuthContext.Provider value={{ company, login, logout,
                                      loading, updateCompany }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}