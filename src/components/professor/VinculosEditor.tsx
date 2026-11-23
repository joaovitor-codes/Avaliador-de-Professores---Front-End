import { useState, type SubmitEvent } from 'react'
import { todasDisciplinas, todasInstituicoes } from '../../api/catalogo'
import { ApiError, mensagemDeErro } from '../../api/client'
import { professoresApi } from '../../api/professores'
import type { Disciplina, Uuid, VinculoInstituicao } from '../../api/types'
import { opcional } from '../../utils/format'
import { useCarregar } from '../../utils/useCarregar'
import { IconFechar, IconMais } from '../icons'
import { Alerta, Campo, Carregando, Modal } from '../ui'

interface Props {
  professorId: Uuid
  proprio?: boolean
}

function mensagemVinculo(err: unknown) {
  if (err instanceof ApiError && err.status === 409) return 'Esse vínculo já existe.'
  if (err instanceof ApiError && err.status === 403) return 'Você não tem permissão para alterar este professor.'
  return mensagemDeErro(err)
}

function ModalInstituicao({
  professorId,
  vinculo,
  jaVinculadas,
  onFechar,
  onSalvo,
}: {
  professorId: Uuid
  vinculo?: VinculoInstituicao
  jaVinculadas: Set<Uuid>
  onFechar: () => void
  onSalvo: () => void
}) {
  const instituicoes = useCarregar(() => (vinculo ? Promise.resolve([]) : todasInstituicoes()), [vinculo])
  const [instituicaoId, setInstituicaoId] = useState(vinculo?.instituicaoId ?? '')
  const [departamento, setDepartamento] = useState(vinculo?.departamento ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const disponiveis = instituicoes.dados?.filter((i) => !jaVinculadas.has(i.id)) ?? []

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      if (vinculo) await professoresApi.atualizarVinculoInstituicao(professorId, vinculo.instituicaoId, departamento.trim())
      else
        await professoresApi.vincularInstituicao(professorId, {
          instituicaoId,
          departamento: opcional(departamento),
        })
      onSalvo()
    } catch (err) {
      setErro(mensagemVinculo(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={vinculo ? 'Editar vínculo' : 'Adicionar instituição'} onFechar={onFechar}>
      <form className="form" onSubmit={onSubmit}>
        {vinculo ? (
          <p>
            <strong style={{ fontWeight: 600 }}>{vinculo.instituicao.sigla ?? vinculo.instituicao.nome}</strong>
            {vinculo.instituicao.sigla && <> · {vinculo.instituicao.nome}</>}
          </p>
        ) : (
          <Campo label="Instituição" obrigatorio>
            {(id) =>
              instituicoes.carregando ? (
                <Carregando />
              ) : (
                <select
                  id={id}
                  className="select"
                  value={instituicaoId}
                  onChange={(e) => setInstituicaoId(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {disponiveis.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.sigla ? `${i.sigla} — ${i.nome}` : i.nome}
                    </option>
                  ))}
                </select>
              )
            }
          </Campo>
        )}
        <Campo label="Departamento">
          {(id) => (
            <input
              id={id}
              className="input"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              placeholder="Ex.: Centro de Informática"
            />
          )}
        </Campo>
        {erro && <Alerta>{erro}</Alerta>}
        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function VinculosEditor({ professorId, proprio = false }: Props) {
  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao((v) => v + 1)
  const [modal, setModal] = useState<{ vinculo?: VinculoInstituicao } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [disciplinaEscolhida, setDisciplinaEscolhida] = useState('')
  const [adicionando, setAdicionando] = useState(false)

  const vinculos = useCarregar(
    () => Promise.all([professoresApi.instituicoes(professorId), professoresApi.disciplinas(professorId)]),
    [professorId, versao],
  )
  const [instituicoes, disciplinas] = vinculos.dados ?? [[], []]

  // só dá pra vincular disciplina das instituições onde o professor atua
  const idsInstituicoes = instituicoes.map((v) => v.instituicaoId).sort().join(',')
  const opcoes = useCarregar(async () => {
    if (!idsInstituicoes) return [] as (Disciplina & { sigla: string })[]
    const listas = await Promise.all(
      instituicoes.map(async (v) =>
        (await todasDisciplinas(v.instituicaoId)).map((d) => ({ ...d, sigla: v.instituicao.sigla ?? v.instituicao.nome })),
      ),
    )
    return listas.flat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsInstituicoes])

  const jaTem = new Set(disciplinas.map((d) => d.disciplinaId))
  const disponiveis = (opcoes.dados ?? []).filter((d) => !jaTem.has(d.id))

  async function removerInstituicao(v: VinculoInstituicao) {
    const nome = v.instituicao.sigla ?? v.instituicao.nome
    if (!window.confirm(`Remover ${nome}? As disciplinas nessa instituição também serão removidas.`)) return
    setErro(null)
    try {
      await professoresApi.desvincularInstituicao(professorId, v.instituicaoId)
      recarregar()
    } catch (err) {
      setErro(mensagemVinculo(err))
    }
  }

  async function adicionarDisciplina(e: SubmitEvent) {
    e.preventDefault()
    if (!disciplinaEscolhida) return
    setErro(null)
    setAdicionando(true)
    try {
      await professoresApi.vincularDisciplina(professorId, disciplinaEscolhida)
      setDisciplinaEscolhida('')
      recarregar()
    } catch (err) {
      setErro(
        err instanceof ApiError && err.status === 400
          ? mensagemDeErro(err, 'O professor precisa atuar na instituição da disciplina.')
          : mensagemVinculo(err),
      )
    } finally {
      setAdicionando(false)
    }
  }

  async function removerDisciplina(disciplinaId: Uuid) {
    setErro(null)
    try {
      await professoresApi.desvincularDisciplina(professorId, disciplinaId)
      recarregar()
    } catch (err) {
      setErro(mensagemVinculo(err))
    }
  }

  if (vinculos.erro) return <Alerta>{mensagemDeErro(vinculos.erro, 'Não foi possível carregar os vínculos.')}</Alerta>
  if (!vinculos.dados) return <Carregando />

  return (
    <>
      {erro && <Alerta>{erro}</Alerta>}

      <section className="card">
        <div className="card__head" style={{ marginBottom: 8 }}>
          <h2 className="card__title">{proprio ? 'Instituições onde atuo' : 'Instituições onde atua'}</h2>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setModal({})}>
            <IconMais /> Adicionar instituição
          </button>
        </div>
        <p className="muted small" style={{ marginBottom: 16 }}>
          Remover uma instituição também remove {proprio ? 'suas' : 'as'} disciplinas nela.
        </p>
        {instituicoes.length === 0 ? (
          <p className="muted">Nenhuma instituição ainda.</p>
        ) : (
          <div className="table-wrap">
            <table className="table table--plain">
              <thead>
                <tr>
                  <th>Instituição</th>
                  <th>Departamento</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {instituicoes.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong style={{ fontWeight: 600 }}>{v.instituicao.sigla ?? v.instituicao.nome}</strong>
                      {v.instituicao.sigla && <> · {v.instituicao.nome}</>}
                    </td>
                    <td className={v.departamento ? undefined : 'muted'}>{v.departamento || '—'}</td>
                    <td className="acoes">
                      <button type="button" className="btn--text" onClick={() => setModal({ vinculo: v })}>
                        Editar
                      </button>
                      <button type="button" className="btn--text" onClick={() => removerInstituicao(v)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 className="card__title">{proprio ? 'Disciplinas que leciono' : 'Disciplinas que leciona'}</h2>
        <form className="row" onSubmit={adicionarDisciplina}>
          <Campo label="Adicionar disciplina" className="grow">
            {(id) => (
              <select
                id={id}
                className="select"
                value={disciplinaEscolhida}
                onChange={(e) => setDisciplinaEscolhida(e.target.value)}
                disabled={instituicoes.length === 0 || opcoes.carregando}
              >
                <option value="">{opcoes.carregando ? 'Carregando…' : 'Selecione'}</option>
                {disponiveis.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                    {d.codigo ? ` — ${d.codigo}` : ''} ({d.sigla})
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <button type="submit" className="btn btn--primary" disabled={!disciplinaEscolhida || adicionando}>
            Adicionar
          </button>
        </form>
        <p className="muted small">
          Só aparecem disciplinas das instituições onde {proprio ? 'você atua' : 'o professor atua'}.
        </p>
        {disciplinas.length === 0 ? (
          <p className="muted">Nenhuma disciplina ainda.</p>
        ) : (
          <div className="tags" style={{ gap: 10 }}>
            {disciplinas.map(({ disciplina: d }) => (
              <span key={d.id} className="tag tag--removable">
                {d.nome}
                {d.codigo && <span className="muted"> · {d.codigo}</span>}
                <button
                  type="button"
                  className="btn--icon"
                  aria-label={`Remover ${d.nome}`}
                  onClick={() => removerDisciplina(d.id)}
                >
                  <IconFechar size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <ModalInstituicao
          professorId={professorId}
          vinculo={modal.vinculo}
          jaVinculadas={new Set(instituicoes.map((v) => v.instituicaoId))}
          onFechar={() => setModal(null)}
          onSalvo={() => {
            setModal(null)
            recarregar()
          }}
        />
      )}
    </>
  )
}
