import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppLayout } from "./pages/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { ForgotPasswordPage } from "./pages/auth/ResetPassword";
import { InvitePage } from "./pages/auth/RequestResetLink";
import { UsersManager } from "./pages/admin/UsersManager";
import { ManufacturersPage } from "./pages/manufacturers/ManufacturerPage";
import { QuestionnaireForm } from "./pages/manufacturers/Questionnaire";
import { ClusterMapPage } from "./pages/manufacturers/Clusters";

function App() {
  return (
    <>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manufacturer"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
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
                      <DashboardPage />
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
                    <AppLayout>
                      <QuestionnaireForm />
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
              <Route path="/invite/:token" element={<InvitePage/>} />
              <Route path="/reset-password/:token" element={<InvitePage/>} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
