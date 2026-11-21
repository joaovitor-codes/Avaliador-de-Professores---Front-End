import { Link } from 'react-router'
import { iniciais } from '../utils/format'

interface LogoProps {
  para?: string
  altura?: number
  placa?: boolean
}

export function Logo({ para = '/', altura = 40, placa = false }: LogoProps) {
  return (
    <Link to={para} className={`logo${placa ? ' logo--placa' : ''}`}>
      <img src="/logo-unifacol.png" alt="UNIFACOL — página inicial" height={altura} />
    </Link>
  )
}

export function Avatar({ nome, tamanho = 'md' }: { nome: string; tamanho?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`avatar avatar--${tamanho}`} aria-hidden="true">
      {iniciais(nome)}
    </span>
  )
}

export function Carregando({ tela = false }: { tela?: boolean }) {
  return (
    <div className={`loading${tela ? ' loading--tela' : ''}`} role="status">
      <span className="spinner" />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}