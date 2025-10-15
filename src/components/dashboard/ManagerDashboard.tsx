import { useState, useEffect } from 'react';
import { useTeams } from '../../context/TeamContext';
import { useBugs } from '../../context/BugContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './StatsCard';
import ActivityFeed from './ActivityFeed';
import Breadcrumb from '../common/Breadcrumb';
import Loading from '../common/Loading';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Folder,
  BarChart3,
  UserPlus,
  Target,
  Award,
  Calendar
} from 'lucide-react';
import { Button } from '../common/buttons';
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
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [user]);


  // Filter bugs and projects for teams managed by this manager
  const managedTeamIds = teams.map(team => team.id);
  const teamBugs = bugs.filter(bug => managedTeamIds.includes(bug.projectId || ''));
  const teamProjects = projects.filter(project => managedTeamIds.includes(project.id));

  // Calculate team stats
  const teamStats = {
    totalTeams: teams.length,
    totalMembers: teams.reduce((acc, team) => acc + (team.members?.length || 0), 0),
    totalProjects: teamProjects.length,
    totalBugs: teamBugs.length,
    resolvedBugs: teamBugs.filter(bug => bug.status === 'resolved' || bug.status === 'closed').length,
    openBugs: teamBugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress').length,
    criticalBugs: teamBugs.filter(bug => bug.priority === 'critical').length,
    avgResolutionTime: 2.5, // TODO: Calculate actual average
    teamPerformance: 85, // TODO: Calculate based on bug resolution, project completion, etc.
    activeProjects: teamProjects.filter(p => p.status === 'active').length,
    completedProjects: teamProjects.filter(p => p.status === 'complete').length,
  };

  const stats = [
    {
      title: 'Teams Managed',
      value: teamStats.totalTeams,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Active teams under management'
    },
    {
      title: 'Team Members',
      value: teamStats.totalMembers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total team members'
    },
    {
      title: 'Active Projects',
      value: teamStats.activeProjects,
      icon: Folder,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Projects in progress'
    },
    {
      title: 'Team Performance',
      value: `${teamStats.teamPerformance}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Overall team efficiency'
    },
    {
      title: 'Bugs Resolved',
      value: teamStats.resolvedBugs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${teamStats.totalBugs > 0 ? Math.round((teamStats.resolvedBugs / teamStats.totalBugs) * 100) : 0}% resolution rate`
    },
    {
      title: 'Critical Issues',
      value: teamStats.criticalBugs,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'High priority bugs'
    },
    {
      title: 'Avg Resolution',
      value: `${teamStats.avgResolutionTime}d`,
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      description: 'Time to resolve bugs'
    },
    {
      title: 'Completed Projects',
      value: teamStats.completedProjects,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Successfully delivered'
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

      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Manager Dashboard
            </h2>
            <p className="text-gray-600">
              Welcome back, {user?.name}! Here's an overview of your teams and their performance.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <Button variant="primary" icon={BarChart3}>
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="quick" icon={UserPlus} onClick={() => window.location.href = '/user-management'}>
                Manage Team Members
              </Button>
              <Button variant="quick" icon={Folder}>
                Create New Project
              </Button>
              <Button variant="quick" icon={BarChart3}>
                Team Analytics
              </Button>
              <Button variant="quick" icon={Calendar}>
                Schedule Meeting
              </Button>
              <Button variant="quick" icon={Target}>
                Performance Review
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <ActivityFeed 
            activities={activities}
            loading={activitiesLoading}
            showProject={true}
            maxItems={8}
          />
        </div>
      </div>

    </div>
  );
};

export default ManagerDashboard;
