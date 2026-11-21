import type { ReactNode } from 'react'
import { IconMenu } from './icons'
import { MenuUsuario } from './MenuUsuario'
import { Logo } from './ui'

interface Props {
  logoPara: string
  /** Etiqueta ao lado da logo (ex.: "Admin"). */
  etiqueta?: string
  onMenu: () => void
  menuAberto: boolean
  /** id do elemento que o botão ☰ abre/fecha. */
  controla: string
  /** true = o botão ☰ só aparece no celular. */
  menuSoNoCelular?: boolean
  children?: ReactNode
}

/** Barra superior no estilo do AcadWeb. */
export function AppBar({ logoPara, etiqueta, onMenu, menuAberto, controla, menuSoNoCelular, children }: Props) {
  return (
    <header className="appbar">
      <div className="appbar__brand">
        <Logo para={logoPara} altura={36} />
        {etiqueta && <span className="appbar__tag">{etiqueta}</span>}
      </div>
      <div className="appbar__bar">
        <button
          type="button"
          className={`appbar__toggle${menuSoNoCelular ? ' so-mobile' : ''}`}
          aria-label="Menu"
          aria-expanded={menuAberto}
          aria-controls={controla}
          onClick={onMenu}
        >
          <IconMenu />
        </button>
        {children}
        <span className="appbar__spacer" />
        <MenuUsuario />
      </div>
    </header>
  )
}
