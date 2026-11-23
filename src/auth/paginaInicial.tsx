import type { Usuario } from '../api/types'

type ComPerfil = Pick<Usuario, 'tipoUsuario'> | null | undefined

export function paginaInicial(usuario: ComPerfil): string {
  switch (usuario?.tipoUsuario) {
    case 'PROFESSOR':
      return '/meu-perfil'
    case 'ADMINISTRADOR':
      return '/admin'
    default:
      return '/professores'
  }
}