import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { StoreProvider } from "./store"
import AppLayout from "./components/layout/AppLayout"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ProjectsPage from "./pages/projects/ProjectsPage"
import ProjectDetail from "./pages/projects/ProjectDetail"
import DashboardPage from "./pages/dashboard/DashboardPage"
import CalendarPage from "./pages/calendar/CalendarPage"
import ProfilePage from "./pages/profile/ProfilePage"
import SearchPage from "./pages/SearchPage"

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<ProfilePage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
