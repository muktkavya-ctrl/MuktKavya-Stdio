import React, { useState } from 'react';
import {
  ExternalLink,
  ArrowUp,
  Sparkles,
  Heart,
  Send,
  CheckCircle2,
  Scroll,
  Compass,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Footer = ({ setActiveTab, setSelectedLang, setSelectedRasa }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setIsSubscribed(false);
    }, 4500);
  };

  const handleNav = (tab, lang = null) => {
    if (lang && setSelectedLang) {
      setSelectedLang(lang);
    }
    if (tab && setActiveTab) {
      setActiveTab(tab);
    }
    scrollToTop();
  };

  return (
    <footer className="royal-footer" aria-label="Website Footer">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div
          className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${
            isDark ? 'bg-[#800020]/25' : 'bg-rose-200/40'
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${
            isDark ? 'bg-[#d4af37]/15' : 'bg-amber-200/50'
          }`}
        />
      </div>

      {/* Top Shimmering Gold Accent Line */}
      <div
        style={{
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.4) 20%, #d4af37 50%, rgba(212, 175, 55, 0.4) 80%, transparent 100%)',
        }}
      />

      <div className="royal-footer-inner">
        {/* 4-Column Clean Integrated Footer Grid */}
        <div className="royal-footer-grid">
          {/* Column 1: Brand Heritage & Story */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Emblem */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  padding: '1.5px',
                  background: isDark
                    ? 'linear-gradient(135deg, #800020 0%, #b8860b 50%, #ffd700 100%)'
                    : 'linear-gradient(135deg, #800020 0%, #b8860b 100%)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12.5px',
                    background: isDark ? '#090d18' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="Mukt Kavya Logo"
                    style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <h2
                  style={{
                    fontFamily: 'Rozha One, serif',
                    fontSize: '22px',
                    fontWeight: '700',
                    lineHeight: '1.2',
                    letterSpacing: '0.02em',
                    color: isDark ? '#f5e7a9' : '#800020',
                  }}
                >
                  मुक्त काव्य
                </h2>
                <p
                  style={{
                    fontSize: '9.5px',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    letterSpacing: '0.12em',
                    color: '#d4af37',
                    marginTop: '2px',
                  }}
                >
                  The Indian Literary Sanctuary
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: '12.5px',
                lineHeight: '1.65',
                color: isDark ? '#94a3b8' : '#57534e',
              }}
            >
              "शब्द जब भावना बन जाएं, तो कविता का जन्म होता है।" — भारतीय शास्त्रीय छंदों व स्वतंत्र रचनाकारों का पवित्र डिजिटल मंच।
            </p>

            {/* Social Connect Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
              <a
                href="https://www.instagram.com/mukt_kavya"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-pill"
                title="Follow @mukt_kavya on Instagram"
              >
                <div
                  style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <svg style={{ width: '8px', height: '8px', fill: 'currentColor' }} viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span>Instagram</span>
                <ExternalLink style={{ width: '10px', height: '10px', opacity: 0.6 }} />
              </a>

              <a
                href="https://www.youtube.com/@MuktKavya"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-pill"
                title="Subscribe to Mukt Kavya on YouTube"
              >
                <div
                  style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    background: '#ff0000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <svg style={{ width: '8px', height: '8px', fill: 'currentColor' }} viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <span>YouTube</span>
                <ExternalLink style={{ width: '10px', height: '10px', opacity: 0.6 }} />
              </a>
            </div>

            {/* Ad-Free Heritage Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '500',
                background: isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(184, 134, 11, 0.08)',
                color: isDark ? '#f5e7a9' : '#8b6508',
                border: isDark ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(184, 134, 11, 0.2)',
                width: 'fit-content',
                marginTop: '4px',
              }}
            >
              <ShieldCheck style={{ width: '13px', height: '13px', color: '#d4af37' }} />
              <span>100% खुला व विज्ञापन-मुक्त डिजिटल मंच</span>
            </div>
          </div>

          {/* Column 2: काव्य धाराएँ (Traditions) */}
          <div>
            <h4 className="footer-section-title">
              <Scroll style={{ width: '14px', height: '14px', color: '#d4af37' }} />
              काव्य धाराएँ
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button
                onClick={() => handleNav('explore')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>शास्त्रीय ग़ज़ल (Ghazal)</span>
              </button>
              <button
                onClick={() => handleNav('explore')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>मुक्त छंद (Free Verse)</span>
              </button>
              <button
                onClick={() => handleNav('explore')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>दोहा व चौपाई (Couplets)</span>
              </button>
              <button
                onClick={() => handleNav('explore')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>नज़्म व रुबाई (Nazm & Rubai)</span>
              </button>
              <button
                onClick={() => handleNav('explore')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>भक्ति व सूफ़ी काव्य (Mystic)</span>
              </button>
              <button
                onClick={() => handleNav('explore')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>राष्ट्रप्रेम व वीर रस (Patriotic)</span>
              </button>
            </div>
          </div>

          {/* Column 3: भाषाएँ (Sacred & Regional Languages) */}
          <div>
            <h4 className="footer-section-title">
              <Compass style={{ width: '14px', height: '14px', color: '#d4af37' }} />
              सांस्कृतिक भाषाएँ
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button
                onClick={() => handleNav('explore', 'Hindi')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>हिन्दी साहित्य (Hindi)</span>
              </button>
              <button
                onClick={() => handleNav('explore', 'Urdu')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span style={{ fontFamily: 'Amiri, serif' }}>اردو शायरी</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>(Urdu)</span>
              </button>
              <button
                onClick={() => handleNav('explore', 'Marathi')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>मराठी काव्य (Marathi)</span>
              </button>
              <button
                onClick={() => handleNav('explore', 'Bengali')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>বাংলা কবিতা (Bengali)</span>
              </button>
              <button
                onClick={() => handleNav('explore', 'Gujarati')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>ગુજરાતી ગઝલ (Gujarati)</span>
              </button>
              <button
                onClick={() => handleNav('explore', 'English')}
                className="footer-nav-link"
              >
                <span className="footer-nav-bullet">✦</span>
                <span>English Indian Verse</span>
              </button>
            </div>
          </div>

          {/* Column 4: दैनिक साहित्यिक पत्रिका (Integrated Newsletter) */}
          <div>
            <div className="footer-newsletter-card">
              <h4 className="footer-section-title" style={{ marginBottom: '8px' }}>
                <Sparkles style={{ width: '14px', height: '14px', color: '#d4af37' }} />
                साहित्यिक पत्रिका
              </h4>
              <p
                style={{
                  fontSize: '12px',
                  lineHeight: '1.55',
                  marginBottom: '14px',
                  color: isDark ? '#94a3b8' : '#57534e',
                }}
              >
                हर सुबह एक अमर कालजयी रचना सीधे आपके इनबॉक्स में, बिना किसी विज्ञापन के।
              </p>

              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="footer-input-wrapper">
                  <Mail className="footer-input-icon" style={{ width: '14px', height: '14px' }} />
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="अपना ईमेल दर्ज करें..."
                    disabled={isSubscribed}
                    className="footer-newsletter-input"
                    aria-label="Email address for literary newsletter"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubscribed || !newsletterEmail}
                  className="footer-subscribe-btn"
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle2 style={{ width: '14px', height: '14px', color: '#070913' }} />
                      <span>स्वागत है! आप जुड़ चुके हैं</span>
                    </>
                  ) : (
                    <>
                      <Send style={{ width: '13px', height: '13px' }} />
                      <span>सदस्य बनें (Subscribe)</span>
                    </>
                  )}
                </button>

                {isSubscribed && (
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#10b981',
                      fontWeight: '600',
                      textAlign: 'center',
                      marginTop: '4px',
                    }}
                  >
                    ✨ आप साहित्यिक परिवार से जुड़ चुके हैं!
                  </p>
                )}

                <p
                  style={{
                    fontSize: '10px',
                    textAlign: 'center',
                    color: isDark ? '#64748b' : '#78716c',
                    marginTop: '2px',
                  }}
                >
                  🔒 100% निजता संरक्षित • कभी भी रद्द करें
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Copyright & Back to Top */}
        <div className="footer-bottom-bar">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <span>
              © {new Date().getFullYear()}{' '}
              <strong style={{ color: isDark ? '#f8fafc' : '#1c1917', fontWeight: '700' }}>
                मुक्त काव्य (Mukt Kavya)
              </strong>
              . सर्वाधिकार सुरक्षित।
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              भारतीय साहित्य एवं विरासत को समर्पित{' '}
              <Heart style={{ width: '12px', height: '12px', color: '#f43f5e', fill: '#f43f5e' }} />
            </span>
          </div>

          {/* Smooth Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="footer-back-to-top"
            title="Scroll to top of page"
            aria-label="Scroll back to top"
          >
            <span>शीर्ष पर जाएं</span>
            <ArrowUp style={{ width: '13px', height: '13px', color: '#d4af37' }} />
          </button>
        </div>
      </div>
    </footer>
  );
};
