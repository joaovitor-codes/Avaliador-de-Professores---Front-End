import { Dica } from './Dica'
import { useDica } from './useDica'

export interface ItemColuna {
  rotulo: string
  valor: number
  valorTexto: string
  titulo: string
  detalhe: string
}

export function Colunas({ itens, altura = 180 }: { itens: ItemColuna[]; altura?: number }) {
  const { ref, dica, mostrar, esconder } = useDica()
  const max = Math.max(1, ...itens.map((i) => i.valor))
  // espaço pro número em cima da coluna
  const alturaUtil = altura - 26

  return (
    <div className="colunas" ref={ref} onMouseLeave={esconder}>
      <div className="colunas__plot" style={{ height: altura, gridTemplateColumns: `repeat(${itens.length}, 1fr)` }}>
        {itens.map((item) => {
          const abrir = (el: Element) =>
            mostrar(el.querySelector('.colunas__barra') ?? el, {
              valor: item.valorTexto,
              titulo: item.titulo,
              detalhe: item.detalhe,
            })
          return (
            <div
              key={item.rotulo}
              className="colunas__slot"
              tabIndex={0}
              aria-label={`${item.titulo}: ${item.valorTexto}. ${item.detalhe}`}
              onMouseEnter={(e) => abrir(e.currentTarget)}
              onFocus={(e) => abrir(e.currentTarget)}
              onBlur={esconder}
            >
              <span className="colunas__valor">{item.valor}</span>
              <span className="colunas__barra" style={{ height: Math.max(item.valor ? 2 : 0, (item.valor / max) * alturaUtil) }} />
            </div>
          )
        })}
      </div>
      <div className="colunas__eixo" style={{ gridTemplateColumns: `repeat(${itens.length}, 1fr)` }} aria-hidden="true">
        {itens.map((i) => (
          <span key={i.rotulo}>{i.rotulo}</span>
        ))}
      </div>
      <Dica dica={dica} />
    </div>
  )
}
