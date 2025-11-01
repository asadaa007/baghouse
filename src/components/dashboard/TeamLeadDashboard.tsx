import { useState, useEffect } from 'react';
import { useTeams } from '../../context/TeamContext';
import { useBugs } from '../../context/BugContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './StatsCard';
import ActivityFeed from './ActivityFeed';
import ProjectSummary from './ProjectSummary';
import RecentBugsList from './RecentBugsList';
import QuickActions from './QuickActions';
import Breadcrumb from '../common/Breadcrumb';
import Loading from '../common/Loading';
import { activityService, type ActivityItem } from '../../services/activityService';
import { 
  User, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Folder,
  Bug,
  BarChart3,
  Plus,
  Target,
  Users,
  TrendingUp,
  Shield,
  Gauge,
  Award,
  Calendar,
  Settings
} from 'lucide-react';
import { Button, LinkButton } from '../common/buttons';

const TeamLeadDashboard = () => {
  const { user } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { bugs } = useBugs();
  const { projects } = useProjects();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Fetch recent activities for this user
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      try {
        setActivitiesLoading(true);
        const recentActivities = await activityService.getRecentActivities(user.id, 10);
        setActivities(recentActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]); // Ensure activities is empty on error
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  // Filter bugs and projects for team lead's team
  const teamLeadTeam = teams.find(team => team.teamLeadIds?.includes(user?.id || ''));
  const teamBugs = bugs.filter(bug => teamLeadTeam?.members?.includes(bug.assignee || ''));
  const teamProjects = projects.filter(project => 
    teamLeadTeam?.members?.some(memberId => project.members?.some(member => member.userId === memberId))
  );
  const assignedBugs = bugs.filter(bug => bug.assignee === user?.id);
  const assignedProjects = projects.filter(project => 
    project.members?.some(member => member.userId === user?.id) || project.owner === user?.id
  );

  // Calculate team lead stats
  const teamStats = {
    teamMembers: teamLeadTeam?.members?.length || 0,
    teamBugs: teamBugs.length,
    teamResolvedBugs: teamBugs.filter(bug => bug.status === 'completed').length,
    teamOpenBugs: teamBugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress').length,
    teamCriticalBugs: teamBugs.filter(bug => bug.priority === 'critical').length,
    teamProjects: teamProjects.length,
    myBugs: assignedBugs.length,
    myResolvedBugs: assignedBugs.filter(bug => bug.status === 'completed').length,
    teamPerformance: teamBugs.length > 0 ? 
      Math.round((teamBugs.filter(bug => bug.status === 'completed').length / teamBugs.length) * 100) : 0,
    myPerformance: assignedBugs.length > 0 ? 
      Math.round((assignedBugs.filter(bug => bug.status === 'completed').length / assignedBugs.length) * 100) : 0,
  };

  // Calculate project stats for ProjectSummary component
  const projectStats = teamProjects.reduce((acc, project) => {
    const projectBugs = teamBugs.filter(bug => bug.projectId === project.id);
    acc[project.id] = projectBugs.length;
    return acc;
  }, {} as Record<string, number>);

  // Quick action handlers
  const handleNewBug = () => {
    window.location.href = '/bugs/add';
  };

  const handleNewProject = () => {
    window.location.href = '/projects/add';
  };

  const handleImportBugs = () => {
    console.log('Import bugs functionality');
  };

  const handleExportData = () => {
    console.log('Export data functionality');
  };

  const stats = [
    {
      title: 'Team Members',
      value: teamStats.teamMembers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Members in your team'
    },
    {
      title: 'Team Bugs',
      value: teamStats.teamBugs,
      icon: Bug,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Total team bugs'
    },
    {
      title: 'Team Resolved',
      value: teamStats.teamResolvedBugs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${teamStats.teamPerformance}% team performance`
    },
    {
      title: 'Team Projects',
      value: teamStats.teamProjects,
      icon: Folder,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Active team projects'
    },
    {
      title: 'My Bugs',
      value: teamStats.myBugs,
      icon: Bug,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Bugs assigned to you'
    },
    {
      title: 'My Resolved',
      value: teamStats.myResolvedBugs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${teamStats.myPerformance}% your performance`
    },
    {
      title: 'Open Bugs',
      value: teamStats.teamOpenBugs,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Requires team attention'
    },
    {
      title: 'Critical Issues',
      value: teamStats.teamCriticalBugs,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'High priority team bugs'
    }
  ];

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loading size="lg" text="Loading team lead dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Team Lead Dashboard' }
        ]}
        showBackButton={false}
      />

      {/* Professional Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Team Lead Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>! 
              Here's an overview of your team's performance and your leadership responsibilities.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" icon={BarChart3} className="min-w-[160px]">
              Team Analytics
            </Button>
            <Button variant="primary" icon={Users} className="min-w-[160px]">
              Manage Team
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Project Summary */}
        <div className="xl:col-span-1">
          <ProjectSummary
            projects={teamProjects}
            projectStats={projectStats}
            onNewProject={handleNewProject}
          />
        </div>

        {/* Right Column - Quick Actions */}
        <div className="xl:col-span-2">
          <QuickActions
            onNewBug={handleNewBug}
            onNewProject={handleNewProject}
            onImportBugs={handleImportBugs}
            onExportData={handleExportData}
          />
        </div>
      </div>

      {/* Recent Bugs - Full Width */}
      <div className="mb-8">
        <RecentBugsList
          bugs={teamBugs}
          onNewBug={handleNewBug}
        />
      </div>

      {/* Activity Feed */}
      <div className="mb-8">
        <ActivityFeed 
          activities={activities}
          loading={activitiesLoading}
          showProject={true}
          maxItems={10}
        />
      </div>

      {/* Team Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Team Overview</h3>
            <p className="text-gray-600 mt-1">Monitor your team's progress and performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <LinkButton to="/teams" variant="ghost" icon={Users}>
              View Team
            </LinkButton>
            <Button variant="primary" icon={BarChart3}>
              Team Analytics
            </Button>
          </div>
        </div>

        {teamLeadTeam ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{teamLeadTeam.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {teamLeadTeam.members?.length || 0} members
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{teamLeadTeam.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{teamProjects.length} projects</span>
                  <span>{teamBugs.length} bugs</span>
                </div>
                <LinkButton 
                  to={`/teams/${teamLeadTeam.id}`} 
                  variant="ghost" 
                  size="sm"
                >
                  Manage
                </LinkButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No team assigned</h4>
            <p className="text-gray-600">You haven't been assigned as a team lead for any team yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
