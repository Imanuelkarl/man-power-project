import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppLayout } from "./pages/AppLayout";
import { AdminPage } from "./pages/admin/AdminPage";
import { ForgotPasswordPage } from "./pages/auth/ResetPassword";
import { InvitePage } from "./pages/auth/UpdatePassword";
import { UsersManager } from "./pages/admin/UsersManager";
import { ManufacturersPage } from "./pages/manufacturers/ManufacturerPage";

import { ClusterMapPage } from "./pages/manufacturers/Clusters";
import { Submissions } from "./pages/manufacturers/Submissions";
import NewQuestionnairePage from "./pages/QuestionnairePage";
import CompanyProfile from "./pages/manufacturers/CompanyProfile";
import { ClusterHubPage } from "./pages/ClusterHubPage";
import { Toaster } from "sonner";
import DashBoardSelector from "./pages/DashBoardSelector";

function App() {
  return (
    <>
      <AuthProvider>
        <ThemeProvider>
          <div>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashBoardSelector/>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manufacturer"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashBoardSelector/>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashBoardSelector />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clusters"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ClusterMapPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/power-data"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashBoardSelector/>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manufacturers"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ManufacturersPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/questionnaire"
                  element={
                    <ProtectedRoute>
                      <div>
                        <Toaster />
                        <NewQuestionnairePage />
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/questionnaire/:id"
                  element={
                    <ProtectedRoute>
                      <div>
                        <Toaster />
                        <NewQuestionnairePage />
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/submissions"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Submissions />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cluster-hub"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ClusterHubPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cluster-map"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ClusterMapPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <CompanyProfile />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <UsersManager />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AdminPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <div>
                      <Toaster />
                      <LoginPage />
                    </div>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <div>
                      <Toaster />
                      <ForgotPasswordPage />
                    </div>
                  }
                />
                <Route
                  path="/invite/:token"
                  element={
                    <div>
                      <Toaster />
                      <InvitePage />
                    </div>
                  }
                />
                <Route
                  path="/reset-password/:token"
                  element={
                    <div>
                      <Toaster />
                      <InvitePage />
                    </div>
                  }
                />
              </Routes>
            </BrowserRouter>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
