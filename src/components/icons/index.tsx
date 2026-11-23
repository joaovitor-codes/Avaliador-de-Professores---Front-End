import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconBusca = (p: IconProps) => (
  <Svg size={18} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
)
export const IconVoltar = (p: IconProps) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
)
export const IconAvancar = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
)
export const IconMais = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)
export const IconFechar = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)
export const IconAlerta = (p: IconProps) => (
  <Svg size={18} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </Svg>
)
export const IconOk = (p: IconProps) => (
  <Svg size={18} {...p}>
    <path d="m5 12 5 5L20 7" />
  </Svg>
)
export const IconPredio = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
  </Svg>
)
export const IconEmail = (p: IconProps) => (
  <Svg size={30} strokeWidth={1.8} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
)
export function IconEstrela({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
    </svg>
  )
}
export const IconMenu = (p: IconProps) => (
  <Svg size={20} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
)
export const IconLivro = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5v-2z" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
  </Svg>
)
export const IconPessoas = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
  </Svg>
)
export const IconExterno = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Svg>
)
export const IconAspas = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 11H6.5A1.5 1.5 0 0 1 5 9.5v-2A1.5 1.5 0 0 1 6.5 6h2A1.5 1.5 0 0 1 10 7.5V12c0 3-1.5 5-4.5 6" />
    <path d="M19 11h-3.5A1.5 1.5 0 0 1 14 9.5v-2A1.5 1.5 0 0 1 15.5 6h2A1.5 1.5 0 0 1 19 7.5V12c0 3-1.5 5-4.5 6" />
  </Svg>
)
export const IconBrilho = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z" />
    <path d="M19 3v4M17 5h4" />
  </Svg>
)
export const IconSetaDiagonal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Svg>
)
