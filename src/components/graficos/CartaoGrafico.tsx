import { useId, useState, type ReactNode } from 'react'

interface Tabela {
  colunas: string[]
  linhas: (string | number)[][]
}

interface CartaoGraficoProps {
  titulo: string
  subtitulo?: string
  tabela: Tabela
  children: ReactNode
  className?: string
}

export function CartaoGrafico({ titulo, subtitulo, tabela, children, className }: CartaoGraficoProps) {
  const [verTabela, setVerTabela] = useState(false)
  const tituloId = useId()
  return (
    <figure className={`card grafico${className ? ` ${className}` : ''}`} aria-labelledby={tituloId}>
      <div className="grafico__cab">
        <div>
          <h2 id={tituloId} className="card__title">
            {titulo}
          </h2>
          {subtitulo && <p className="muted small">{subtitulo}</p>}
        </div>
        <button type="button" className="btn--text" onClick={() => setVerTabela((v) => !v)}>
          {verTabela ? 'Ver gráfico' : 'Ver tabela'}
        </button>
      </div>
      {verTabela ? (
        <div className="table-wrap">
          <table className="table table--plain">
            <thead>
              <tr>
                {tabela.colunas.map((c, i) => (
                  <th key={c} style={i > 0 ? { textAlign: 'right' } : undefined}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabela.linhas.map((linha, i) => (
                <tr key={i}>
                  {linha.map((celula, j) => (
                    <td key={j} style={j > 0 ? { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } : undefined}>
                      {celula}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </figure>
  )
}
