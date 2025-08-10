import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTeams } from '../../context/TeamContext';
import { useBugs } from '../../context/BugContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './StatsCard';
import Breadcrumb from '../common/Breadcrumb';
import Loading from '../common/Loading';
import TeamModal from '../projects/TeamModal';
import TeamDetailsModal from '../projects/TeamDetailsModal';
import { TeamCard } from '../common';
import { getUserNamesByIds, getUserDetailsByIds } from '../../services/userService';
import { projectService } from '../../services/projectService';
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Folder,
  BarChart3,
  Plus,
  Activity,
  Gauge,
  Server,
  KeyRound,
  Bug
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { teams, loading: teamsLoading, updateTeam } = useTeams();
  const { bugs } = useBugs();
  const { projects } = useProjects();
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamDetailsModalOpen, setTeamDetailsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamModalMode, setTeamModalMode] = useState<'create' | 'edit'>('edit');
  const [managerNames, setManagerNames] = useState<Record<string, string>>({});
  const [teamLeadNames, setTeamLeadNames] = useState<Record<string, string>>({});
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [memberDetails, setMemberDetails] = useState<Record<string, { name: string; role: string }>>({});

  // Fetch manager, team lead names, and member details for display
  useEffect(() => {
    const fetchNames = async () => {
      if (teams.length > 0) {
        const managerIds = teams.map(team => team.managerId).filter((id): id is string => Boolean(id));
        const teamLeadIds = teams.map(team => team.teamLeadId).filter((id): id is string => Boolean(id));
        
        // Get all unique member IDs from all teams
        const allMemberIds = teams.reduce((acc: string[], team) => {
          if (team.members && Array.isArray(team.members)) {
            acc.push(...team.members);
          }
          return acc;
        }, []);
        const uniqueMemberIds = [...new Set(allMemberIds)];
        
        const managerNames = await getUserNamesByIds(managerIds);
        const teamLeadNames = await getUserNamesByIds(teamLeadIds);
        const memberDetails = await getUserDetailsByIds(uniqueMemberIds);
        
        setManagerNames(managerNames);
        setTeamLeadNames(teamLeadNames);
        setMemberDetails(memberDetails);
      }
    };

    fetchNames();
  }, [teams]);

  // Fetch project counts for each team
  useEffect(() => {
    const fetchProjectCounts = async () => {
      if (teams.length > 0) {
        const counts: Record<string, number> = {};
        
        for (const team of teams) {
          try {
            const teamProjects = await projectService.getProjectsByTeam(team.id);
            counts[team.id] = teamProjects.length;
          } catch (error) {
            console.error(`Error fetching projects for team ${team.id}:`, error);
            counts[team.id] = 0;
          }
        }
        
        setProjectCounts(counts);
      }
    };

    fetchProjectCounts();
  }, [teams]);

  const uniqueManagers = Array.from(new Set(teams.map(t => t.managerId)));

  const systemStats = {
    totalTeams: teams.length,
    totalManagers: uniqueManagers.length,
    totalMembers: teams.reduce((acc, team) => acc + (team.members?.length || 0), 0),
    totalProjects: projects.length,
    totalBugs: bugs.length,
    resolvedBugs: bugs.filter(b => b.status === 'resolved').length,
    openBugs: bugs.filter(b => b.status === 'new' || b.status === 'in-progress').length,
    criticalBugs: bugs.filter(b => b.priority === 'critical').length,
    resolutionRate: bugs.length ? Math.round((bugs.filter(b => b.status === 'resolved').length / bugs.length) * 100) : 0,
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

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team);
    setTeamModalMode('edit');
    setTeamModalOpen(true);
  };

  const handleViewTeam = (team: any) => {
    setSelectedTeam(team);
    setTeamDetailsModalOpen(true);
  };

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setTeamModalMode('create');
    setTeamModalOpen(true);
  };

  const handleSaveTeam = async (teamData: any) => {
    try {
      if (teamModalMode === 'edit' && selectedTeam) {
        await updateTeam(selectedTeam.id, teamData);
      }
      setTeamModalOpen(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Failed to save team');
    }
  };

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
          <Link to="/user-management" className="btn-secondary">Manage Users</Link>
          <Link to="/projects" className="btn-secondary">View Projects</Link>
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
            <Link to="/user-management" className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-900">User Management</span>
              <Users className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/projects" className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-900">Projects</span>
              <Folder className="w-4 h-4 text-gray-400" />
            </Link>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-900">System Analytics</span>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-900">Access Controls</span>
              <KeyRound className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Teams Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Teams Overview</h3>
          <button onClick={handleCreateTeam} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Create Team</button>
        </div>
        {teams.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h4>
            <p className="text-gray-600 mb-4">Create your first team to get started</p>
            <button onClick={handleCreateTeam} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Create Team</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {teams.map((team) => (
                             <TeamCard
                 key={team.id}
                 team={team}
                 managerName={managerNames[team.managerId]}
                 teamLeadName={team.teamLeadId ? teamLeadNames[team.teamLeadId] : undefined}
                 projectCount={projectCounts[team.id] || 0}
                 totalBugs={bugs.filter(b => b.projectId && projects.find(p => p.id === b.projectId)?.teamId === team.id).length}
                 bugsResolved={bugs.filter(b => b.projectId && projects.find(p => p.id === b.projectId)?.teamId === team.id && b.status === 'resolved').length}
                 memberDetails={memberDetails}
                 onView={handleViewTeam}
                 onEdit={handleEditTeam}
                 variant="default"
               />
            ))}
          </div>
        )}
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

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify_between p-3 border border-gray-100 rounded-lg">
              <div className="text-sm text-gray-900">New team created</div>
              <div className="text-xs text-gray-500">2 hours ago</div>
            </div>
            <div className="flex items-center justify_between p-3 border border-gray-100 rounded-lg">
              <div className="text-sm text-gray-900">Bug resolved</div>
              <div className="text-xs text-gray-500">4 hours ago</div>
            </div>
            <div className="flex items-center justify_between p-3 border border-gray-100 rounded-lg">
              <div className="text-sm text-gray-900">New project started</div>
              <div className="text-xs text-gray-500">1 day ago</div>
            </div>
          </div>
        </div>
      </div>

             <TeamModal
         isOpen={teamModalOpen}
         onClose={() => {
           setTeamModalOpen(false);
           setSelectedTeam(null);
         }}
         onSave={handleSaveTeam}
         team={selectedTeam}
         mode={teamModalMode}
       />

       <TeamDetailsModal
         isOpen={teamDetailsModalOpen}
         onClose={() => {
           setTeamDetailsModalOpen(false);
           setSelectedTeam(null);
         }}
         team={selectedTeam}
         managerName={selectedTeam ? managerNames[selectedTeam.managerId] : undefined}
         teamLeadName={selectedTeam && selectedTeam.teamLeadId ? teamLeadNames[selectedTeam.teamLeadId] : undefined}
         totalBugs={selectedTeam ? bugs.filter(b => b.projectId && projects.find(p => p.id === b.projectId)?.teamId === selectedTeam.id).length : 0}
         bugsResolved={selectedTeam ? bugs.filter(b => b.projectId && projects.find(p => p.id === b.projectId)?.teamId === selectedTeam.id && b.status === 'resolved').length : 0}
       />
    </div>
  );
};

export default SuperAdminDashboard;
