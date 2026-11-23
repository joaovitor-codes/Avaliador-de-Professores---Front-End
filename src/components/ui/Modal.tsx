import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconFechar } from '../icons'

interface ModalProps {
  titulo: string
  onFechar: () => void
  children: ReactNode
}

export function Modal({ titulo, onFechar, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const tituloId = useId()
  // fica num ref pro efeito não rodar a cada render (senão rouba o foco)
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
