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

export function rotuloPaginaInicial(usuario: ComPerfil): string {
  switch (usuario?.tipoUsuario) {
    case 'PROFESSOR':
      return 'Ir para meu painel'
    case 'ADMINISTRADOR':
      return 'Ir para administração'
    default:
      return 'Ir para professores'
  }
}
