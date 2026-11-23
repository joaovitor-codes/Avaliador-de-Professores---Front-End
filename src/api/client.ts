// Cliente HTTP da API.
// A sessão vive nos cookies access_token / refresh_token que o back-end grava no login,
// então toda chamada vai com credentials: 'include'. Ao receber 401, tenta um
// POST /auth/refresh uma única vez e repete a chamada.

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/** Rotas em que um 401 é resposta final (não faz sentido tentar refresh). */
const SEM_REFRESH = ['/auth/sign-in', '/auth/sign-up', '/auth/refresh', '/auth/logout']

export class ApiError extends Error {
  readonly status: number
  /** Mensagens de validação do NestJS (quando `message` vem como array). */
  readonly details: string[]

  constructor(status: number, message: string, details: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>

interface RequestOptions {
  body?: unknown
  query?: QueryParams
}

let sessaoExpiradaListener: (() => void) | null = null

/** Chamado quando o refresh falha: a sessão acabou. */
export function onSessaoExpirada(listener: (() => void) | null) {
  sessaoExpiradaListener = listener
}

let refreshEmAndamento: Promise<boolean> | null = null

function tentarRefresh(): Promise<boolean> {
  // Várias requisições podem receber 401 ao mesmo tempo; todas esperam o mesmo refresh.
  refreshEmAndamento ??= fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshEmAndamento = null
    })
  return refreshEmAndamento
}

function montarUrl(path: string, query?: QueryParams) {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== null && valor !== '') params.set(chave, String(valor))
  }
  const qs = params.toString()
  return `${BASE_URL}${path}${qs ? `?${qs}` : ''}`
}

async function lerErro(res: Response): Promise<ApiError> {
  let corpo: unknown = null
  try {
    corpo = await res.json()
  } catch {
    // corpo vazio ou não-JSON
  }
  // Formato padrão do NestJS: { statusCode, message: string | string[], error }
  const msg = (corpo as { message?: unknown } | null)?.message
  if (Array.isArray(msg)) {
    const details = msg.map(String)
    return new ApiError(res.status, details[0] ?? res.statusText, details)
  }
  if (typeof msg === 'string') return new ApiError(res.status, msg)
  return new ApiError(res.status, res.statusText || 'Erro inesperado')
}

async function request<T>(
  method: string,
  path: string,
  { body, query }: RequestOptions = {},
  podeRefresh = true,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(montarUrl(path, query), {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor.')
  }

  if (res.status === 401 && podeRefresh && !SEM_REFRESH.includes(path)) {
    if (await tentarRefresh()) return request<T>(method, path, { body, query }, false)
    sessaoExpiradaListener?.()
  }

  if (!res.ok) throw await lerErro(res)
  if (res.status === 204) return undefined as T

  const texto = await res.text()
  return (texto ? JSON.parse(texto) : undefined) as T
}

export const http = {
  get: <T>(path: string, query?: QueryParams) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body: body ?? {} }),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, { body }),
  delete: (path: string) => request<void>('DELETE', path),
}

/** Texto amigável para exibir um erro qualquer na tela. */
export function mensagemDeErro(erro: unknown, padrao = 'Algo deu errado. Tente novamente.'): string {
  if (erro instanceof ApiError) return erro.message || padrao
  return padrao
}
