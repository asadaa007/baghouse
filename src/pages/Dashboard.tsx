import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBugs } from '../context/BugContext';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import BugForm from '../components/dashboard/BugForm';
import Loading from '../components/common/Loading';
import { 
  Bug, 
  Plus, 
  BarChart3, 
  Users, 
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { bugs, loading } = useBugs();
  const [isBugFormOpen, setIsBugFormOpen] = useState(false);

  const stats = [
    {
      title: 'Total Bugs',
      value: bugs.length,
      icon: Bug,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Open Bugs',
      value: bugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress').length,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Resolved',
      value: bugs.filter(bug => bug.status === 'resolved').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Closed',
      value: bugs.filter(bug => bug.status === 'closed').length,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  const recentBugs = bugs.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loading size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Welcome back, {user?.name || user?.email}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bugs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary">Recent Bugs</h3>
                <button 
                  onClick={() => setIsBugFormOpen(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Bug
                </button>
              </div>
              
              {bugs.length === 0 ? (
                <div className="text-center py-8">
                  <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No bugs yet</h4>
                  <p className="text-gray-600 mb-4">Get started by creating your first bug report.</p>
                  <button 
                    onClick={() => setIsBugFormOpen(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Bug
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBugs.map((bug) => (
                    <div key={bug.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          bug.priority === 'critical' ? 'bg-red-500' :
                          bug.priority === 'high' ? 'bg-orange-500' :
                          bug.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <h4 className="font-medium text-secondary">{bug.title}</h4>
                          <p className="text-sm text-gray-600">#{bug.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          bug.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          bug.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          bug.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bug.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(bug.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsBugFormOpen(true)}
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                >
                  <Plus className="w-5 h-5 mr-3 text-primary" />
                  <span>Report New Bug</span>
                </button>
                <Link to="/projects" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Users className="w-5 h-5 mr-3 text-primary" />
                  <span>Manage Projects</span>
                </Link>
                <Link to="/bugs" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bug className="w-5 h-5 mr-3 text-primary" />
                  <span>View All Bugs</span>
                </Link>
                <Link to="/analytics" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <BarChart3 className="w-5 h-5 mr-3 text-primary" />
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New bug reported in Project Alpha</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Bug #123 resolved</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New team member added</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bug Form Modal */}
      <BugForm
        isOpen={isBugFormOpen}
        onClose={() => setIsBugFormOpen(false)}
      />
    </div>
  );
};

export default Dashboard; 