// Backend şemalarıyla (backend/app/schemas.py) birebir eşleşen tipler

export interface User {
  id: number
  username: string
  email: string
  role: string | null
  created_at: string | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface DocumentListItem {
  id: number
  title: string
  created_at: string | null
}

export interface DocumentDetail extends DocumentListItem {
  extracted_text: string | null
}

export interface Preferences {
  font_family: string
  font_size: number
  background_color: string
  line_height: number
  bionic_reading_enabled: boolean
  updated_at?: string | null
}

export type PreferencesUpdate = Partial<Omit<Preferences, 'updated_at'>>
