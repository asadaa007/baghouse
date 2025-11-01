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
import { 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Folder,
  BarChart3,
  UserPlus,
  Award,
  Shield,
  Gauge,
  Download
} from 'lucide-react';
import { Button, LinkButton } from '../common/buttons';
import { activityService, type ActivityItem } from '../../services/activityService';


const ManagerDashboard = () => {
  const { user } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { bugs } = useBugs();
  const { projects } = useProjects();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // Fetch recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      try {
        setActivitiesLoading(true);
        const recentActivities = await activityService.getRecentActivities(user.id, 10);
        setActivities(recentActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [user]);


  // Filter bugs and projects for teams managed by this manager
  const managedTeamIds = teams.map(team => team.id);
  const teamBugs = bugs.filter(bug => {
    // Find the project for this bug
    const project = projects.find(p => p.id === bug.projectId);
    return project && managedTeamIds.includes(project.teamId || '');
  });
  const teamProjects = projects.filter(project => managedTeamIds.includes(project.teamId || ''));

  // Calculate team stats
  const resolvedBugs = teamBugs.filter(bug => bug.status === 'completed' || bug.status === 'resolved').length;
  const openBugs = teamBugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress' || bug.status === 'in_progress').length;
  const criticalBugs = teamBugs.filter(bug => bug.priority === 'critical').length;
  const activeProjects = teamProjects.filter(p => p.status === 'active').length;
  const completedProjects = teamProjects.filter(p => p.status === 'complete').length;
  
  // Calculate resolution rate
  const resolutionRate = teamBugs.length > 0 ? Math.round((resolvedBugs / teamBugs.length) * 100) : 0;
  
  // Calculate average resolution time
  const calculateAvgResolutionTime = () => {
    const resolvedBugsWithTimestamps = teamBugs.filter(bug => 
      (bug.status === 'completed' || bug.status === 'resolved') && 
      bug.createdAt && 
      bug.updatedAt
    );

    if (resolvedBugsWithTimestamps.length === 0) return 0;

    const totalResolutionTime = resolvedBugsWithTimestamps.reduce((total, bug) => {
      const createdAt = bug.createdAt instanceof Date ? bug.createdAt : new Date(bug.createdAt);
      const updatedAt = bug.updatedAt instanceof Date ? bug.updatedAt : new Date(bug.updatedAt);
      const resolutionTime = updatedAt.getTime() - createdAt.getTime();
      return total + resolutionTime;
    }, 0);

    const avgTimeInMs = totalResolutionTime / resolvedBugsWithTimestamps.length;
    const avgTimeInDays = avgTimeInMs / (1000 * 60 * 60 * 24); // Convert to days
    return Math.round(avgTimeInDays * 10) / 10; // Round to 1 decimal place
  };

  // Calculate team performance based on multiple factors
  const projectCompletionRate = teamProjects.length > 0 ? Math.round((completedProjects / teamProjects.length) * 100) : 0;
  const bugResolutionRate = resolutionRate;
  const teamPerformance = Math.round((projectCompletionRate + bugResolutionRate) / 2);

  const teamStats = {
    totalTeams: teams.length,
    totalMembers: teams.reduce((acc, team) => acc + (team.members?.length || 0), 0),
    totalProjects: teamProjects.length,
    totalBugs: teamBugs.length,
    resolvedBugs,
    openBugs,
    criticalBugs,
    avgResolutionTime: calculateAvgResolutionTime(),
    teamPerformance,
    activeProjects,
    completedProjects,
    resolutionRate,
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
    // TODO: Implement import functionality
    console.log('Import bugs functionality');
  };

  const handleExportData = () => {
    // TODO: Implement export functionality
    console.log('Export data functionality');
  };

  // Navigation handlers for stats cards
  const handleViewTeams = () => {
    window.location.href = '/teams';
  };

  const handleViewProjects = () => {
    window.location.href = '/projects';
  };

  const handleViewBugs = () => {
    window.location.href = '/bugs';
  };

  const handleViewCriticalBugs = () => {
    window.location.href = '/bugs?priority=critical';
  };

  const stats = [
    {
      title: 'Teams Managed',
      value: teamStats.totalTeams,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Teams under your management',
      onClick: handleViewTeams,
      clickable: true
    },
    {
      title: 'Team Members',
      value: teamStats.totalMembers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total team members',
      onClick: handleViewTeams,
      clickable: true
    },
    {
      title: 'Active Projects',
      value: teamStats.activeProjects,
      icon: Folder,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Projects in progress',
      onClick: handleViewProjects,
      clickable: true
    },
    {
      title: 'Team Performance',
      value: `${teamStats.teamPerformance}%`,
      icon: Gauge,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Overall team efficiency',
      clickable: false
    },
    {
      title: 'Bugs Resolved',
      value: teamStats.resolvedBugs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${teamStats.resolutionRate}% resolution rate`,
      onClick: handleViewBugs,
      clickable: true
    },
    {
      title: 'Critical Issues',
      value: teamStats.criticalBugs,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'High priority bugs',
      onClick: handleViewCriticalBugs,
      clickable: true
    },
    {
      title: 'Avg Resolution',
      value: `${teamStats.avgResolutionTime}d`,
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      description: 'Time to resolve bugs',
      clickable: false
    },
    {
      title: 'Completed Projects',
      value: teamStats.completedProjects,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Successfully delivered',
      onClick: handleViewProjects,
      clickable: true
    }
  ];



  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loading size="lg" text="Loading manager dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Manager Dashboard' }
        ]}
        showBackButton={false}
      />

      {/* Professional Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manager Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>! 
              Here's an overview of your teams and their performance.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <Button variant="outline" icon={Download} onClick={handleExportData}>
              Export Report
            </Button>
            <Button variant="primary" icon={BarChart3}>
              Analytics
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
            <h3 className="text-xl font-semibold text-gray-900">Team Management</h3>
            <p className="text-gray-600 mt-1">Manage your teams and monitor performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <LinkButton to="/teams" variant="ghost" icon={Users}>
              View Teams
            </LinkButton>
            <Button variant="primary" icon={UserPlus}>
              Add Team Member
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{team.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {team.members?.length || 0} members
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{team.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{teamProjects.filter(p => p.teamId === team.id).length} projects</span>
                  <span>{teamBugs.filter(b => b.projectId && teamProjects.some(p => p.id === b.projectId && p.teamId === team.id)).length} bugs</span>
                </div>
                <LinkButton 
                  to={`/teams/${team.id}`} 
                  variant="ghost" 
                  size="sm"
                >
                  Manage
                </LinkButton>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ManagerDashboard;
