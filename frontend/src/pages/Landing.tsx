import { useState } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../assets/hero-reading.jpg'
import { IconBook, IconRuler, IconSettings, IconSparkle, IconUpload } from '../components/Icons'
import { ReadingText } from '../components/ReadingText'
import { useAuth } from '../context/auth'
import { COLOR_THEMES, FONT_OPTIONS, fontCss, textColorFor } from '../lib/reading'
import './Landing.css'

const YEAR = new Date().getFullYear()

const SAMPLE =
  'Okumak herkes için keyifli olmalı. Doğru yazı tipi, rahat bir satır aralığı ve göz yormayan bir zemin rengi; harflerin yerinde durmasına ve kelimelerin daha kolay tanınmasına yardımcı olur.'

const FEATURES = [
  {
    icon: IconUpload,
    title: 'Yükle, gerisini bize bırak',
    text: 'PDF, Word veya metin dosyanı sürükle bırak. Metni otomatik olarak çıkarıp okumaya hazır hâle getiriyoruz.',
  },
  {
    icon: IconSettings,
    title: 'Sana özel okuma alanı',
    text: 'OpenDyslexic, Lexend gibi disleksi dostu yazı tipleri, yazı boyutu, satır aralığı ve zemin rengi senin elinde.',
  },
  {
    icon: IconSparkle,
    title: 'Bionic Reading',
    text: 'Kelimelerin başı vurgulanır; göz sabitleme noktasını bulur, beyin gerisini tamamlar. Daha akıcı ve odaklı okuma.',
  },
  {
    icon: IconRuler,
    title: 'Okuma cetveli & sesli okuma',
    text: 'Satır takibini kolaylaştıran odak bandı ve metni sesli dinleme ile satırlar arasında kaybolmak yok.',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const [font, setFont] = useState('OpenDyslexic')
  const [bg, setBg] = useState('#FEFBEA')
  const [bionic, setBionic] = useState(true)

  const ctaTo = user ? '/library' : '/register'

  return (
    <div className="landing">
      {/* ---------- Hero ---------- */}
      <section className="container hero">
        <div className="hero-copy">
          <span className="badge">
            <IconBook size={14} /> Disleksi dostu okuma platformu
          </span>
          <h1>
            Harfler yerinde dursun,
            <br />
            <span className="gradient-text">okumak kolaylaşsın.</span>
          </h1>
          <p className="hero-lead">
            Makale, ders notu ya da PDF; dosyanı yükle, DysleX onu senin için en rahat okunacak
            hâle getirsin. Yazı tipi, renk ve aralıklar tamamen sana göre.
          </p>
          <div className="row hero-actions">
            <Link to={ctaTo} className="btn btn-primary btn-lg" id="hero-cta">
              {user ? 'Kütüphaneme git' : 'Ücretsiz başla'}
            </Link>
            <a href="#demo" className="btn btn-ghost btn-lg" id="hero-demo">
              Canlı dene
            </a>
          </div>
          <ul className="hero-points">
            <li>PDF · DOCX · TXT</li>
            <li>5 okunaklı yazı tipi</li>
            <li>Tercihlerin her cihazda kayıtlı</li>
          </ul>
        </div>
        <div className="hero-visual">
          <div className="hero-glow" aria-hidden />
          <img
            src={heroImg}
            alt="Sayfalarından harflerin düzenli satırlara yerleştiği açık bir kitap"
            width={1200}
            height={900}
          />
        </div>
      </section>

      {/* ---------- Live demo ---------- */}
      <section id="demo" className="container demo-section">
        <div className="section-head">
          <h2>Farkı hemen gör</h2>
          <p className="muted">Ayarları değiştir, metnin nasıl değiştiğini anında izle.</p>
        </div>

        <div className="card demo-card">
          <div className="demo-controls">
            <div className="stack" style={{ gap: '0.5rem' }}>
              <span className="control-label">Yazı tipi</span>
              <div className="chip-group" role="radiogroup" aria-label="Yazı tipi">
                {FONT_OPTIONS.slice(0, 3).map((f) => (
                  <button
                    key={f.value}
                    role="radio"
                    aria-checked={font === f.value}
                    className={`chip ${font === f.value ? 'active' : ''}`}
                    style={{ fontFamily: f.css }}
                    onClick={() => setFont(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="stack" style={{ gap: '0.5rem' }}>
              <span className="control-label">Zemin</span>
              <div className="swatch-group" role="radiogroup" aria-label="Zemin rengi">
                {COLOR_THEMES.slice(0, 6).map((t) => (
                  <button
                    key={t.value}
                    role="radio"
                    aria-checked={bg === t.value}
                    aria-label={t.label}
                    title={t.label}
                    className={`swatch ${bg === t.value ? 'active' : ''}`}
                    style={{ background: t.value }}
                    onClick={() => setBg(t.value)}
                  />
                ))}
              </div>
            </div>
            <label className="toggle-row">
              <span className="control-label">Bionic Reading</span>
              <input
                type="checkbox"
                className="toggle"
                checked={bionic}
                onChange={(e) => setBionic(e.target.checked)}
              />
            </label>
          </div>

          <div className="demo-compare">
            <div className="demo-pane demo-before">
              <span className="pane-label">Standart</span>
              <p>{SAMPLE}</p>
            </div>
            <div
              className="demo-pane demo-after"
              style={{ background: bg, color: textColorFor(bg), fontFamily: fontCss(font) }}
            >
              <span className="pane-label">DysleX ile</span>
              <div className="reading-body">
                <ReadingText text={SAMPLE} bionic={bionic} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="container features">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <article key={title} className="card feature" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="feature-icon">
              <Icon size={22} />
            </span>
            <h3>{title}</h3>
            <p className="muted">{text}</p>
          </article>
        ))}
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container">
        <div className="card cta-band">
          <div>
            <h2>Okumayı yeniden keşfetmeye hazır mısın?</h2>
            <p className="muted">Hesabını oluştur, ilk dosyanı birkaç saniyede yükle.</p>
          </div>
          <Link to={ctaTo} className="btn btn-primary btn-lg" id="footer-cta">
            {user ? 'Kütüphaneme git' : 'Hemen başla'}
          </Link>
        </div>
      </section>

      <footer className="container footer faint">
        © {YEAR} DysleX · Herkes için okunabilir metinler
      </footer>
    </div>
  )
}
