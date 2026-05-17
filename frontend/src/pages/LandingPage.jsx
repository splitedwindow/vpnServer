import { Download } from 'lucide-react'

const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL || '#'

const HeroShield = () => (
  <svg width="96" height="96" viewBox="0 0 88 88" fill="none">
    <defs>
      <linearGradient id="heroGrad" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6c63ff" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
    <path
      d="M44 7L13 20V43C13 60.5 26.5 76 44 81C61.5 76 75 60.5 75 43V20L44 7Z"
      fill="url(#heroGrad)"
      opacity="0.92"
    />
    <rect x="32" y="42" width="24" height="16" rx="3" fill="none" stroke="white" strokeWidth="2.5" />
    <path d="M38 42v-5a6 6 0 0 1 12 0v5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
)

export default function LandingPage({ onLoginClick }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '52px',
        height: '4px',
        borderRadius: '2px',
        background: 'linear-gradient(90deg, #005BBB 50%, #FFD500 50%)',
        marginBottom: '44px',
        opacity: 0.85,
      }} />

      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <div style={{
          position: 'absolute',
          inset: '-36px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 72%)',
          pointerEvents: 'none',
        }} />
        <HeroShield />
      </div>

      <h1 style={{
        fontSize: 'clamp(26px, 5vw, 44px)',
        fontWeight: 800,
        lineHeight: 1.15,
        marginBottom: '18px',
        maxWidth: '560px',
        letterSpacing: '-0.5px',
      }}>
        VPN для українців<br />за кордоном
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'rgba(255,255,255,0.5)',
        maxWidth: '420px',
        lineHeight: 1.7,
        marginBottom: '44px',
      }}>
        Захистіть своє з'єднання та отримайте доступ до українських ресурсів, де б ви не перебували. Безпечно, просто, доступно.
      </p>

      <a
        href={DOWNLOAD_URL}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%)',
          color: '#fff',
          padding: '14px 30px',
          borderRadius: '14px',
          fontSize: '16px',
          fontWeight: 700,
          textDecoration: 'none',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
          letterSpacing: '0.2px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(108,99,255,0.45)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,99,255,0.3)'
        }}
      >
        <Download size={20} />
        Завантажити для Windows
      </a>

      <p style={{
        marginTop: '12px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.3px',
      }}>
        Windows 10 / 11
      </p>

      <p style={{ marginTop: '32px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
        Вже є акаунт?{' '}
        <button
          onClick={onLoginClick}
          style={{
            background: 'none',
            border: 'none',
            color: '#6c63ff',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'inherit',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Увійти
        </button>
      </p>
    </div>
  )
}
