import type { SVGProps } from 'react'

/** Hafif, bağımlılıksız satır ikon seti (24x24, stroke tabanlı) */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export const IconUpload = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
)

export const IconBook = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
  </svg>
)

export const IconFile = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
)

export const IconSettings = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
)

export const IconArrowLeft = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </svg>
)

export const IconTrash = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
)

export const IconEdit = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
  </svg>
)

export const IconDownload = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 4v12m0 0-4.5-4.5M12 16l4.5-4.5" />
    <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
  </svg>
)

export const IconSearch = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const IconX = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconCheck = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const IconRuler = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="9" width="18" height="6" rx="2" />
    <path d="M3 5h18M3 19h18" opacity=".45" />
  </svg>
)

export const IconSparkle = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </svg>
)

export const IconLogout = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" />
  </svg>
)

export const IconPlay = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" />
  </svg>
)

export const IconPause = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M8 5v14M16 5v14" />
  </svg>
)

export const IconStop = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)
