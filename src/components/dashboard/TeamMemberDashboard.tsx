import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../../context/TeamContext';
import { useBugs } from '../../context/BugContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './StatsCard';
import ActivityFeed from './ActivityFeed';
import Breadcrumb from '../common/Breadcrumb';
import Loading from '../common/Loading';
import { activityService, type ActivityItem } from '../../services/activityService';
import { getAllUsers } from '../../services/userService';
import type { AppUser } from '../../types/auth';
import { 
  CheckCircle, 
  AlertTriangle,
  Folder,
  Bug,
  Plus,
  Layout
} from 'lucide-react';
import { Button } from '../common/buttons';

const TeamMemberDashboard = () => {
  const { user } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { bugs } = useBugs();
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);

  // Fetch recent activities for this user
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user || !user.id) return;
      
      try {
        setActivitiesLoading(true);
        const recentActivities = await activityService.getRecentActivities(user.id, 8);
        setActivities(recentActivities);
      } catch (error) {
        // Silently handle Firebase index errors - activities will be empty until index is ready
        const firebaseError = error as { code?: string; message?: string };
        if (firebaseError.code === 'failed-precondition' || firebaseError.message?.includes('index')) {
          // Index not ready yet, silently fail
          setActivities([]);
        } else {
          console.error('Error fetching activities:', error);
          setActivities([]);
        }
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  // Fetch all users to get manager names
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Filter bugs assigned to this team member
  const assignedBugs = bugs.filter(bug => bug.assignee === user?.id);
  
  // Get unique project IDs from assigned bugs
  const assignedProjectIds = [...new Set(assignedBugs.map(bug => bug.projectId).filter(Boolean))];
  
  // Filter projects that have bugs assigned to this team member
  const assignedProjects = projects.filter(project => 
    assignedProjectIds.includes(project.id)
  );

  // Helper function to get manager name for a project
  const getProjectManagerName = (project: typeof assignedProjects[0]) => {
    if (!project.teamId) return 'No manager';
    
    const team = teams.find(t => t.id === project.teamId);
    if (!team || !team.managerId) return 'No manager';
    
    const manager = allUsers.find(u => u.id === team.managerId);
    return manager?.name || 'Unknown';
  };

  // Helper function to get team members count for a project
  const getProjectTeamMembersCount = (project: typeof assignedProjects[0]) => {
    if (!project.teamId) return 0;
    
    const team = teams.find(t => t.id === project.teamId);
    if (!team || !team.members) return 0;
    
    return team.members.length;
  };

  // Calculate personal stats
  const personalStats = {
    assignedBugs: assignedBugs.length,
    resolvedBugs: assignedBugs.filter(bug => bug.status === 'completed').length,
    openBugs: assignedBugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress').length,
    assignedProjects: assignedProjects.length,
    completionRate: assignedBugs.length > 0 ? 
      Math.round((assignedBugs.filter(bug => bug.status === 'completed').length / assignedBugs.length) * 100) : 0,
  };

  // Handle viewing bug in Kanban
  const handleViewInKanban = (bug: typeof assignedBugs[0]) => {
    if (bug.projectId) {
      // Navigate to project's kanban view with bug ID in query params
      const projectId = encodeURIComponent(bug.projectId);
      navigate(`/projects/${projectId}?bugId=${encodeURIComponent(bug.id)}`);
    }
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
      title: 'My Projects',
      value: personalStats.assignedProjects,
      icon: Folder,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Projects you\'re working on'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* My Assigned Bugs */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">My Assigned Bugs</h3>
          <Button variant="primary" size="sm" icon={Plus}>
            Report Bug
          </Button>
        </div>

        {assignedBugs.length === 0 ? (
          <div className="text-center py-8">
            <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No bugs assigned</h4>
            <p className="text-gray-600 mb-4">You're all caught up! No bugs assigned to you.</p>
            <Button variant="primary" size="sm" icon={Plus}>
              Report Bug
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedBugs.slice(0, 8).map((bug) => (
              <div key={bug.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center justify-between gap-4">
                  {/* Left Section: Bug ID and Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-mono font-semibold text-sm text-gray-600 flex-shrink-0 pr-3 border-r border-gray-300">
                      {bug.id}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-base truncate">
                      {bug.title}
                    </h4>
                  </div>

                  {/* Right Section: Bug Type (Priority) and Kanban Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      bug.priority === 'critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                      bug.priority === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      bug.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {bug.priority}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={Layout}
                      onClick={() => handleViewInKanban(bug)}
                    >
                      View in Kanban
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {assignedBugs.length > 8 && (
              <div className="text-center pt-3">
                <Button variant="ghost" size="sm">
                  View all {assignedBugs.length} bugs
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <ActivityFeed 
          activities={activities}
          loading={activitiesLoading}
          showProject={true}
          maxItems={6}
        />

        {/* My Assigned Projects */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">My Assigned Projects</h3>
            <Button variant="ghost" size="sm" icon={Folder}>
              View All
            </Button>
          </div>

          {assignedProjects.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h4>
              <p className="text-gray-600">You haven't been assigned to any projects yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedProjects.slice(0, 6).map((project) => (
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
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {project.shortDescription || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Manager: {getProjectManagerName(project)}</span>
                    <span>{getProjectTeamMembersCount(project)} members</span>
                  </div>
                </div>
              ))}
              {assignedProjects.length > 6 && (
                <div className="text-center pt-3">
                  <Button variant="ghost" size="sm">
                    View all {assignedProjects.length} projects
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;