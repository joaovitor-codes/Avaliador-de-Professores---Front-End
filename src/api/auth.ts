import { http } from './client'
import type { MessageResponse, Tokens, Usuario } from './types'

export const authApi = {
  signUp: (body: { name: string; email: string; password: string }) =>
    http.post<Tokens>('/auth/sign-up', body),
  signIn: (body: { email: string; password: string }) => http.post<Tokens>('/auth/sign-in', body),
  logout: () => http.post<MessageResponse>('/auth/logout'),
  me: () => http.get<Usuario>('/auth/me'),
  resetPassword: (body: { currentPassword: string; newPassword: string }) =>
    http.post<MessageResponse>('/auth/reset-password', body),
  requestPasswordReset: (email: string) =>
    http.post<MessageResponse>('/auth/request-password-reset', { email }),
  confirmPasswordReset: (body: { token: string; newPassword: string }) =>
    http.post<MessageResponse>('/auth/confirm-password-reset', body),
  verifyEmail: (body: { email: string; code: string }) =>
    http.post<MessageResponse>('/auth/verify-email', body),
  // a api limita a 3 reenvios a cada 15 min
  resendEmailVerification: (email: string) =>
    http.post<MessageResponse>('/auth/resend-email-verification', { email }),
}
