interface RodapeTabelaProps {
  pagina: number
  porPagina: number
  total: number
  onChange: (pagina: number) => void
}

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
