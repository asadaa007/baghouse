import { useState, useEffect } from 'react';
import { useTeams } from '../../context/TeamContext';
import { useBugs } from '../../context/BugContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './StatsCard';
import ActivityFeed from './ActivityFeed';
import Breadcrumb from '../common/Breadcrumb';
import Loading from '../common/Loading';
import { getUserNamesByIds } from '../../services/userService';
import { activityService, type ActivityItem } from '../../services/activityService';
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Folder,
  BarChart3,
  Activity,
  Gauge,
  Server,
  KeyRound,
  Bug
} from 'lucide-react';
import { LinkButton, Button } from '../common/buttons';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { bugs } = useBugs();
  const { projects } = useProjects();
  const [managerNames, setManagerNames] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Fetch manager names for display
  useEffect(() => {
    const fetchNames = async () => {
      if (teams.length > 0) {
        const managerIds = teams.map(team => team.managerId).filter((id): id is string => Boolean(id));
        const managerNames = await getUserNamesByIds(managerIds);
        setManagerNames(managerNames);
      }
    };

    fetchNames();
  }, [teams]);

  // Fetch all activities for super admin
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      try {
        setActivitiesLoading(true);
        const allActivities = await activityService.getAllActivities(20);
        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const uniqueManagers = Array.from(new Set(teams.map(t => t.managerId)));

  const systemStats = {
    totalTeams: teams.length,
    totalManagers: uniqueManagers.length,
    totalMembers: teams.reduce((acc, team) => acc + (team.members?.length || 0), 0),
    totalProjects: projects.length,
    totalBugs: bugs.length,
    resolvedBugs: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
    openBugs: bugs.filter(b => b.status === 'new' || b.status === 'in-progress').length,
    criticalBugs: bugs.filter(b => b.priority === 'critical').length,
    resolutionRate: bugs.length ? Math.round((bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length / bugs.length) * 100) : 0,
  };

  const stats = [
    { title: 'Teams', value: systemStats.totalTeams, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100', description: 'Total active teams' },
    { title: 'Managers', value: systemStats.totalManagers, icon: Shield, color: 'text-purple-600', bgColor: 'bg-purple-100', description: 'People managing teams' },
    { title: 'Members', value: systemStats.totalMembers, icon: Users, color: 'text-emerald-600', bgColor: 'bg-emerald-100', description: 'All team members' },
    { title: 'Projects', value: systemStats.totalProjects, icon: Folder, color: 'text-indigo-600', bgColor: 'bg-indigo-100', description: 'Active projects' },
    { title: 'Bugs', value: systemStats.totalBugs, icon: Bug, color: 'text-red-600', bgColor: 'bg-red-100', description: 'Reported issues' },
    { title: 'Resolved', value: systemStats.resolvedBugs, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', description: `${systemStats.resolutionRate}% resolution` },
    { title: 'Open', value: systemStats.openBugs, icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100', description: 'Needs attention' },
    { title: 'Critical', value: systemStats.criticalBugs, icon: AlertTriangle, color: 'text-rose-600', bgColor: 'bg-rose-100', description: 'High priority' },
  ];

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loading size="lg" text="Loading super admin dashboard..." />
      </div>
    );
  }

  // Top managers leaderboard (by team size)
  const managerToTeamSize: Record<string, number> = {};
  teams.forEach(t => {
    managerToTeamSize[t.managerId] = (managerToTeamSize[t.managerId] || 0) + (t.members?.length || 0);
  });
  const topManagers = Object.entries(managerToTeamSize)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Super Admin Dashboard' }]} showBackButton={false} />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Super Admin</h2>
          <p className="text-gray-600">Welcome back, {user?.name}. Here’s your system overview and controls.</p>
        </div>
        <div className="flex gap-2">
          <LinkButton to="/user-management" variant="secondary">Manage Users</LinkButton>
          <LinkButton to="/projects" variant="secondary">View Projects</LinkButton>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => <StatsCard key={i} {...s} />)}
      </div>

      {/* Two-Column: System Health + Quick Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* System Health */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">System Health</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center text-gray-500 text-sm mb-1"><Gauge className="w-4 h-4 mr-2" />Resolution Rate</div>
              <div className="text-2xl font-bold">{systemStats.resolutionRate}%</div>
              <div className="text-xs text-gray-500">Resolved / Total bugs</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center text-gray-500 text-sm mb-1"><Server className="w-4 h-4 mr-2" />Active Teams</div>
              <div className="text-2xl font-bold">{systemStats.totalTeams}</div>
              <div className="text-xs text-gray-500">Total across organization</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center text-gray-500 text-sm mb-1"><Activity className="w-4 h-4 mr-2" />Open Issues</div>
              <div className="text-2xl font-bold">{systemStats.openBugs}</div>
              <div className="text-xs text-gray-500">Pending resolution</div>
            </div>
          </div>
        </div>

        {/* Quick Admin Tools */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Admin</h3>
          <div className="space-y-3">
            <Button variant="quick" icon={Users} onClick={() => window.location.href = '/user-management'}>
              User Management
            </Button>
            <Button variant="quick" icon={Folder} onClick={() => window.location.href = '/projects'}>
              Projects
            </Button>
            <Button variant="quick" icon={BarChart3}>
              System Analytics
            </Button>
            <Button variant="quick" icon={KeyRound}>
              Access Controls
            </Button>
          </div>
        </div>
      </div>


      {/* Leaderboard & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Managers (by team size)</h3>
          <div className="space-y-3">
            {topManagers.length === 0 && <p className="text-sm text-gray-500">No managers yet.</p>}
            {topManagers.map(([managerId, size]) => (
              <div key={managerId} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <span className="text-sm text-gray-900">{managerNames[managerId] || managerId}</span>
                <span className="text-xs text-gray-600">{size} members</span>
              </div>
            ))}
          </div>
        </div>

        <ActivityFeed 
          activities={activities}
          loading={activitiesLoading}
          showProject={true}
          maxItems={10}
        />
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
