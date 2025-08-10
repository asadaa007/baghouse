
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/layout/Navigation';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import TeamMemberDashboard from '../components/dashboard/TeamMemberDashboard';
import Loading from '../components/common/Loading';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loading size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">Please log in to access the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'team_member':
        return <TeamMemberDashboard />;
      default:
        return <TeamMemberDashboard />; // Default fallback
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {renderDashboard()}
    </div>
  );
};

export default Dashboard; 