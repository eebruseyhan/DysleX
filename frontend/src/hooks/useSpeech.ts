import { useCallback, useEffect, useRef, useState } from 'react'

export type SpeechStatus = 'idle' | 'playing' | 'paused'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))
  )
}

/**
 * Metni paragraf paragraf sesli okur ve o an okunan paragrafın indeksini döndürür.
 * Uzun metinlerde tarayıcı sınırlarına takılmamak için her paragraf ayrı bir utterance'tır.
 */
export function useSpeech(paragraphs: string[], { lang = 'tr-TR', rate = 0.9 } = {}) {
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [current, setCurrent] = useState<number | null>(null)
  // cancel() sonrası eski utterance olaylarının durumu bozmasını engeller
  const sessionRef = useRef(0)

  const stop = useCallback(() => {
    if (!supported) return
    sessionRef.current += 1
    window.speechSynthesis.cancel()
    setStatus('idle')
    setCurrent(null)
  }, [])

  const play = useCallback(
    (from = 0) => {
      if (!supported || paragraphs.length === 0) return
      const synth = window.speechSynthesis
      synth.cancel()
      const session = ++sessionRef.current
      const voice = pickVoice(lang)

      paragraphs.slice(from).forEach((text, offset) => {
        const index = from + offset
        const u = new SpeechSynthesisUtterance(text)
        u.lang = lang
        u.rate = rate
        if (voice) u.voice = voice
        u.onstart = () => {
          if (sessionRef.current === session) setCurrent(index)
        }
        u.onend = () => {
          if (sessionRef.current === session && index === paragraphs.length - 1) {
            setStatus('idle')
            setCurrent(null)
          }
        }
        synth.speak(u)
      })
      setStatus('playing')
    },
    [paragraphs, lang, rate],
  )

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    setStatus('paused')
  }, [])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    setStatus('playing')
  }, [])

  // Sayfadan çıkınca veya metin değişince okumayı durdur
  useEffect(() => stop, [stop, paragraphs])

  return { supported, status, current, play, pause, resume, stop }
}
