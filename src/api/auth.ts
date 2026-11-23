import { http } from './client'
import type { MessageResponse, Tokens, Usuario } from './types'

export const authApi = {
  signIn: (body: { email: string; password: string }) => http.post<Tokens>('/auth/sign-in', body),
  logout: () => http.post<MessageResponse>('/auth/logout'),
  me: () => http.get<Usuario>('/auth/me'),
}