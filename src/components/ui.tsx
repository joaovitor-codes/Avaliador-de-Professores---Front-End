import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router'
import { iniciais } from '../utils/format'
import { IconAlerta, IconFechar, IconOk } from './icons'

interface LogoProps {
  para?: string
  /** Altura da imagem em px. */
  altura?: number
  /** Coloca a logo numa placa branca (para fundos escuros). */
  placa?: boolean
}

/** Logo da UNIFACOL (public/logo-unifacol.png). */
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

interface AlertaProps {
  tipo?: 'erro' | 'ok'
  children: ReactNode
  detalhes?: string[]
}

export function Alerta({ tipo = 'erro', children, detalhes }: AlertaProps) {
  return (
    <div className={`alert alert--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {tipo === 'erro' ? <IconAlerta /> : <IconOk />}
      <div>
        <span>{children}</span>
        {detalhes && detalhes.length > 1 && (
          <ul>
            {detalhes.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

interface CampoProps {
  label: ReactNode
  /** Recebe o id gerado para ligar label e input. */
  children: (id: string, describedBy?: string) => ReactNode
  dica?: ReactNode
  erro?: string | null
  obrigatorio?: boolean
  /** Conteúdo à direita do label (ex.: link "Esqueci minha senha"). */
  extra?: ReactNode
  className?: string
}

export function Campo({ label, children, dica, erro, obrigatorio, extra, className }: CampoProps) {
  const id = useId()
  const dicaId = `${id}-dica`
  const erroId = `${id}-erro`
  const describedBy = [erro ? erroId : null, dica ? dicaId : null].filter(Boolean).join(' ') || undefined
  const labelEl = (
    <label htmlFor={id} className="field__label">
      {label}
      {obrigatorio && <span className="required"> *</span>}
    </label>
  )
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      {extra ? (
        <div className="field__label-row">
          {labelEl}
          {extra}
        </div>
      ) : (
        labelEl
      )}
      {children(id, describedBy)}
      {erro && (
        <span id={erroId} className="field__error">
          {erro}
        </span>
      )}
      {dica && (
        <span id={dicaId} className="field__hint">
          {dica}
        </span>
      )}
    </div>
  )
}

interface ModalProps {
  titulo: string
  onFechar: () => void
  children: ReactNode
}

export function Modal({ titulo, onFechar, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const tituloId = useId()
  // Guardado em ref para o efeito abaixo rodar só ao abrir/fechar (e não roubar o foco a cada render).
  const fecharRef = useRef(onFechar)
  useEffect(() => {
    fecharRef.current = onFechar
  })

  useEffect(() => {
    const el = ref.current
    const anterior = document.activeElement as HTMLElement | null
    el?.querySelector<HTMLElement>('input, select, textarea, button:not([aria-label="Fechar"])')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fecharRef.current()
    }
    el?.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      el?.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      anterior?.focus()
    }
  }, [])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onFechar()
      }}
    >
      <div ref={ref} className="modal" role="dialog" aria-modal="true" aria-labelledby={tituloId}>
        <div className="modal__head">
          <h2 id={tituloId}>{titulo}</h2>
          <button type="button" className="btn--icon" aria-label="Fechar" onClick={onFechar}>
            <IconFechar />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

interface RodapeTabelaProps {
  pagina: number
  porPagina: number
  total: number
  onChange: (pagina: number) => void
}

/** "1–20 de 124" + Anterior / Próxima, usado nas tabelas do admin. */
export function RodapeTabela({ pagina, porPagina, total, onChange }: RodapeTabelaProps) {
  if (total === 0) return null
  const inicio = (pagina - 1) * porPagina + 1
  const fim = Math.min(pagina * porPagina, total)
  return (
    <div className="table-footer">
      <span>
        {inicio}–{fim} de {total}
      </span>
      {total > porPagina && (
        <span className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={pagina <= 1}
            onClick={() => onChange(pagina - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={fim >= total}
            onClick={() => onChange(pagina + 1)}
          >
            Próxima
          </button>
        </span>
      )}
    </div>
  )
}
