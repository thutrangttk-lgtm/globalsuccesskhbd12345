import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

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
        <div className="min-h-screen bg-slate-950 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/auth" element={<Auth />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create/global-success"
                element={
                  <ProtectedRoute>
                    <GlobalSuccess />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create/move-up"
                element={
                  <ProtectedRoute>
                    <MoveUp />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create/enhanced"
                element={
                  <ProtectedRoute>
                    <EnhancedLessons />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create/custom"
                element={
                  <ProtectedRoute>
                    <CustomLessonPlanCreate />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-plans"
                element={
                  <ProtectedRoute>
                    <MyLessonPlans />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <LessonPlanEdit />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/preview/:id"
                element={
                  <ProtectedRoute>
                    <LessonPlanPreviewPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/curriculum-sources"
                element={
                  <ProtectedRoute>
                    <CurriculumSources />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teaching-resources"
                element={
                  <ProtectedRoute>
                    <TeachingResources />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
