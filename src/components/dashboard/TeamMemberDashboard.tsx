
import { useTeams } from '../../context/TeamContext';
import { useBugs } from '../../context/BugContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './StatsCard';
import Breadcrumb from '../common/Breadcrumb';
import Loading from '../common/Loading';
import { 
  User, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Folder,
  Bug,
  BarChart3,
  Plus,

  Target
} from 'lucide-react';

const TeamMemberDashboard = () => {
  const { user } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { bugs } = useBugs();
  const { projects } = useProjects();


  // Filter bugs and projects assigned to this team member
  const assignedBugs = bugs.filter(bug => bug.assignee === user?.id);
  const assignedProjects = projects.filter(project => 
    project.members?.some(member => member.userId === user?.id) || project.owner === user?.id
  );

  // Calculate personal stats
  const personalStats = {
    assignedBugs: assignedBugs.length,
    resolvedBugs: assignedBugs.filter(bug => bug.status === 'resolved').length,
    openBugs: assignedBugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress').length,
    criticalBugs: assignedBugs.filter(bug => bug.priority === 'critical').length,
    assignedProjects: assignedProjects.length,
    teamMembers: teams.length > 0 ? teams[0].members.length : 0,
    avgResolutionTime: 1.5, // TODO: Calculate actual average
    completionRate: assignedBugs.length > 0 ? 
      Math.round((assignedBugs.filter(bug => bug.status === 'resolved').length / assignedBugs.length) * 100) : 0,
  };

  const stats = [
    {
      title: 'My Bugs',
      value: personalStats.assignedBugs,
      icon: Bug,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Bugs assigned to you'
    },
    {
      title: 'Resolved',
      value: personalStats.resolvedBugs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${personalStats.completionRate}% completion rate`
    },
    {
      title: 'Open Bugs',
      value: personalStats.openBugs,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Requires your attention'
    },
    {
      title: 'Critical Bugs',
      value: personalStats.criticalBugs,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'High priority issues'
    },
    {
      title: 'My Projects',
      value: personalStats.assignedProjects,
      icon: Folder,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Projects you\'re working on'
    },
    {
      title: 'Team Size',
      value: personalStats.teamMembers,
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Members in your team'
    },
    {
      title: 'Avg Resolution',
      value: `${personalStats.avgResolutionTime}d`,
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      description: 'Your average resolution time'
    },
    {
      title: 'Performance',
      value: `${personalStats.completionRate}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Your completion rate'
    }
  ];

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loading size="lg" text="Loading team member dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Team Member Dashboard' }
        ]}
        showBackButton={false}
      />

      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          My Dashboard
        </h2>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Here's an overview of your assigned work and performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* My Assigned Work */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* My Bugs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">My Assigned Bugs</h3>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Report Bug
            </button>
          </div>

          {assignedBugs.length === 0 ? (
            <div className="text-center py-8">
              <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No bugs assigned</h4>
              <p className="text-gray-600 mb-4">You're all caught up! No bugs assigned to you.</p>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Report Bug
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedBugs.slice(0, 5).map((bug) => (
                <div key={bug.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{bug.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      bug.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      bug.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      bug.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {bug.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>#{bug.id}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      bug.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      bug.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bug.status}
                    </span>
                  </div>
                </div>
              ))}
              {assignedBugs.length > 5 && (
                <div className="text-center pt-3">
                  <button className="text-sm text-primary hover:text-primary/80">
                    View all {assignedBugs.length} bugs
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* My Projects */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">My Projects</h3>
          </div>

          {assignedProjects.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h4>
              <p className="text-gray-600">You haven't been assigned to any projects yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'complete' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Owner: {project.ownerName}</span>
                    <span>{project.members?.length || 0} members</span>
                  </div>
                </div>
              ))}
              {assignedProjects.length > 5 && (
                <div className="text-center pt-3">
                  <button className="text-sm text-primary hover:text-primary/80">
                    View all {assignedProjects.length} projects
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Personal Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">My Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Bug resolved</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New bug assigned</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Project updated</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">Report New Bug</span>
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">View My Bugs</span>
              <Bug className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">View My Projects</span>
              <Folder className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">My Performance</span>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;
