import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { AdminLayout } from './components/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Administrador */}
          <Route
            path="/admin"
            element={
              <RequireAuth perfis={['ADMINISTRADOR']}>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="instituicoes" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}