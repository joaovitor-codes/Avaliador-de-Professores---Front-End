import type { ReactNode } from 'react'
import { Logo } from '../ui'

export function AuthSimples({ children }: { children: ReactNode }) {
  return (
    <div className="auth-simple">
      <header className="auth-simple__header">
        <Logo para="/" altura={64} />
      </header>
      <main className="auth-simple__main">{children}</main>
    </div>
  )
}
