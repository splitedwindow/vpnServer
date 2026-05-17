import { useState, useEffect } from 'react'
import { Copy, Check, Download, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL || '#'
const VPN_SERVER = '94.231.178.181'

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '20px 24px',
  marginBottom: '14px',
}

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  marginBottom: '14px',
}

const fieldRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [vpnCreds, setVpnCreds] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.token) return
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setVpnCreds(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const CopyBtn = ({ text, id }) => (
    <button
      onClick={() => copyText(text, id)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', display: 'flex', alignItems: 'center' }}
      title="Копіювати"
    >
      {copied === id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
    </button>
  )

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
        Вітаємо, {user?.username}!
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '32px', fontSize: '14px' }}>
        Ваш обліковий запис DiplomaVPN активний
      </p>

      {loading && (
        <div style={{ ...cardStyle, color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
          Завантаження...
        </div>
      )}

      {!loading && vpnCreds && (
        <div style={cardStyle}>
          <p style={labelStyle}>Дані для підключення VPN</p>

          <div style={fieldRowStyle}>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Сервер</p>
              <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{VPN_SERVER}</span>
            </div>
            <CopyBtn text={VPN_SERVER} id="server" />
          </div>

          <div style={fieldRowStyle}>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Логін</p>
              <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{vpnCreds.username}</span>
            </div>
            <CopyBtn text={vpnCreds.username} id="username" />
          </div>

          <div style={{ ...fieldRowStyle, marginBottom: 0 }}>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Пароль</p>
              <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                {showPassword ? vpnCreds.password : '••••••••'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <button
                onClick={() => setShowPassword((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', display: 'flex', alignItems: 'center' }}
                title={showPassword ? 'Приховати' : 'Показати'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <CopyBtn text={vpnCreds.password} id="password" />
            </div>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <p style={labelStyle}>Клієнт DiplomaVPN</p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px', lineHeight: 1.65 }}>
          Завантажте та встановіть клієнт для Windows, щоб підключатись до VPN одним натиском.
        </p>
        <a
          href={DOWNLOAD_URL}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <Download size={16} />
          Завантажити для Windows
        </a>
      </div>
    </div>
  )
}
