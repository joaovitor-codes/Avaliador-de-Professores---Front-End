import { useState, type SubmitEvent } from 'react'
import { ApiError, mensagemDeErro } from '../../api/client'
import { avaliacoesApi, buscarCriteriosAtivos } from '../../api/professores'
import type { AvaliacaoListItem, Uuid } from '../../api/types'
import { IconEstrela } from '../icons'
import { useCarregar } from '../../utils/useCarregar'
import { Alerta, Campo, Carregando, Modal } from '../ui'

const MAX_COMENTARIO = 2000

interface Props {
  professorId: Uuid
  professorNome: string
  criterios: { id: Uuid; nome: string }[]
  disciplinas: { id: Uuid; nome: string; codigo: string | null }[]
  // se vier, edita em vez de criar
  avaliacao?: AvaliacaoListItem
  onFechar: () => void
  onSalvo: () => void
}

function EntradaNota({ nome, valor, onChange }: { nome: string; valor: number; onChange: (n: number) => void }) {
  return (
    <div className="criterio-input" role="group" aria-label={nome}>
      <span className="criterio__nome">{nome}</span>
      <span className="estrelas">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={n <= valor ? 'on' : undefined}
            aria-label={`${n} de 5`}
            aria-pressed={n === valor}
            onClick={() => onChange(n)}
          >
            <IconEstrela size={26} />
          </button>
        ))}
      </span>
    </div>
  )
}

export function AvaliacaoModal({ professorId, professorNome, criterios: criteriosDoPerfil, disciplinas, avaliacao, onFechar, onSalvo }: Props) {
  const editando = Boolean(avaliacao)
  const carregamento = useCarregar(
    () => (criteriosDoPerfil.length > 0 ? Promise.resolve(criteriosDoPerfil) : buscarCriteriosAtivos()),
    [],
  )
  const criterios = carregamento.dados ?? []
  const [disciplinaId, setDisciplinaId] = useState(avaliacao?.disciplina.id ?? (disciplinas.length === 1 ? disciplinas[0].id : ''))
  const [notas, setNotas] = useState<Record<Uuid, number>>(() =>
    Object.fromEntries(avaliacao?.notas.map((n) => [n.criterio.id, n.nota]) ?? []),
  )
  const [comentario, setComentario] = useState(avaliacao?.comentario ?? '')
  const [recomendaria, setRecomendaria] = useState<'sim' | 'nao' | ''>(
    avaliacao?.recomendaria === true ? 'sim' : avaliacao?.recomendaria === false ? 'nao' : '',
  )
  const [anonima, setAnonima] = useState(avaliacao?.anonima ?? false)
  const [erro, setErro] = useState<{ msg: string; detalhes?: string[] } | null>(null)
  const [enviando, setEnviando] = useState(false)

  const faltando = criterios.filter((c) => !notas[c.id])

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setErro(null)
    if (!editando && !disciplinaId) {
      setErro({ msg: 'Escolha a disciplina que você cursou com este professor.' })
      return
    }
    if (faltando.length > 0) {
      setErro({ msg: `Dê uma nota para: ${faltando.map((c) => c.nome).join(', ')}.` })
      return
    }

    const corpo = {
      notas: criterios.map((c) => ({ criterioId: c.id, nota: notas[c.id] })),
      comentario: comentario.trim() || undefined,
      recomendaria: recomendaria === '' ? undefined : recomendaria === 'sim',
      anonima,
    }

    setEnviando(true)
    try {
      if (avaliacao) await avaliacoesApi.atualizar(avaliacao.id, corpo)
      else await avaliacoesApi.criar({ ...corpo, professorId, disciplinaId })
      onSalvo()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409)
        setErro({ msg: 'Você já avaliou este professor nessa disciplina.' })
      else if (err instanceof ApiError && err.status === 403)
        setErro({ msg: 'Essa avaliação não pode mais ser alterada (o prazo de edição é de 24 horas).' })
      else setErro({ msg: mensagemDeErro(err), detalhes: err instanceof ApiError ? err.details : undefined })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={editando ? 'Editar avaliação' : `Avaliar ${professorNome}`} onFechar={onFechar}>
      {carregamento.carregando ? (
        <Carregando />
      ) : criterios.length === 0 ? (
        <>
          <Alerta>
            Os critérios de avaliação ainda não estão disponíveis. Tente novamente mais tarde.
          </Alerta>
          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onFechar}>
              Fechar
            </button>
          </div>
        </>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          {editando ? (
            <p className="muted" style={{ fontSize: 14 }}>
              Disciplina: <strong style={{ color: 'var(--text)' }}>{avaliacao?.disciplina.nome}</strong>
            </p>
          ) : (
            <Campo label="Disciplina" obrigatorio dica="Só aparecem as disciplinas que este professor leciona.">
              {(id, describedBy) => (
                <select
                  id={id}
                  className="select"
                  value={disciplinaId}
                  onChange={(e) => setDisciplinaId(e.target.value)}
                  aria-describedby={describedBy}
                  required
                >
                  <option value="">Selecione</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.codigo ? `${d.nome} — ${d.codigo}` : d.nome}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
          )}

          <fieldset className="plain" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <legend className="field__label" style={{ marginBottom: 6 }}>
              Notas de 1 a 5 <span className="required">*</span>
            </legend>
            {criterios.map((c) => (
              <EntradaNota
                key={c.id}
                nome={c.nome}
                valor={notas[c.id] ?? 0}
                onChange={(n) => setNotas((atual) => ({ ...atual, [c.id]: n }))}
              />
            ))}
          </fieldset>

          <Campo label="Comentário" dica={`${comentario.length} / ${MAX_COMENTARIO}`}>
            {(id, describedBy) => (
              <textarea
                id={id}
                className="textarea"
                rows={4}
                maxLength={MAX_COMENTARIO}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                aria-describedby={describedBy}
              />
            )}
          </Campo>

          <fieldset className="plain">
            <legend className="field__label" style={{ marginBottom: 4 }}>
              Recomendaria este professor?
            </legend>
            <div className="row" style={{ gap: 20 }}>
              {(
                [
                  ['sim', 'Sim'],
                  ['nao', 'Não'],
                  ['', 'Prefiro não dizer'],
                ] as const
              ).map(([valor, rotulo]) => (
                <label key={valor || 'nd'} className="checkbox">
                  <input
                    type="radio"
                    name="recomendaria"
                    checked={recomendaria === valor}
                    onChange={() => setRecomendaria(valor)}
                  />
                  {rotulo}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="checkbox">
            <input type="checkbox" checked={anonima} onChange={(e) => setAnonima(e.target.checked)} />
            Publicar como anônima
          </label>

          {erro && <Alerta detalhes={erro.detalhes}>{erro.msg}</Alerta>}

          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={enviando}>
              {enviando ? 'Enviando…' : editando ? 'Salvar alterações' : 'Enviar avaliação'}
            </button>
          </div>
          {!editando && (
            <p className="muted small">Você pode editar ou remover a avaliação nas primeiras 24 horas.</p>
          )}
        </form>
      )}
    </Modal>
  )
}
