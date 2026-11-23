import type { ReactNode } from 'react'
import { mensagemDeErro } from '../../api/client'
import { buscarProfessorDoUsuario } from '../../api/professores'
import type { Professor } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { useCarregar } from '../../utils/useCarregar'
import { Alerta, Carregando } from '../ui'

// carrega o professor do usuário logado antes de mostrar a página
export function ComMeuProfessor({ children }: { children: (professor: Professor) => ReactNode }) {
  const { usuario } = useAuth()
  const professor = useCarregar(
    () => (usuario ? buscarProfessorDoUsuario(usuario.id) : Promise.resolve(null)),
    [usuario?.id],
  )

  if (professor.erro)
    return (
      <main className="container">
        <Alerta>{mensagemDeErro(professor.erro, 'Não foi possível carregar seu perfil.')}</Alerta>
      </main>
    )
  if (professor.carregando) return <Carregando />
  if (!professor.dados)
    return (
      <main className="container">
        <Alerta>Não encontramos um perfil de professor ligado à sua conta. Fale com um administrador.</Alerta>
      </main>
    )
  return <>{children(professor.dados)}</>
}
