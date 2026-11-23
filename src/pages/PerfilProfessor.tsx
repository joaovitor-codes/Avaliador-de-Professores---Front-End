import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError, mensagemDeErro } from '../api/client'
import { avaliacoesApi, professoresApi } from '../api/professores'
import type { AvaliacaoListItem, ProfessorDetalhe } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { AvaliacaoModal } from '../components/professor/AvaliacaoModal'
import { IconPredio, IconVoltar } from '../components/icons'
import { Alerta, Avatar, Carregando, Nota, Paginacao } from '../components/ui'
import { formatarData, formatarNota, plural, TITULACOES } from '../utils/format'
import { useCarregar } from '../utils/useCarregar'

const AVALIACOES_POR_PAGINA = 10

function MediaPorCriterio({ professor }: { professor: ProfessorDetalhe }) {
  const criterios = professor.media.porCriterio
  return (
    <section className="card principal" style={{ padding: '28px 32px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Média por critério</h2>
      <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
        Escala de 1 a 5.
      </p>
      {criterios.length === 0 || professor.media.geral === null ? (
        <p className="muted">Ainda não há avaliações para este professor.</p>
      ) : (
        <div className="criterios">
          {criterios.map((c) => (
            <div key={c.criterioId} className="criterio">
              <span className="criterio__nome">{c.nome}</span>
              <span
                className="bar"
                role="img"
                aria-label={`${c.nome}: ${formatarNota(c.media, 1)} de 5`}
              >
                <span style={{ width: `${((c.media ?? 0) / 5) * 100}%` }} />
              </span>
              <span className="criterio__valor">{formatarNota(c.media, 1)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

interface ListaAvaliacoesProps {
  professorId: string
  versao: number
  onEditar: (a: AvaliacaoListItem) => void
  onMudou: () => void
}

function ListaAvaliacoes({ professorId, versao, onEditar, onMudou }: ListaAvaliacoesProps) {
  const [pagina, setPagina] = useState(1)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const lista = useCarregar(
    () => professoresApi.avaliacoes(professorId, { page: pagina, limit: AVALIACOES_POR_PAGINA }),
    [professorId, pagina, versao],
  )

  async function remover(a: AvaliacaoListItem) {
    if (!window.confirm('Remover sua avaliação? Depois você poderá avaliar de novo.')) return
    setErroAcao(null)
    try {
      await avaliacoesApi.remover(a.id)
      onMudou()
    } catch (err) {
      setErroAcao(
        err instanceof ApiError && err.status === 403
          ? 'O prazo para remover esta avaliação (24 horas) já passou.'
          : mensagemDeErro(err),
      )
    }
  }

  const total = lista.dados?.total ?? 0

  return (
    <section className="card">
      <div className="card__head" style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Avaliações</h2>
        {total > 0 && <span className="muted" style={{ fontSize: 14 }}>{plural(total, 'avaliação', 'avaliações')}</span>}
      </div>
      {erroAcao && <Alerta>{erroAcao}</Alerta>}
      {lista.erro ? (
        <Alerta>{mensagemDeErro(lista.erro, 'Não foi possível carregar as avaliações.')}</Alerta>
      ) : lista.carregando && !lista.dados ? (
        <Carregando />
      ) : total === 0 ? (
        <p className="muted" style={{ paddingTop: 12 }}>
          Nenhuma avaliação ainda.
        </p>
      ) : (
        <>
          {lista.dados?.avaliacoes.map((a) => {
            const media = a.notas.reduce((s, n) => s + n.nota, 0) / (a.notas.length || 1)
            return (
              <article key={a.id} className="avaliacao">
                <div className="avaliacao__topo">
                  <span>
                    <strong style={{ fontWeight: 600 }}>{a.aluno?.nome ?? 'Anônimo'}</strong>
                    <span className="muted" style={{ fontSize: 14 }}>
                      {' '}
                      · {a.disciplina.nome} · {formatarData(a.createdAt)}
                    </span>
                    {a.propria && (
                      <span className="badge" style={{ marginLeft: 8 }}>
                        Sua avaliação
                      </span>
                    )}
                  </span>
                  <Nota valor={formatarNota(media, 1)} />
                </div>
                <div className="tags">
                  {a.notas.map((n) => (
                    <span key={n.criterio.id} className="tag">
                      {n.criterio.nome}: {n.nota}
                    </span>
                  ))}
                </div>
                {a.comentario && <p className="avaliacao__comentario">{a.comentario}</p>}
                {a.recomendaria !== null && (
                  <span className="muted" style={{ fontSize: 14 }}>
                    {a.recomendaria ? 'Recomendaria este professor' : 'Não recomendaria este professor'}
                  </span>
                )}
                {a.propria && (
                  <div>
                    <button type="button" className="btn--text" style={{ paddingLeft: 0 }} onClick={() => onEditar(a)}>
                      Editar
                    </button>
                    <button type="button" className="btn--text" onClick={() => remover(a)}>
                      Remover
                    </button>
                  </div>
                )}
              </article>
            )
          })}
          <Paginacao
            pagina={pagina}
            totalPaginas={Math.ceil(total / AVALIACOES_POR_PAGINA)}
            onChange={setPagina}
          />
        </>
      )}
    </section>
  )
}

export function PerfilProfessor() {
  const { id = '' } = useParams()
  const { usuario } = useAuth()
  const [versao, setVersao] = useState(0)
  const [modal, setModal] = useState<{ avaliacao?: AvaliacaoListItem } | null>(null)

  const dados = useCarregar(
    () =>
      Promise.all([
        professoresApi.obter(id),
        professoresApi.instituicoes(id),
        professoresApi.disciplinas(id),
      ]),
    [id, versao],
  )

  const fecharModal = useCallback(() => setModal(null), [])

  if (dados.erro) {
    const naoExiste = dados.erro instanceof ApiError && dados.erro.status === 404
    return (
      <main className="container stack">
        <Link to="/professores" className="link-back">
          <IconVoltar /> Voltar para professores
        </Link>
        <Alerta>{naoExiste ? 'Professor não encontrado.' : mensagemDeErro(dados.erro)}</Alerta>
      </main>
    )
  }
  if (!dados.dados) return <Carregando />

  const [professor, instituicoes, disciplinas] = dados.dados
  const ehAluno = usuario?.tipoUsuario === 'ALUNO'
  const ehOProprio = usuario?.id === professor.usuarioId
  const siglaPorInstituicao = new Map(instituicoes.map((v) => [v.instituicaoId, v.instituicao.sigla ?? v.instituicao.nome]))

  const criterios = professor.media.porCriterio.map((c) => ({ id: c.criterioId, nome: c.nome }))

  return (
    <main className="container stack" style={{ paddingTop: 28 }}>
      <Link to="/professores" className="link-back">
        <IconVoltar /> Voltar para professores
      </Link>

      <section className="card perfil-head">
        <Avatar nome={professor.usuario.nome} tamanho="lg" />
        <div className="perfil-head__info">
          <div className="row" style={{ alignItems: 'center' }}>
            <h1>{professor.usuario.nome}</h1>
            {professor.titulacao && (
              <span className="badge" style={{ fontSize: 13, padding: '4px 10px' }}>
                {TITULACOES[professor.titulacao]}
              </span>
            )}
          </div>
          {professor.biografia && <p className="perfil-head__bio">{professor.biografia}</p>}
          {professor.instituicoes.length > 0 && (
            <div className="row" style={{ gap: 10, marginTop: 4 }}>
              {professor.instituicoes.map((v) => (
                <span key={v.instituicao.id} className="pill-info">
                  <IconPredio />
                  <span>
                    <strong style={{ fontWeight: 600 }}>{v.instituicao.sigla ?? v.instituicao.nome}</strong>
                    {v.departamento && <> · {v.departamento}</>}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="perfil-head__nota">
          {professor.media.geral !== null ? (
            <div>
              <Nota valor={formatarNota(professor.media.geral)} grande />
              <span className="muted" style={{ fontSize: 14, display: 'block' }}>
                Média geral · {plural(professor.media.totalAvaliacoes, 'avaliação', 'avaliações')}
              </span>
            </div>
          ) : (
            <span className="muted">Sem avaliações</span>
          )}
          {ehAluno && (
            <button type="button" className="btn btn--primary btn--lg" onClick={() => setModal({})}>
              Avaliar professor
            </button>
          )}
          {ehOProprio && (
            <Link to="/meu-perfil" className="btn btn--secondary">
              Ver meu painel
            </Link>
          )}
        </div>
      </section>

      <div className="duas-colunas">
        <div className="principal stack">
          <MediaPorCriterio professor={professor} />
          <ListaAvaliacoes
            professorId={professor.id}
            versao={versao}
            onEditar={(a) => setModal({ avaliacao: a })}
            onMudou={() => setVersao((v) => v + 1)}
          />
        </div>

        <aside className="lateral">
          <section className="card">
            <h2 className="card__title" style={{ marginBottom: 16 }}>
              Disciplinas
            </h2>
            {disciplinas.length === 0 ? (
              <p className="muted">Nenhuma disciplina cadastrada.</p>
            ) : (
              <ul className="lista-simples">
                {disciplinas.map(({ disciplina: d }) => (
                  <li key={d.id}>
                    <span>
                      <span className="lista-simples__titulo">{d.nome}</span>
                      <span className="muted small">
                        {[d.codigo, siglaPorInstituicao.get(d.instituicaoId)].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {d.cargaHoraria !== null && (
                      <span className="muted small" style={{ whiteSpace: 'nowrap' }}>
                        {d.cargaHoraria} h
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="card__title" style={{ marginBottom: 16 }}>
              Instituições
            </h2>
            {instituicoes.length === 0 ? (
              <p className="muted">Nenhuma instituição cadastrada.</p>
            ) : (
              <ul className="lista-simples">
                {instituicoes.map((v) => {
                  const i = v.instituicao
                  const local = [i.cidade, i.estado].filter(Boolean).join(', ')
                  return (
                    <li key={v.id} style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 14 }}>
                      <span className="inst-sigla">
                        {i.logoUrl ? <img src={i.logoUrl} alt="" width={44} height={44} /> : (i.sigla ?? '—')}
                      </span>
                      <span>
                        <span className="lista-simples__titulo">{i.nome}</span>
                        <span className="muted small">{[v.departamento, local].filter(Boolean).join(' · ')}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {modal && (
        <AvaliacaoModal
          professorId={professor.id}
          professorNome={professor.usuario.nome}
          criterios={
            modal.avaliacao ? modal.avaliacao.notas.map((n) => ({ id: n.criterio.id, nome: n.criterio.nome })) : criterios
          }
          disciplinas={professor.disciplinas.map((d) => d.disciplina)}
          avaliacao={modal.avaliacao}
          onFechar={fecharModal}
          onSalvo={() => {
            setModal(null)
            setVersao((v) => v + 1)
          }}
        />
      )}
    </main>
  )
}
