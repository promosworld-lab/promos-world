'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function AboutPage() {
  const router = useRouter()
  const { language, setLanguage, t, ready } = useLanguage()

  if (!ready) {
    return (
      <div className="about-page loading">
        Chargement...
      </div>
    )
  }

  return (
    <div className="about-page">
      <style jsx>{`
        .about-page {
          min-height: 100vh;
          background: #0a0a0a;
          color: white;
          font-family: sans-serif;
          overflow-x: hidden;
        }

        .about-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 20px 60px;
          box-sizing: border-box;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 30px;
        }

        .back-button,
        .language-button {
          padding: 10px 14px;
          background: #151515;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .hero {
          background:
            linear-gradient(
              135deg,
              #171717 0%,
              #111 60%,
              #18100a 100%
            );
          border: 1px solid #292929;
          border-radius: 24px;
          padding: 42px 30px;
          margin-bottom: 18px;
        }

        .badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 92, 0, 0.1);
          border: 1px solid rgba(255, 92, 0, 0.25);
          color: #ff8a45;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        h1 {
          margin: 0 0 14px;
          font-size: clamp(30px, 6vw, 52px);
          line-height: 1.05;
          font-weight: 900;
        }

        .hero p {
          max-width: 720px;
          margin: 0;
          color: #999;
          font-size: 14px;
          line-height: 1.8;
        }

        .section {
          background: #151515;
          border: 1px solid #252525;
          border-radius: 18px;
          padding: 26px;
          margin-top: 14px;
        }

        .section h2 {
          margin: 0 0 12px;
          font-size: 21px;
          font-weight: 900;
        }

        .section p {
          margin: 0;
          color: #999;
          font-size: 13px;
          line-height: 1.8;
        }

        .two-columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 14px;
        }

        .card {
          background: #151515;
          border: 1px solid #252525;
          border-radius: 18px;
          padding: 24px;
        }

        .card h2 {
          margin: 0 0 14px;
          font-size: 19px;
          font-weight: 900;
        }

        .card ul {
          padding-left: 20px;
          margin: 0;
        }

        .card li {
          color: #999;
          font-size: 13px;
          line-height: 1.7;
          margin-bottom: 8px;
        }

        .rules-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .rule {
          padding: 16px;
          background: #101010;
          border: 1px solid #242424;
          border-radius: 14px;
        }

        .rule strong {
          display: block;
          color: #ff7a2a;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .rule span {
          color: #aaa;
          font-size: 12px;
          line-height: 1.6;
        }

        .footer {
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid #1e1e1e;
          text-align: center;
          color: #666;
          font-size: 11px;
        }

        @media (max-width: 700px) {
          .about-container {
            padding: 16px 14px 40px;
          }

          .hero {
            padding: 30px 20px;
            border-radius: 18px;
          }

          .section,
          .card {
            padding: 20px;
          }

          .two-columns,
          .rules-grid {
            grid-template-columns: 1fr;
          }

          .topbar {
            margin-bottom: 20px;
          }

          .back-button,
          .language-button {
            font-size: 11px;
            padding: 9px 10px;
          }
        }
      `}</style>

      <main className="about-container">
        <div className="topbar">
          <button
            className="back-button"
            onClick={() => router.push('/')}
          >
            {t.backHome}
          </button>

          <button
            className="language-button"
            onClick={() =>
              setLanguage(language === 'fr' ? 'en' : 'fr')
            }
          >
            {language === 'fr'
              ? '🇬🇧 English'
              : '🇫🇷 Français'}
          </button>
        </div>

        <section className="hero">
          <div className="badge">PROMO'S WORLD</div>

          <h1>
            {t.aboutTitle}
          </h1>

          <p>
            {t.aboutSubtitle}
          </p>
        </section>

        <section className="section">
          <h2>{t.aboutWhatTitle}</h2>

          <p>{t.aboutWhatText}</p>
        </section>

        <section className="section">
          <h2>{t.howTitle}</h2>
        </section>

        <div className="two-columns">
          <div className="card">
            <h2>👤 {t.clientTitle}</h2>

            <ul>
              {t.clientSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>🏪 {t.sellerTitle}</h2>

            <ul>
              {t.sellerSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </div>

        <section className="section">
          <h2>💰 {t.financialTitle}</h2>

          <div className="rules-grid">
            <div className="rule">
              <strong>{t.depositTitle}</strong>
              <span>{t.depositText}</span>
            </div>

            <div className="rule">
              <strong>{t.balanceTitle}</strong>
              <span>{t.balanceText}</span>
            </div>

            <div className="rule">
              <strong>{t.blockedTitle}</strong>
              <span>{t.blockedText}</span>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>⏳ {t.deadlinesTitle}</h2>

          <div className="rules-grid">
            <div className="rule">
              <strong>36 h</strong>
              <span>{t.sellerDecision}</span>
            </div>

            <div className="rule">
              <strong>48 h</strong>
              <span>{t.shipping}</span>
            </div>

            <div className="rule">
              <strong>3 mois / months</strong>
              <span>{t.balanceDeadline}</span>
            </div>

            <div className="rule">
              <strong>48 h</strong>
              <span>{t.inspection}</span>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>⚠️ {t.disputeTitle}</h2>

          <p>{t.disputeText}</p>
        </section>

        <section className="section">
          <h2>📅 {t.expirationTitle}</h2>

          <p>{t.expirationText}</p>
        </section>

        <section className="section">
          <h2>🔐 {t.securityTitle}</h2>

          <p>{t.securityText}</p>
        </section>

        <div className="footer">
          {t.footer}
        </div>
      </main>
    </div>
  )
}