import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/HomePage'
import { UserDetailPage } from './pages/UserDetailPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { UsersListPage } from './pages/UsersListPage'
import { SettingsPage } from './pages/SettingsPage'
import { DocumentMasterPage } from './pages/DocumentMasterPage'
import { JigyoshoPage } from './pages/JigyoshoPage'
import { KasanPage } from './pages/KasanPage'
import { AlertSettingsPage } from './pages/AlertSettingsPage'
import { OperationsCheckPage } from './pages/OperationsCheckPage'
import { EventProvider } from './contexts/EventContext'

function App() {
  return (
    <EventProvider>
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/users/:id/shorui" element={<UserDetailPage />} />
          <Route path="/users/:id/kiroku" element={<UserDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/documents" element={<DocumentMasterPage />} />
          <Route path="/settings/kasan" element={<KasanPage />} />
          <Route path="/settings/alerts" element={<AlertSettingsPage />} />
          <Route path="/settings/operations-check" element={<OperationsCheckPage />} />
          <Route path="/jigyosho" element={<JigyoshoPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
    </EventProvider>
  )
}

export default App
