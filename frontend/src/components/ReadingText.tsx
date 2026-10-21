import { memo, useMemo } from 'react'
import { bionicSplit, splitParagraphs } from '../lib/reading'

interface ParagraphProps {
  text: string
  bionic: boolean
  active?: boolean
}

/** Tek paragraf: bionic modda her kelimenin başı vurgulanır */
const Paragraph = memo(function Paragraph({ text, bionic, active }: ParagraphProps) {
  const className = active ? 'speaking' : undefined
  if (!bionic) return <p className={className}>{text}</p>
  // Boşlukları koruyarak kelimelere ayır
  const parts = text.split(/(\s+)/)
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (!part.trim()) return part
        // Kelimenin başındaki noktalama işaretlerini vurgulama dışında tut
        const match = /^([^\p{L}\p{N}]*)(.*)$/u.exec(part)
        const lead = match?.[1] ?? ''
        const word = match?.[2] ?? part
        const [head, tail] = bionicSplit(word)
        return (
          <span key={i}>
            {lead}
            <b className="bionic-head">{head}</b>
            {tail}
          </span>
        )
      })}
    </p>
  )
})

interface ReadingTextProps {
  text: string
  bionic: boolean
  /** Sesli okuma sırasında vurgulanacak paragraf */
  activeParagraph?: number | null
}

/** Çıkarılan metni paragraflara bölüp okuma stiline göre render eder */
export const ReadingText = memo(function ReadingText({ text, bionic, activeParagraph }: ReadingTextProps) {
  const paragraphs = useMemo(() => splitParagraphs(text), [text])
  return (
    <>
      {paragraphs.map((p, i) => (
        <Paragraph key={i} text={p} bionic={bionic} active={activeParagraph === i} />
      ))}
    </>
  )
})
