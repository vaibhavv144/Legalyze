import { Navigate, Route, Routes } from "react-router-dom";
import { Skeleton } from "./components/ui/skeleton";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { LoginPage, RegisterPage } from "./pages/auth-pages";
import { LandingPage } from "./pages/landing-page";
import {
  AnalysisPage,
  ChatPage,
  DashboardPage,
  DocumentsPage,
  ProfilePage,
  SettingsPage,
  UploadPage,
  WorkspaceLayout,
} from "./pages/workspace-pages";

function ProtectedRoutes() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <WorkspaceLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </WorkspaceLayout>
  );
}

function AppRoutes() {
  const { user, setUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-3 p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<LandingPage loggedIn={Boolean(user)} />} />
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route path="/register" element={<RegisterPage onLogin={setUser} />} />
      <Route path="/app/*" element={<ProtectedRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
