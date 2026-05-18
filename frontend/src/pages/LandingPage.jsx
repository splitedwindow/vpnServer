import { Download, Zap, Globe, Lock, ChevronRight } from 'lucide-react'

const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL
  || 'https://github.com/splitedwindow/vpnServer/releases/latest'

const features = [
  {
    icon: <Lock size={22} color="#a78bfa" />,
    bg: 'rgba(108,99,255,0.1)',
    title: 'Надійне шифрування',
    desc: 'AES-256 — сучасний стандарт безпеки.',
  },
  {
    icon: <Zap size={22} color="#fbbf24" />,
    bg: 'rgba(251,191,36,0.1)',
    title: 'Простота використання',
    desc: 'Встановив — натиснув — підключився. Жодних складних налаштувань.',
  },
  {
    icon: <Globe size={22} color="#34d399" />,
    bg: 'rgba(52,211,153,0.1)',
    title: 'Українські ресурси',
    desc: 'Доступ до сайтів і сервісів, що недоступні за кордоном.',
  },
]

const steps = [
  { n: '1', text: 'Зареєструйся та завантаж клієнт' },
  { n: '2', text: 'Встанови програму на Windows' },
  { n: '3', text: 'Натисни «Підключитись» і готово' },
]

export default function LandingPage({ onLoginClick }) {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 24px 80px', fontFamily: 'inherit' }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', marginBottom: '72px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          background: 'rgba(108,99,255,0.12)',
          border: '1px solid rgba(108,99,255,0.25)',
          borderRadius: '20px',
          padding: '5px 14px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#a78bfa',
          letterSpacing: '0.4px',
          marginBottom: '28px',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
          Безкоштовний пробний період — 14 днів
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 5vw, 52px)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '20px',
        }}>
          Ваш захист в інтернеті —{' '}
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #6c63ff 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            простий і надійний
          </span>
        </h1>

        <p style={{
          fontSize: '17px',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7,
          maxWidth: '460px',
          margin: '0 auto 40px',
        }}>
          DiplomaVPN захищає ваш трафік і дає доступ до українських сайтів звідусіль. Без технічних знань.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <a
            href={DOWNLOAD_URL}
            download="DiplomaVPN-Setup.exe"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #6c63ff, #4f46e5)',
              color: '#fff',
              padding: '15px 34px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 6px 28px rgba(108,99,255,0.38)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(108,99,255,0.52)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 28px rgba(108,99,255,0.38)' }}
          >
            <Download size={19} />
            Завантажити для Windows
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.22)' }}>Windows 10 / 11</span>
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
            <button
              onClick={onLoginClick}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: 'rgba(255,255,255,0.35)',
                fontFamily: 'inherit', padding: 0,
                display: 'flex', alignItems: 'center', gap: '3px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
              Вже є акаунт? Увійти <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '64px',
      }}>
        {features.map(({ icon, bg, title, desc }) => (
          <div key={title} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '22px 20px',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
            }}>
              {icon}
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{title}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        padding: '32px 28px',
      }}>
        <p style={{
          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '1px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px',
        }}>
          Як почати
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {steps.map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6c63ff, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 800,
              }}>
                {n}
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
