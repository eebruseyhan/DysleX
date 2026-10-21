import type { Preferences } from '../api/types'

export interface FontOption {
  /** Veritabanında saklanan değer (font_family, max 50 karakter) */
  value: string
  label: string
  /** CSS font-family yığını */
  css: string
  note: string
}

export const FONT_OPTIONS: FontOption[] = [
  {
    value: 'Lexend',
    label: 'Lexend',
    css: "'Lexend Variable', 'Lexend', sans-serif",
    note: 'Okuma akıcılığı için tasarlandı',
  },
  {
    value: 'OpenDyslexic',
    label: 'OpenDyslexic',
    css: "'OpenDyslexic', sans-serif",
    note: 'Ağırlıklı alt kısım, harf karışmasını azaltır',
  },
  {
    value: 'Atkinson Hyperlegible',
    label: 'Atkinson',
    css: "'Atkinson Hyperlegible', sans-serif",
    note: 'Benzer harfleri belirgin ayırır',
  },
  {
    value: 'Verdana',
    label: 'Verdana',
    css: 'Verdana, Geneva, sans-serif',
    note: 'Geniş harf aralıklı klasik',
  },
  {
    value: 'Arial',
    label: 'Arial',
    css: 'Arial, Helvetica, sans-serif',
    note: 'Sade ve tanıdık',
  },
]

export interface ColorTheme {
  value: string
  label: string
  text: string
}

/** Disleksi için önerilen, saf beyaz olmayan düşük parlamalı zeminler */
export const COLOR_THEMES: ColorTheme[] = [
  { value: '#FEFBEA', label: 'Krem', text: '#2B2A26' },
  { value: '#FDF0E1', label: 'Şeftali', text: '#33291F' },
  { value: '#FFF6C7', label: 'Açık sarı', text: '#2F2B17' },
  { value: '#E8F4EA', label: 'Nane', text: '#1F2E24' },
  { value: '#E5EFF8', label: 'Açık mavi', text: '#1C2836' },
  { value: '#EFEAF6', label: 'Lavanta', text: '#29233A' },
  { value: '#ECECEC', label: 'Gri', text: '#262626' },
  { value: '#22212A', label: 'Gece', text: '#E8E3D8' },
]

export const DEFAULT_PREFERENCES: Preferences = {
  font_family: 'Lexend',
  font_size: 16,
  background_color: '#FEFBEA',
  line_height: 1.5,
  bionic_reading_enabled: false,
}

/** Veritabanında olmayan, cihazda (localStorage) saklanan ek okuma ayarları */
export interface ReaderExtras {
  letterSpacing: number // em
  wordSpacing: number // em
  maxWidth: number // ch
  ruler: boolean
}

export const DEFAULT_EXTRAS: ReaderExtras = {
  letterSpacing: 0.02,
  wordSpacing: 0.1,
  maxWidth: 68,
  ruler: false,
}

export const fontCss = (value: string) =>
  FONT_OPTIONS.find((f) => f.value === value)?.css ?? `'${value}', sans-serif`

/** Zemin rengine göre okunabilir metin rengi seçer */
export function textColorFor(bg: string): string {
  const preset = COLOR_THEMES.find((t) => t.value.toLowerCase() === bg.toLowerCase())
  if (preset) return preset.text
  const hex = bg.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#2B2A26'
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.5 ? '#2B2A26' : '#E8E3D8'
}

export const isDark = (bg: string) => textColorFor(bg) === '#E8E3D8'

/**
 * Bionic Reading: kelimenin ilk ~%40'ını "sabitleme noktası" olarak ayırır.
 * Göz bu kısma odaklanır, beyin kelimenin geri kalanını tamamlar.
 */
export function bionicSplit(word: string): [string, string] {
  const letters = word.length
  if (letters <= 1) return [word, '']
  const fix = letters <= 3 ? 1 : Math.ceil(letters * 0.4)
  return [word.slice(0, fix), word.slice(fix)]
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

/** Metni okuma için paragraflara böler (sesli okuma da aynı bölümlemeyi kullanır) */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** Disleksili okurlar için daha yavaş tempo (~150 kelime/dk) baz alınır */
export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 150))
