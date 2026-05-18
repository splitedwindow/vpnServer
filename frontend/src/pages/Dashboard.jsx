import { useState, useEffect } from 'react'
import { Copy, Check, Download, Shield, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL
  || 'https://github.com/splitedwindow/vpnServer/releases/latest/download/DiplomaVPN-Setup-1.0.0.exe'

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

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [vpnServer, setVpnServer]       = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [copied, setCopied]             = useState('')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!user?.token) return
    Promise.all([
      fetch('/api/config/vpn').then((r) => r.json()),
      fetch(`/api/subscriptions/user/${encodeURIComponent(user.username)}/active`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((r) => r.json()),
    ])
      .then(([cfg, sub]) => {
        if (cfg.success) setVpnServer(cfg.data.server)
        if (sub.success) setSubscription(sub.data)
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

  const planLabel = { trial: 'Пробний', basic: 'Базовий', premium: 'Преміум' }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
        Вітаємо, {user?.username}!
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '32px', fontSize: '14px' }}>
        Ваш обліковий запис DiplomaVPN
      </p>

      {loading && (
        <div style={{ ...cardStyle, color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
          Завантаження...
        </div>
      )}

      {!loading && (
        <>
          {/* Subscription status */}
          <div style={{
            ...cardStyle,
            border: subscription
              ? '1px solid rgba(16,185,129,0.25)'
              : '1px solid rgba(239,68,68,0.25)',
          }}>
            <p style={labelStyle}>Підписка</p>
            {subscription ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <Shield size={28} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                    {planLabel[subscription.plan] ?? subscription.plan}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={11} />
                    Діє до: {formatDate(subscription.expires_at)}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Shield size={28} color="#f87171" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: '#f87171' }}>
                    Немає активної підписки
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    Завантажте клієнт та оберіть план при першому запуску
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* VPN connection details */}
          <div style={cardStyle}>
            <p style={labelStyle}>Дані для підключення</p>

            <div style={fieldRowStyle}>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Сервер</p>
                <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{vpnServer ?? '…'}</span>
              </div>
              {vpnServer && <CopyBtn text={vpnServer} id="server" />}
            </div>

            <div style={{ ...fieldRowStyle, marginBottom: 0 }}>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Логін</p>
                <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{user.username}</span>
              </div>
              <CopyBtn text={user.username} id="username" />
            </div>
          </div>

          {/* Download */}
          <div style={cardStyle}>
            <p style={labelStyle}>Клієнт DiplomaVPN</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px', lineHeight: 1.65 }}>
              Завантажте та встановіть клієнт для Windows, щоб підключатись до VPN одним натиском.
            </p>
            <a
              href={DOWNLOAD_URL}
              download="DiplomaVPN-Setup.exe"
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
        </>
      )}
    </div>
  )
}
