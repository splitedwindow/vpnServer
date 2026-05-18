import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ onClose, onSuccess = null }) {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (tab === 'register' && password !== confirmPassword) {
      setError('Паролі не співпадають')
      return
    }

    setLoading(true)
    try {
      let userData
      if (tab === 'login') {
        userData = await login(username, password)
      } else {
        userData = await register(username, password)
      }
      if (onSuccess) {
        onSuccess(userData.token)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (t) => {
    setTab(t)
    setError('')
    setConfirmPassword('')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0d0d1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
            {tab === 'login' ? 'Вхід' : 'Реєстрація'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: '4px', borderRadius: '6px', display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px',
          gap: '4px',
        }}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                background: tab === t
                  ? 'linear-gradient(135deg, #6c63ff, #4f46e5)'
                  : 'transparent',
                color: tab === t ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              {t === 'login' ? 'Увійти' : 'Реєстрація'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            className="form-input"
            type="text"
            placeholder="Логін"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            className="form-input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          />
          {tab === 'register' && (
            <input
              className="form-input"
              type="password"
              placeholder="Повторіть пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          )}

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#f87171',
              fontSize: '13px',
              lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '46px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              transition: 'opacity 0.2s, transform 0.2s',
              marginTop: '4px',
            }}
          >
            {loading ? '...' : (tab === 'login' ? 'Увійти' : 'Зареєструватись')}
          </button>
        </form>
      </div>
    </div>
  )
}
