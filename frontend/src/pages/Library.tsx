import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import type { DocumentListItem } from '../api/types'
import { IconCheck, IconEdit, IconFile, IconSearch, IconTrash, IconUpload, IconX } from '../components/Icons'
import { useAuth } from '../context/auth'
import './Library.css'

const ACCEPTED = ['.pdf', '.docx', '.txt']
const MAX_MB = 20

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
const formatDate = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : '')

/* ============ Upload dropzone ============ */
function UploadZone({ onUploaded }: { onUploaded: (doc: DocumentListItem) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleFile = async (file: File) => {
    setError(null)
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setError(`Desteklenmeyen dosya türü. Desteklenenler: ${ACCEPTED.join(', ')}`)
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Dosya ${MAX_MB} MB sınırını aşıyor`)
      return
    }
    setFileName(file.name)
    setProgress(0)
    try {
      const doc = await api.uploadDocument(file, undefined, setProgress)
      onUploaded(doc)
      navigate(`/read/${doc.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yükleme başarısız')
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  const uploading = progress !== null
  // Dosya gönderildikten sonra sunucu metni çıkarırken
  const processing = uploading && progress >= 100

  return (
    <div className="stack" style={{ gap: '0.75rem' }}>
      <div
        id="upload-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Dosya yükle"
        className={`dropzone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id="upload-input"
          type="file"
          accept={ACCEPTED.join(',')}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
        {uploading ? (
          <div className="upload-progress">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="upload-name">
                <IconFile size={18} /> {fileName}
              </span>
              <span className="muted">{processing ? 'Metin çıkarılıyor…' : `%${progress}`}</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-bar ${processing ? 'indeterminate' : ''}`}
                style={{ width: processing ? undefined : `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <span className="dropzone-icon">
              <IconUpload size={28} />
            </span>
            <div>
              <p className="dropzone-title">
                Dosyanı buraya sürükle ya da <span className="gradient-text">seç</span>
              </p>
              <p className="faint dropzone-sub">
                PDF, DOCX veya TXT · en fazla {MAX_MB} MB
              </p>
            </div>
          </>
        )}
      </div>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

/* ============ Document card ============ */
interface DocCardProps {
  doc: DocumentListItem
  index: number
  onRename: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

function DocumentCard({ doc, index, onRename, onDelete }: DocCardProps) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [title, setTitle] = useState(doc.title)
  const [busy, setBusy] = useState(false)

  const submitRename = async (e: FormEvent) => {
    e.preventDefault()
    const next = title.trim()
    if (!next || next === doc.title) {
      setEditing(false)
      setTitle(doc.title)
      return
    }
    setBusy(true)
    try {
      await onRename(doc.id, next)
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await onDelete(doc.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card doc-card" style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}>
      <div className="doc-thumb" aria-hidden>
        <span className="doc-lines">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="doc-initial">{doc.title.slice(0, 1).toUpperCase()}</span>
      </div>

      {editing ? (
        <form className="rename-form" onSubmit={submitRename}>
          <input
            className="input"
            autoFocus
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditing(false)
                setTitle(doc.title)
              }
            }}
            aria-label="Yeni başlık"
          />
          <button className="icon-btn" type="submit" disabled={busy} aria-label="Kaydet">
            <IconCheck size={18} />
          </button>
        </form>
      ) : (
        <Link to={`/read/${doc.id}`} className="doc-title" title={doc.title}>
          {doc.title}
        </Link>
      )}
      <p className="faint doc-date">{formatDate(doc.created_at)}</p>

      <div className="doc-actions">
        {confirming ? (
          <>
            <span className="muted confirm-text">Silinsin mi?</span>
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={busy}>
              Sil
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
              Vazgeç
            </button>
          </>
        ) : (
          <>
            <Link to={`/read/${doc.id}`} className="btn btn-primary btn-sm">
              Oku
            </Link>
            <span style={{ flex: 1 }} />
            <button
              className="icon-btn"
              onClick={() => setEditing(true)}
              aria-label={`${doc.title} başlığını düzenle`}
              title="Yeniden adlandır"
            >
              <IconEdit size={17} />
            </button>
            <button
              className="icon-btn"
              onClick={() => setConfirming(true)}
              aria-label={`${doc.title} dokümanını sil`}
              title="Sil"
            >
              <IconTrash size={17} />
            </button>
          </>
        )}
      </div>
    </article>
  )
}

/* ============ Page ============ */
export default function Library() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<DocumentListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .listDocuments()
      .then((list) => !cancelled && setDocs(list))
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Dokümanlar yüklenemedi')
        setDocs([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!docs) return []
    const q = query.trim().toLocaleLowerCase('tr')
    return q ? docs.filter((d) => d.title.toLocaleLowerCase('tr').includes(q)) : docs
  }, [docs, query])

  const handleRename = async (id: number, title: string) => {
    try {
      const updated = await api.renameDocument(id, title)
      setDocs((prev) => prev?.map((d) => (d.id === id ? { ...d, title: updated.title } : d)) ?? null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yeniden adlandırılamadı')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.deleteDocument(id)
      setDocs((prev) => prev?.filter((d) => d.id !== id) ?? null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Silinemedi')
    }
  }

  return (
    <div className="container page library">
      <header className="library-head">
        <div>
          <h1>
            Merhaba, <span className="gradient-text">{user?.username}</span>
          </h1>
          <p className="muted">Okumak istediğin dosyayı yükle ya da kütüphanenden birini seç.</p>
        </div>
      </header>

      <UploadZone onUploaded={(doc) => setDocs((prev) => [doc, ...(prev ?? [])])} />

      <section className="stack" style={{ gap: '1.2rem' }}>
        <div className="library-toolbar">
          <h2>
            Kütüphanem {docs && docs.length > 0 && <span className="count">{docs.length}</span>}
          </h2>
          {docs && docs.length > 0 && (
            <label className="search">
              <IconSearch size={18} />
              <input
                id="library-search"
                type="search"
                placeholder="Başlıkta ara…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="search-clear" onClick={() => setQuery('')} aria-label="Aramayı temizle">
                  <IconX size={16} />
                </button>
              )}
            </label>
          )}
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {docs === null ? (
          <div className="doc-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 230 }} />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="empty card">
            <span className="feature-icon" style={{ margin: '0 auto' }}>
              <IconFile size={22} />
            </span>
            <h3>Henüz doküman yok</h3>
            <p className="muted">İlk dosyanı yukarıdaki alana sürükleyerek başlayabilirsin.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="muted">“{query}” ile eşleşen doküman bulunamadı.</p>
        ) : (
          <div className="doc-grid">
            {filtered.map((doc, i) => (
              <DocumentCard key={doc.id} doc={doc} index={i} onRename={handleRename} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
