import type { ReactNode } from 'react'
import { IconAlerta, IconOk } from '../icons'

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
