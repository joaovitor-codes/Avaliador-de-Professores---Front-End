import type { AvaliacaoListItem, Uuid } from '../api/types'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const media = (valores: number[]) => (valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null)

export interface Estatisticas {
  total: number
  mediaGeral: number | null
  totalNotas: number
  porCriterio: { id: Uuid; nome: string; media: number | null; n: number }[]
  distribuicao: { nota: number; qtd: number; pct: number }[]
  // um ponto por mês, mês sem avaliação fica null
  porMes: { chave: string; rotulo: string; media: number | null; n: number }[]
  porDisciplina: { id: Uuid; nome: string; codigo: string | null; media: number | null; n: number }[]
  recomendariam: { sim: number; responderam: number }
  comComentario: number
}

// a api não tem rota de estatísticas, então calcula aqui
export function calcularEstatisticas(avaliacoes: AvaliacaoListItem[]): Estatisticas {
  const todasNotas = avaliacoes.flatMap((a) => a.notas.map((n) => n.nota))

  const criterios = new Map<Uuid, { nome: string; notas: number[] }>()
  for (const a of avaliacoes)
    for (const n of a.notas) {
      const c = criterios.get(n.criterio.id) ?? { nome: n.criterio.nome, notas: [] }
      c.notas.push(n.nota)
      criterios.set(n.criterio.id, c)
    }

  const disciplinas = new Map<Uuid, { nome: string; codigo: string | null; notas: number[]; n: number }>()
  for (const a of avaliacoes) {
    const d = disciplinas.get(a.disciplina.id) ?? { nome: a.disciplina.nome, codigo: a.disciplina.codigo, notas: [], n: 0 }
    d.notas.push(...a.notas.map((n) => n.nota))
    d.n++
    disciplinas.set(a.disciplina.id, d)
  }

  const meses = new Map<string, number[]>()
  for (const a of avaliacoes) {
    const chave = a.createdAt.slice(0, 7)
    meses.set(chave, [...(meses.get(chave) ?? []), ...a.notas.map((n) => n.nota)])
  }
  const porMes: Estatisticas['porMes'] = []
  const chaves = [...meses.keys()].sort()
  if (chaves.length > 0) {
    let [ano, mes] = chaves[0].split('-').map(Number)
    const [anoFim, mesFim] = chaves[chaves.length - 1].split('-').map(Number)
    while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
      const chave = `${ano}-${String(mes).padStart(2, '0')}`
      const notas = meses.get(chave) ?? []
      porMes.push({ chave, rotulo: `${MESES[mes - 1]}/${String(ano).slice(2)}`, media: media(notas), n: notas.length })
      mes++
      if (mes > 12) {
        mes = 1
        ano++
      }
    }
  }

  const responderam = avaliacoes.filter((a) => a.recomendaria !== null)

  return {
    total: avaliacoes.length,
    mediaGeral: media(todasNotas),
    totalNotas: todasNotas.length,
    porCriterio: [...criterios].map(([id, c]) => ({ id, nome: c.nome, media: media(c.notas), n: c.notas.length })),
    distribuicao: [1, 2, 3, 4, 5].map((nota) => {
      const qtd = todasNotas.filter((n) => n === nota).length
      return { nota, qtd, pct: todasNotas.length ? qtd / todasNotas.length : 0 }
    }),
    porMes,
    porDisciplina: [...disciplinas]
      .map(([id, d]) => ({ id, nome: d.nome, codigo: d.codigo, media: media(d.notas), n: d.n }))
      .sort((a, b) => (b.media ?? 0) - (a.media ?? 0)),
    recomendariam: { sim: responderam.filter((a) => a.recomendaria).length, responderam: responderam.length },
    comComentario: avaliacoes.filter((a) => a.comentario?.trim()).length,
  }
}
