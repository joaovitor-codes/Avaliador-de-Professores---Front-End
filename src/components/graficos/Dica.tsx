import type { DicaDados } from './useDica'

export function Dica({ dica }: { dica: DicaDados | null }) {
  if (!dica) return null
  return (
    <div className="dica" style={{ left: dica.x, top: dica.y }} role="status">
      <strong>{dica.valor}</strong>
      <span>{dica.titulo}</span>
      {dica.detalhe && <span className="dica__detalhe">{dica.detalhe}</span>}
    </div>
  )
}
