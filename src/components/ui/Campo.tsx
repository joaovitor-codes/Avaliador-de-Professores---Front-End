import { useId, type ReactNode } from 'react'

interface CampoProps {
  label: ReactNode
  children: (id: string, describedBy?: string) => ReactNode
  dica?: ReactNode
  erro?: string | null
  obrigatorio?: boolean
  // ex: link de "Esqueci minha senha"
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
