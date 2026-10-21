import type { CSSProperties } from 'react'
import type { Preferences } from '../api/types'
import { COLOR_THEMES, FONT_OPTIONS, type ReaderExtras } from '../lib/reading'
import { IconX } from './Icons'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  prefs: Preferences
  extras: ReaderExtras
  saveState: SaveState
  onChange: (patch: Partial<Preferences>) => void
  onExtrasChange: (patch: Partial<ReaderExtras>) => void
  onReset: () => void
  onClose: () => void
}

const SAVE_LABEL: Record<SaveState, string> = {
  idle: '',
  saving: 'Kaydediliyor…',
  saved: 'Kaydedildi ✓',
  error: 'Kaydedilemedi',
}

function Slider(props: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}) {
  const pct = ((props.value - props.min) / (props.max - props.min)) * 100
  return (
    <div className="setting">
      <div className="setting-head">
        <label htmlFor={props.id}>{props.label}</label>
        <span className="setting-value">{props.display}</span>
      </div>
      <input
        id={props.id}
        type="range"
        className="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        style={{ '--pct': `${pct}%` } as CSSProperties}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function ReaderSettings({
  prefs,
  extras,
  saveState,
  onChange,
  onExtrasChange,
  onReset,
  onClose,
}: Props) {
  return (
    <aside className="settings-panel" aria-label="Okuma ayarları">
      <div className="settings-head">
        <div>
          <h2>Okuma ayarları</h2>
          <span className={`save-state ${saveState}`} aria-live="polite">
            {SAVE_LABEL[saveState]}
          </span>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Ayarları kapat">
          <IconX size={18} />
        </button>
      </div>

      <div className="settings-body">
        {/* Yazı tipi */}
        <section className="setting">
          <span className="setting-title">Yazı tipi</span>
          <div className="font-list" role="radiogroup" aria-label="Yazı tipi">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                role="radio"
                aria-checked={prefs.font_family === f.value}
                className={`font-option ${prefs.font_family === f.value ? 'active' : ''}`}
                onClick={() => onChange({ font_family: f.value })}
              >
                <span className="font-sample" style={{ fontFamily: f.css }}>
                  Aa
                </span>
                <span className="font-meta">
                  <span style={{ fontFamily: f.css }}>{f.label}</span>
                  <small>{f.note}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Zemin rengi */}
        <section className="setting">
          <span className="setting-title">Zemin rengi</span>
          <div className="swatch-group" role="radiogroup" aria-label="Zemin rengi">
            {COLOR_THEMES.map((t) => (
              <button
                key={t.value}
                role="radio"
                aria-checked={prefs.background_color.toLowerCase() === t.value.toLowerCase()}
                aria-label={t.label}
                title={t.label}
                className={`swatch ${
                  prefs.background_color.toLowerCase() === t.value.toLowerCase() ? 'active' : ''
                }`}
                style={{ background: t.value, color: t.text }}
                onClick={() => onChange({ background_color: t.value })}
              />
            ))}
            <label className="swatch swatch-custom" title="Özel renk">
              <input
                type="color"
                aria-label="Özel zemin rengi"
                value={prefs.background_color}
                onChange={(e) => onChange({ background_color: e.target.value.toUpperCase() })}
              />
            </label>
          </div>
        </section>

        <Slider
          id="font-size"
          label="Yazı boyutu"
          value={prefs.font_size}
          min={12}
          max={40}
          step={1}
          display={`${prefs.font_size}px`}
          onChange={(v) => onChange({ font_size: v })}
        />
        <Slider
          id="line-height"
          label="Satır aralığı"
          value={prefs.line_height}
          min={1.2}
          max={2.6}
          step={0.1}
          display={prefs.line_height.toFixed(1)}
          onChange={(v) => onChange({ line_height: Math.round(v * 10) / 10 })}
        />

        <label className="setting toggle-row toggle-setting">
          <span>
            <span className="setting-title">Bionic Reading</span>
            <small className="faint">Kelimelerin başını vurgular</small>
          </span>
          <input
            id="bionic-toggle"
            type="checkbox"
            className="toggle"
            checked={prefs.bionic_reading_enabled}
            onChange={(e) => onChange({ bionic_reading_enabled: e.target.checked })}
          />
        </label>

        <div className="settings-divider">
          <span>Bu cihaz için</span>
        </div>

        <Slider
          id="letter-spacing"
          label="Harf aralığı"
          value={extras.letterSpacing}
          min={0}
          max={0.2}
          step={0.01}
          display={`${Math.round(extras.letterSpacing * 100)}%`}
          onChange={(v) => onExtrasChange({ letterSpacing: v })}
        />
        <Slider
          id="word-spacing"
          label="Kelime aralığı"
          value={extras.wordSpacing}
          min={0}
          max={0.6}
          step={0.02}
          display={`${Math.round(extras.wordSpacing * 100)}%`}
          onChange={(v) => onExtrasChange({ wordSpacing: v })}
        />
        <Slider
          id="max-width"
          label="Satır genişliği"
          value={extras.maxWidth}
          min={40}
          max={100}
          step={2}
          display={`${extras.maxWidth} karakter`}
          onChange={(v) => onExtrasChange({ maxWidth: v })}
        />
        <label className="setting toggle-row toggle-setting">
          <span>
            <span className="setting-title">Okuma cetveli</span>
            <small className="faint">İmlecin olduğu satırı öne çıkarır</small>
          </span>
          <input
            id="ruler-toggle"
            type="checkbox"
            className="toggle"
            checked={extras.ruler}
            onChange={(e) => onExtrasChange({ ruler: e.target.checked })}
          />
        </label>

        <button id="reset-preferences" className="btn btn-ghost" onClick={onReset}>
          Varsayılanlara dön
        </button>
      </div>
    </aside>
  )
}
