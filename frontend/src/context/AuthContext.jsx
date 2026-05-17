import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vpn_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    const userData = { username: data.username, token: data.token }
    setUser(userData)
    localStorage.setItem('vpn_user', JSON.stringify(userData))
    return userData
  }, [])

  const register = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    const userData = { username: data.username, token: data.token }
    setUser(userData)
    localStorage.setItem('vpn_user', JSON.stringify(userData))
    return userData
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('vpn_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
