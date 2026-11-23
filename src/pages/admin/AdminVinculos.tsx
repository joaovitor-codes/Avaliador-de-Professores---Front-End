import { Link, useParams } from 'react-router'
import { ApiError, mensagemDeErro } from '../../api/client'
import { professoresApi } from '../../api/professores'
import { IconVoltar } from '../../components/icons'
import { Alerta, Carregando } from '../../components/ui'
import { VinculosEditor } from '../../components/professor/VinculosEditor'
import { TITULACOES } from '../../utils/format'
import { useCarregar } from '../../utils/useCarregar'

export function AdminVinculos() {
  const { id = '' } = useParams()
  const professor = useCarregar(() => professoresApi.obter(id), [id])

  return (
    <div className="stack" style={{ maxWidth: 960 }}>
      <Link to="/admin/professores" className="link-back">
        <IconVoltar /> Voltar para professores
      </Link>

      {professor.erro ? (
        <Alerta>
          {professor.erro instanceof ApiError && professor.erro.status === 404
            ? 'Professor não encontrado.'
            : mensagemDeErro(professor.erro)}
        </Alerta>
      ) : !professor.dados ? (
        <Carregando />
      ) : (
        <>
          <div>
            <h1 className="page-title">{professor.dados.usuario.nome}</h1>
            <p className="page-subtitle">
              {professor.dados.titulacao ? `${TITULACOES[professor.dados.titulacao]} · ` : ''}Instituições e
              disciplinas
            </p>
          </div>
          <VinculosEditor professorId={id} />
        </>
      )}
    </div>
  )
}
