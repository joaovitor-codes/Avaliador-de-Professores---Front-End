import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { mensagemDeErro } from '../api/client'
import { todasAvaliacoes } from '../api/professores'
import type { Professor } from '../api/types'
import { ComMeuProfessor } from '../components/professor/ComMeuProfessor'
import { BarrasHorizontais, CartaoGrafico, Colunas, Linha } from '../components/graficos'
import { IconEstrela } from '../components/icons'
import { Alerta, Carregando, Nota } from '../components/ui'
import { calcularEstatisticas, type Estatisticas } from '../utils/estatisticas'
import { formatarData, formatarNota, plural } from '../utils/format'
import { useCarregar } from '../utils/useCarregar'

const pct = (parte: number, todo: number) => `${Math.round((parte / todo) * 100)}%`

function Resumo({ est }: { est: Estatisticas }) {
  const criterios = est.porCriterio.filter((c) => c.media !== null)
  if (criterios.length < 2) return null
  const ordenados = [...criterios].sort((a, b) => (b.media ?? 0) - (a.media ?? 0))
  const melhor = ordenados[0]
  const pior = ordenados[ordenados.length - 1]
  if (melhor.media === pior.media)
    return (
      <p className="painel__resumo">
        Suas notas estão iguais em todos os critérios: <strong>{formatarNota(melhor.media, 1)}</strong>.
      </p>
    )
  return (
    <p className="painel__resumo">
      Seu ponto mais forte é <strong>{melhor.nome}</strong> ({formatarNota(melhor.media, 1)}). O que mais pode
      melhorar é <strong>{pior.nome}</strong> ({formatarNota(pior.media, 1)}).
    </p>
  )
}

function Indicadores({ est }: { est: Estatisticas }) {
  const { sim, responderam } = est.recomendariam
  return (
    <div className="indicadores">
      <div className="card indicador indicador--destaque">
        <span className="indicador__rotulo">Média geral</span>
        <span className="indicador__heroi">
          <IconEstrela size={32} />
          {formatarNota(est.mediaGeral)}
        </span>
        <span className="indicador__sub">de 5 · {plural(est.totalNotas, 'nota', 'notas')} somando os critérios</span>
      </div>
      <div className="card indicador">
        <span className="indicador__rotulo">Avaliações</span>
        <span className="indicador__valor">{est.total.toLocaleString('pt-BR')}</span>
        <span className="indicador__sub">{plural(est.comComentario, 'com comentário', 'com comentário')}</span>
      </div>
      <div className="card indicador">
        <span className="indicador__rotulo">Recomendariam</span>
        <span className="indicador__valor">{responderam ? pct(sim, responderam) : '—'}</span>
        <span className="indicador__sub">
          {responderam ? `${sim} de ${plural(responderam, 'aluno respondeu', 'alunos responderam')}` : 'Ninguém respondeu ainda'}
        </span>
      </div>
      <div className="card indicador">
        <span className="indicador__rotulo">Disciplinas avaliadas</span>
        <span className="indicador__valor">{est.porDisciplina.length}</span>
        <span className="indicador__sub">
          {est.porDisciplina.length > 0
            ? `Melhor média: ${est.porDisciplina[0].nome}`
            : 'Nenhuma ainda'}
        </span>
      </div>
    </div>
  )
}

function Painel({ professor }: { professor: Professor }) {
  const [disciplinaId, setDisciplinaId] = useState('')
  const avaliacoes = useCarregar(() => todasAvaliacoes(professor.id), [professor.id])

  const filtradas = useMemo(
    () =>
      (avaliacoes.dados ?? [])
        .filter((a) => !disciplinaId || a.disciplina.id === disciplinaId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [avaliacoes.dados, disciplinaId],
  )
  const est = useMemo(() => calcularEstatisticas(filtradas), [filtradas])

  const nomeDisciplina = professor.disciplinas.find((d) => d.disciplina.id === disciplinaId)?.disciplina.nome
  const mesesComDados = est.porMes.filter((m) => m.media !== null).length

  return (
    <main className="container stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meu painel</h1>
          <p className="page-subtitle">Como os alunos avaliam as suas aulas.</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Link to={`/professores/${professor.id}`} className="btn btn--secondary">
            Ver página pública
          </Link>
          <Link to="/meu-perfil/editar" className="btn btn--primary">
            Editar perfil
          </Link>
        </div>
      </div>

      <div className="painel__filtros">
        <label htmlFor="filtro-disciplina" className="field__label">
          Disciplina
        </label>
        <select
          id="filtro-disciplina"
          className="select"
          value={disciplinaId}
          onChange={(e) => setDisciplinaId(e.target.value)}
        >
          <option value="">Todas as disciplinas</option>
          {professor.disciplinas.map(({ disciplina: d }) => (
            <option key={d.id} value={d.id}>
              {d.codigo ? `${d.nome} — ${d.codigo}` : d.nome}
            </option>
          ))}
        </select>
      </div>

      {avaliacoes.erro ? (
        <Alerta>{mensagemDeErro(avaliacoes.erro, 'Não foi possível carregar suas avaliações.')}</Alerta>
      ) : !avaliacoes.dados ? (
        <Carregando />
      ) : est.total === 0 ? (
        <div className="card empty">
          {disciplinaId
            ? `Você ainda não recebeu avaliações em ${nomeDisciplina ?? 'nesta disciplina'}.`
            : 'Você ainda não recebeu avaliações. Quando os alunos avaliarem suas aulas, os resultados aparecem aqui.'}
        </div>
      ) : (
        <>
          <Resumo est={est} />
          <Indicadores est={est} />

          <div className="painel__grade">
            <CartaoGrafico
              titulo="Média por critério"
              subtitulo="Escala de 1 a 5"
              className="painel__largo"
              tabela={{
                colunas: ['Critério', 'Média', 'Notas'],
                linhas: est.porCriterio.map((c) => [c.nome, formatarNota(c.media, 2), c.n]),
              }}
            >
              <BarrasHorizontais
                itens={est.porCriterio.map((c) => ({
                  id: c.id,
                  rotulo: c.nome,
                  valor: c.media,
                  valorTexto: formatarNota(c.media, 1),
                  detalhe: plural(c.n, 'nota', 'notas'),
                }))}
              />
            </CartaoGrafico>

            <CartaoGrafico
              titulo="Distribuição das notas"
              subtitulo="Quantas vezes cada nota foi dada, somando todos os critérios"
              tabela={{
                colunas: ['Nota', 'Quantidade', '%'],
                linhas: est.distribuicao.map((d) => [d.nota, d.qtd, pct(d.qtd, est.totalNotas)]),
              }}
            >
              <Colunas
                itens={est.distribuicao.map((d) => ({
                  rotulo: `${d.nota}`,
                  valor: d.qtd,
                  valorTexto: plural(d.qtd, 'nota', 'notas'),
                  titulo: `Nota ${d.nota}`,
                  detalhe: `${pct(d.qtd, est.totalNotas)} do total`,
                }))}
              />
            </CartaoGrafico>

            {!disciplinaId && (
              <CartaoGrafico
                titulo="Média por disciplina"
                subtitulo="Da maior para a menor"
                tabela={{
                  colunas: ['Disciplina', 'Média', 'Avaliações'],
                  linhas: est.porDisciplina.map((d) => [d.nome, formatarNota(d.media, 2), d.n]),
                }}
              >
                <BarrasHorizontais
                  itens={est.porDisciplina.map((d) => ({
                    id: d.id,
                    rotulo: d.nome,
                    sub: d.codigo ?? undefined,
                    valor: d.media,
                    valorTexto: formatarNota(d.media, 1),
                    detalhe: plural(d.n, 'avaliação', 'avaliações'),
                  }))}
                />
              </CartaoGrafico>
            )}
            <CartaoGrafico
              titulo="Evolução"
              className="painel__largo"
              subtitulo="Média das notas recebidas em cada mês"
              tabela={{
                colunas: ['Mês', 'Média', 'Notas'],
                linhas: est.porMes.map((m) => [m.rotulo, formatarNota(m.media, 2), m.n]),
              }}
            >
              {mesesComDados < 2 ? (
                <p className="muted painel__aviso">
                  Todas as avaliações são de {est.porMes[0]?.rotulo ?? 'um único mês'}. A evolução aparece quando houver
                  avaliações em pelo menos dois meses.
                </p>
              ) : (
                <Linha
                  pontos={est.porMes.map((m) => ({
                    rotulo: m.rotulo,
                    valor: m.media,
                    valorTexto: formatarNota(m.media, 1),
                    detalhe: m.n ? plural(m.n, 'nota', 'notas') : 'Sem avaliações',
                  }))}
                />
              )}
            </CartaoGrafico>
          </div>

          <section className="card">
            <div className="card__head" style={{ marginBottom: 4 }}>
              <h2 className="card__title">Comentários recentes</h2>
              <Link to={`/professores/${professor.id}`} className="small">
                Ver todas as avaliações
              </Link>
            </div>
            {filtradas.filter((a) => a.comentario?.trim()).length === 0 ? (
              <p className="muted" style={{ paddingTop: 12 }}>
                Nenhum comentário ainda.
              </p>
            ) : (
              filtradas
                .filter((a) => a.comentario?.trim())
                .slice(0, 5)
                .map((a) => {
                  const media = a.notas.reduce((s, n) => s + n.nota, 0) / (a.notas.length || 1)
                  return (
                    <article key={a.id} className="avaliacao">
                      <div className="avaliacao__topo">
                        <span className="muted" style={{ fontSize: 14 }}>
                          <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{a.aluno?.nome ?? 'Anônimo'}</strong>
                          {' '}· {a.disciplina.nome} · {formatarData(a.createdAt)}
                        </span>
                        <Nota valor={formatarNota(media, 1)} />
                      </div>
                      <p className="avaliacao__comentario">{a.comentario}</p>
                    </article>
                  )
                })
            )}
          </section>
        </>
      )}
    </main>
  )
}

export function MeuPainel() {
  return <ComMeuProfessor>{(professor) => <Painel professor={professor} />}</ComMeuProfessor>
}
