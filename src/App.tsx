import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';

import { Auth } from './pages/Auth';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { GlobalSuccess } from './pages/GlobalSuccess';
import { MoveUp } from './pages/MoveUp';
import { EnhancedLessons } from './pages/EnhancedLessons';
import { CustomLessonPlanCreate } from './pages/CustomLessonPlanCreate';
import { MyLessonPlans } from './pages/MyLessonPlans';
import { LessonPlanEdit } from './pages/LessonPlanEdit';
import { LessonPlanPreviewPage } from './pages/LessonPlanPreviewPage';
import { CurriculumSources } from './pages/CurriculumSources';
import { TeachingResources } from './pages/TeachingResources';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TeacherDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create/global-success"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GlobalSuccess />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create/move-up"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MoveUp />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create/enhanced"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EnhancedLessons />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create/custom"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CustomLessonPlanCreate />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-plans"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyLessonPlans />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LessonPlanEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/preview/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LessonPlanPreviewPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/curriculum-sources"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CurriculumSources />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teaching-resources"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TeachingResources />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
