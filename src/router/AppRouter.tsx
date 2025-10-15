import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetail from '../pages/ProjectDetail';
import ProjectPreview from '../pages/ProjectPreview';
import ProjectAdd from '../pages/ProjectAdd';
import ProjectEdit from '../pages/ProjectEdit';
import Bugs from '../pages/Bugs';
import BugDetail from '../pages/BugDetail';
import Settings from '../pages/Settings';
import UserManagement from '../pages/UserManagement';
import Teams from '../pages/Teams';
import ButtonTest from '../pages/ButtonTest';
import RoleBasedRoute from '../components/common/RoleBasedRoute';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Public Routes */}
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/preview"
        element={
          <ProtectedRoute>
            <ProjectPreview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/p/:slug"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/p/:slug/preview"
        element={
          <ProtectedRoute>
            <ProjectPreview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/add"
        element={
          <RoleBasedRoute allowedRoles={['super_admin', 'manager']}>
            <ProjectAdd />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/projects/:projectId/edit"
        element={
          <RoleBasedRoute allowedRoles={['super_admin', 'manager', 'team_lead']}>
            <ProjectEdit />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/p/:slug/edit"
        element={
          <RoleBasedRoute allowedRoles={['super_admin', 'manager', 'team_lead']}>
            <ProjectEdit />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/bugs"
        element={
          <ProtectedRoute>
            <Bugs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bugs/:id"
        element={
          <ProtectedRoute>
            <BugDetail />
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
      <Route
        path="/user-management"
        element={
          <RoleBasedRoute allowedRoles={['super_admin', 'manager']}>
            <UserManagement />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <RoleBasedRoute allowedRoles={['super_admin', 'manager']}>
            <Teams />
          </RoleBasedRoute>
        }
      />

      {/* Library Routes */}
      <Route path="/library" element={<ProtectedRoute><ButtonTest /></ProtectedRoute>} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter; 