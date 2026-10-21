import type {
  DocumentDetail,
  DocumentListItem,
  Preferences,
  PreferencesUpdate,
  TokenResponse,
  User,
} from './types'

const TOKEN_KEY = 'dyslex_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// 401 alındığında oturumu kapatmak için AuthProvider buraya bir dinleyici bağlar
let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn
}

function parseErrorDetail(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    // Pydantic doğrulama hataları: [{ loc, msg, ... }]
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { loc?: unknown[]; msg?: string }
      const field = first.loc?.[first.loc.length - 1]
      const fieldNames: Record<string, string> = {
        username: 'Kullanıcı adı',
        email: 'E-posta',
        password: 'Şifre',
        title: 'Başlık',
      }
      const label = typeof field === 'string' ? fieldNames[field] ?? field : ''
      return label ? `${label}: ${first.msg ?? 'geçersiz değer'}` : first.msg ?? fallback
    }
  }
  return fallback
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let res: Response
  try {
    res = await fetch(path, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Sunucuya ulaşılamıyor. Backend çalışıyor mu?')
  }

  if (res.status === 204) return undefined as T

  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.()
    throw new ApiError(res.status, parseErrorDetail(body, `İstek başarısız (${res.status})`))
  }
  return body as T
}

/** Yükleme ilerlemesini raporlayabilmek için XHR tabanlı upload */
function uploadWithProgress(
  file: File,
  title: string | undefined,
  onProgress: (percent: number) => void,
): Promise<DocumentDetail> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file)
    if (title) form.append('title', title)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/documents')
    const token = tokenStore.get()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let body: unknown = null
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        /* boş yanıt */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as DocumentDetail)
      } else {
        if (xhr.status === 401) onUnauthorized?.()
        reject(new ApiError(xhr.status, parseErrorDetail(body, 'Yükleme başarısız')))
      }
    }
    xhr.onerror = () => reject(new ApiError(0, 'Sunucuya ulaşılamıyor'))
    xhr.send(form)
  })
}

export const api = {
  // Auth
  register: (data: { username: string; email: string; password: string }) =>
    request<TokenResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { username_or_email: string; password: string }) =>
    request<TokenResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<User>('/api/auth/me'),

  // Documents
  listDocuments: () => request<DocumentListItem[]>('/api/documents'),
  getDocument: (id: number) => request<DocumentDetail>(`/api/documents/${id}`),
  uploadDocument: uploadWithProgress,
  renameDocument: (id: number, title: string) =>
    request<DocumentDetail>(`/api/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),
  deleteDocument: (id: number) => request<void>(`/api/documents/${id}`, { method: 'DELETE' }),
  downloadOriginal: async (id: number, fallbackName: string) => {
    const token = tokenStore.get()
    const res = await fetch(`/api/documents/${id}/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new ApiError(res.status, 'Orijinal dosya indirilemedi')
    const disposition = res.headers.get('Content-Disposition') ?? ''
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
    const name = match ? decodeURIComponent(match[1]) : fallbackName
    const url = URL.createObjectURL(await res.blob())
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  },

  // Preferences
  getPreferences: () => request<Preferences>('/api/preferences'),
  updatePreferences: (data: PreferencesUpdate) =>
    request<Preferences>('/api/preferences', { method: 'PUT', body: JSON.stringify(data) }),
  resetPreferences: () => request<Preferences>('/api/preferences/reset', { method: 'POST' }),
}
