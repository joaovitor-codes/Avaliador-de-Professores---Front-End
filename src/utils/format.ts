import type { TipoUsuario } from '../api/types'

export const TIPOS_USUARIO: Record<TipoUsuario, string> = {
  COMUM: 'Usuário',
  ALUNO: 'Aluno',
  PROFESSOR: 'Professor',
  ADMINISTRADOR: 'Administrador',
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}


export function plural(n: number, singular: string, pluralForm: string) {
  return `${n.toLocaleString('pt-BR')} ${n === 1 ? singular : pluralForm}`
}

export function opcional(valor: string): string | undefined {
  const v = valor.trim()
  return v === '' ? undefined : v
}