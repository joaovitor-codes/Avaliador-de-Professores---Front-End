import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { AdminLayout } from './components/AdminLayout'
import { AdminCursos } from './pages/admin/AdminCursos'
import { AdminInstituicoes } from './pages/admin/AdminInstituicoes'
import { AdminProfessores } from './pages/admin/AdminProfessores'

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
            <Route path="cursos" element={<AdminCursos />} />
            <Route path="instituicoes" element={<AdminInstituicoes />} />
            <Route path="professores" element={<AdminProfessores />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}