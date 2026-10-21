import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import type { DocumentDetail, Preferences } from '../api/types'
import {
  IconArrowLeft,
  IconDownload,
  IconPause,
  IconPlay,
  IconRuler,
  IconSettings,
  IconSparkle,
  IconStop,
} from '../components/Icons'
import { ReaderSettings, type SaveState } from '../components/ReaderSettings'
import { ReadingText } from '../components/ReadingText'
import { useSpeech } from '../hooks/useSpeech'
import {
  DEFAULT_EXTRAS,
  DEFAULT_PREFERENCES,
  countWords,
  fontCss,
  isDark,
  readingMinutes,
  splitParagraphs,
  textColorFor,
  type ReaderExtras,
} from '../lib/reading'
import './Reader.css'

const EXTRAS_KEY = 'dyslex_reader_extras'
const SAVE_DELAY = 600

function loadExtras(): ReaderExtras {
  try {
    return { ...DEFAULT_EXTRAS, ...JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? '{}') }
  } catch {
    return DEFAULT_EXTRAS
  }
}

/** Fare imlecini takip eden, satır dışını karartan okuma cetveli */
function ReadingRuler({ height }: { height: number }) {
  const [y, setY] = useState<number | null>(null)
  useEffect(() => {
    const onMove = (e: PointerEvent) => setY(e.clientY)
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  if (y === null) return null
  const half = height / 2
  return (
    <div className="ruler" aria-hidden>
      <div className="ruler-shade" style={{ top: 0, height: Math.max(0, y - half) }} />
      <div className="ruler-band" style={{ top: y - half, height }} />
      <div className="ruler-shade" style={{ top: y + half, bottom: 0 }} />
    </div>
  )
}

/** Her doküman için temiz bir okuma durumu (key ile yeniden oluşturulur) */
export default function ReaderRoute() {
  const { id } = useParams()
  const docId = Number(id)
  if (!Number.isInteger(docId) || docId <= 0) {
    return <ReaderError message="Geçersiz doküman adresi" />
  }
  return <Reader key={docId} docId={docId} />
}

function ReaderError({ message }: { message: string | null }) {
  return (
    <div className="container page center-screen">
      <div className="card empty-reader">
        <h1>Doküman açılamadı</h1>
        <p className="muted">{message}</p>
        <Link to="/library" className="btn btn-primary">
          Kütüphaneye dön
        </Link>
      </div>
    </div>
  )
}

function Reader({ docId }: { docId: number }) {
  const [doc, setDoc] = useState<DocumentDetail | null>(null)
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [extras, setExtras] = useState<ReaderExtras>(loadExtras)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(() => window.innerWidth >= 1200)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [progress, setProgress] = useState(0)
  const [downloading, setDownloading] = useState(false)

  const pendingRef = useRef<Partial<Preferences>>({})
  const timerRef = useRef<number | undefined>(undefined)

  /* ---------- Veri yükleme ---------- */
  useEffect(() => {
    let cancelled = false
    Promise.all([api.getDocument(docId), api.getPreferences()])
      .then(([d, p]) => {
        if (cancelled) return
        setDoc(d)
        setPrefs({ ...p, line_height: Number(p.line_height) })
        document.title = `${d.title} · DysleX`
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Doküman açılamadı'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
      document.title = 'DysleX · Disleksi Dostu Okuma'
    }
  }, [docId])

  /* ---------- Tercihleri otomatik kaydet (debounce) ---------- */
  const flush = useCallback(async () => {
    const patch = pendingRef.current
    pendingRef.current = {}
    if (Object.keys(patch).length === 0) return
    setSaveState('saving')
    try {
      await api.updatePreferences(patch)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [])

  const updatePrefs = useCallback(
    (patch: Partial<Preferences>) => {
      setPrefs((p) => ({ ...p, ...patch }))
      pendingRef.current = { ...pendingRef.current, ...patch }
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => void flush(), SAVE_DELAY)
    },
    [flush],
  )

  // Sayfadan çıkarken bekleyen değişiklikleri gönder
  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current)
      void flush()
    },
    [flush],
  )

  const updateExtras = (patch: Partial<ReaderExtras>) =>
    setExtras((e) => {
      const next = { ...e, ...patch }
      localStorage.setItem(EXTRAS_KEY, JSON.stringify(next))
      return next
    })

  const handleReset = async () => {
    window.clearTimeout(timerRef.current)
    pendingRef.current = {}
    setSaveState('saving')
    try {
      const p = await api.resetPreferences()
      setPrefs({ ...p, line_height: Number(p.line_height) })
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
    updateExtras(DEFAULT_EXTRAS)
  }

  /* ---------- Okuma ilerlemesi ---------- */
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [doc])

  // Esc ile ayar panelini kapat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSettingsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ---------- Türetilmiş değerler ---------- */
  const text = doc?.extracted_text ?? ''
  const paragraphs = useMemo(() => splitParagraphs(text), [text])
  const words = useMemo(() => countWords(text), [text])
  const speech = useSpeech(paragraphs)
  const speakingIndex = speech.current

  // Sesli okunan paragrafı görünür tut
  useEffect(() => {
    if (speakingIndex === null) return
    document.querySelector('.reading-body p.speaking')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [speakingIndex])

  const textColor = textColorFor(prefs.background_color)
  const readerStyle = {
    '--reader-bg': prefs.background_color,
    '--reader-text': textColor,
  } as CSSProperties

  const bodyStyle: CSSProperties = {
    fontFamily: fontCss(prefs.font_family),
    fontSize: `${prefs.font_size}px`,
    lineHeight: prefs.line_height,
    letterSpacing: `${extras.letterSpacing}em`,
    wordSpacing: `${extras.wordSpacing}em`,
    maxWidth: `${extras.maxWidth}ch`,
  }

  const handleDownload = async () => {
    if (!doc) return
    setDownloading(true)
    try {
      await api.downloadOriginal(doc.id, doc.title)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'İndirilemedi')
    } finally {
      setDownloading(false)
    }
  }

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div className="reader" style={readerStyle}>
        <div className="center-screen" role="status">
          <div className="row">
            <span className="spinner" /> Doküman hazırlanıyor…
          </div>
        </div>
      </div>
    )
  }

  if (!doc) return <ReaderError message={error} />

  return (
    <div
      className={`reader ${isDark(prefs.background_color) ? 'reader-dark' : ''} ${
        settingsOpen ? 'with-panel' : ''
      }`}
      style={readerStyle}
    >
      <div className="reader-progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      <header className="reader-bar">
        <Link to="/library" className="reader-btn" aria-label="Kütüphaneye dön" title="Kütüphaneye dön">
          <IconArrowLeft size={20} />
        </Link>
        <div className="reader-title">
          <h1 title={doc.title}>{doc.title}</h1>
          <span>
            {words.toLocaleString('tr-TR')} kelime · ~{readingMinutes(words)} dk okuma
          </span>
        </div>
        <div className="reader-actions">
          {speech.supported && paragraphs.length > 0 && (
            <div className="tts-group">
              {speech.status === 'playing' ? (
                <button id="tts-pause" className="reader-btn" onClick={speech.pause} aria-label="Duraklat" title="Duraklat">
                  <IconPause size={18} />
                </button>
              ) : (
                <button
                  id="tts-play"
                  className="reader-btn"
                  onClick={() => (speech.status === 'paused' ? speech.resume() : speech.play())}
                  aria-label="Sesli oku"
                  title="Sesli oku"
                >
                  <IconPlay size={18} />
                </button>
              )}
              {speech.status !== 'idle' && (
                <button id="tts-stop" className="reader-btn" onClick={speech.stop} aria-label="Durdur" title="Durdur">
                  <IconStop size={16} />
                </button>
              )}
            </div>
          )}
          <button
            id="quick-bionic"
            className={`reader-btn ${prefs.bionic_reading_enabled ? 'on' : ''}`}
            onClick={() => updatePrefs({ bionic_reading_enabled: !prefs.bionic_reading_enabled })}
            aria-pressed={prefs.bionic_reading_enabled}
            title="Bionic Reading"
            aria-label="Bionic Reading"
          >
            <IconSparkle size={18} />
          </button>
          <button
            id="quick-ruler"
            className={`reader-btn hide-sm ${extras.ruler ? 'on' : ''}`}
            onClick={() => updateExtras({ ruler: !extras.ruler })}
            aria-pressed={extras.ruler}
            title="Okuma cetveli"
            aria-label="Okuma cetveli"
          >
            <IconRuler size={18} />
          </button>
          <button
            id="download-original"
            className="reader-btn hide-sm"
            onClick={handleDownload}
            disabled={downloading}
            title="Orijinal dosyayı indir"
            aria-label="Orijinal dosyayı indir"
          >
            {downloading ? <span className="spinner" /> : <IconDownload size={18} />}
          </button>
          <button
            id="toggle-settings"
            className={`reader-btn ${settingsOpen ? 'on' : ''}`}
            onClick={() => setSettingsOpen((o) => !o)}
            aria-expanded={settingsOpen}
            title="Okuma ayarları"
            aria-label="Okuma ayarları"
          >
            <IconSettings size={18} />
          </button>
        </div>
      </header>

      {error && (
        <div className="reader-alert alert alert-error" role="alert">
          {error}
        </div>
      )}

      <main className="reader-main">
        {text ? (
          <article className="reading-body" style={bodyStyle} lang="tr">
            <ReadingText
              text={text}
              bionic={prefs.bionic_reading_enabled}
              activeParagraph={speech.current}
            />
          </article>
        ) : (
          <p className="reading-body" style={bodyStyle}>
            Bu dokümanda okunabilir metin bulunamadı.
          </p>
        )}
      </main>

      {settingsOpen && (
        <>
          <div className="settings-backdrop" onClick={() => setSettingsOpen(false)} aria-hidden />
          <ReaderSettings
            prefs={prefs}
            extras={extras}
            saveState={saveState}
            onChange={updatePrefs}
            onExtrasChange={updateExtras}
            onReset={handleReset}
            onClose={() => setSettingsOpen(false)}
          />
        </>
      )}

      {extras.ruler && <ReadingRuler height={prefs.font_size * prefs.line_height * 1.35} />}
    </div>
  )
}
