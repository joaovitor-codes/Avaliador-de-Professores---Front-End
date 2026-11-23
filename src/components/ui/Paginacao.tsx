import { IconAvancar, IconVoltar } from '../icons'

interface PaginacaoProps {
  pagina: number
  totalPaginas: number
  onChange: (pagina: number) => void
}

export function Paginacao({ pagina, totalPaginas, onChange }: PaginacaoProps) {
  if (totalPaginas <= 1) return null

  const paginas: (number | '…')[] = []
  for (let p = 1; p <= totalPaginas; p++) {
    if (p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1) paginas.push(p)
    else if (paginas[paginas.length - 1] !== '…') paginas.push('…')
  }

  return (
    <nav aria-label="Paginação" className="pagination">
      <button type="button" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => onChange(pagina - 1)}>
        <IconVoltar />
      </button>
      {paginas.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="muted" style={{ alignSelf: 'center', padding: '0 4px' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === pagina ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Próxima página"
        disabled={pagina >= totalPaginas}
        onClick={() => onChange(pagina + 1)}
      >
        <IconAvancar />
      </button>
    </nav>
  )
}
