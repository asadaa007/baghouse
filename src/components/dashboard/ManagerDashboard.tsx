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
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Folder,
  BarChart3,
  Plus,
  UserPlus,
  Target,
  Award,
  Calendar,
  Star
} from 'lucide-react';


const ManagerDashboard = () => {
  const { user } = useAuth();
  const { teams, loading: teamsLoading, updateTeam } = useTeams();
  const { bugs } = useBugs();
  const { projects } = useProjects();

  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
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
    resolvedBugs: teamBugs.filter(bug => bug.status === 'resolved').length,
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

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'member_added',
      message: 'John Doe added to Development Team',
      time: '2 hours ago',
      icon: UserPlus,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'bug_resolved',
      message: 'Critical bug resolved in Project Alpha',
      time: '4 hours ago',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'project_started',
      message: 'New project "Beta Release" assigned',
      time: '1 day ago',
      icon: Folder,
      color: 'text-indigo-500'
    },
    {
      id: 4,
      type: 'performance_improved',
      message: 'Team performance improved by 15%',
      time: '2 days ago',
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ];

  // Mock data for team performance
  const teamPerformanceData = teams.map(team => ({
    id: team.id,
    name: team.name,
    performance: Math.floor(Math.random() * 30) + 70, // 70-100%
    bugsResolved: Math.floor(Math.random() * 20) + 5,
    projectsCompleted: projectCounts[team.id] || 0,
    avgResponseTime: (Math.random() * 3 + 1).toFixed(1),
    memberCount: team.members?.length || 0
  }));

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
            <button className="btn-primary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* My Teams */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">My Teams</h3>
            <div className="flex space-x-2">
              <Link to="/user-management" className="btn-secondary">
                <UserPlus className="w-4 h-4 mr-2" />
                Manage Members
              </Link>
              <button onClick={handleCreateTeam} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </button>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h4>
              <p className="text-gray-600 mb-4">Create your first team to get started</p>
              <button onClick={handleCreateTeam} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {teams.map((team) => {

                return (
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
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/user-management" className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Manage Team Members</span>
                <UserPlus className="w-4 h-4 text-gray-400" />
              </Link>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Create New Project</span>
                <Folder className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Team Analytics</span>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Schedule Meeting</span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Performance Review</span>
                <Target className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 mt-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium">
              View All Activity
            </button>
          </div>
        </div>
      </div>

      {/* Team Performance Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Team Performance Overview</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Performance Score</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {teamPerformanceData.map((team) => {
            const teamData = teams.find(t => t.id === team.id);
            if (!teamData) return null;
            
            return (
                             <TeamCard
                 key={team.id}
                 team={teamData}
                 managerName={managerNames[teamData.managerId]}
                 teamLeadName={teamData.teamLeadId ? teamLeadNames[teamData.teamLeadId] : undefined}
                 projectCount={projectCounts[team.id] || 0}
                 totalBugs={bugs.filter(b => b.projectId && projects.find(p => p.id === b.projectId)?.teamId === teamData.id).length}
                 bugsResolved={bugs.filter(b => b.projectId && projects.find(p => p.id === b.projectId)?.teamId === teamData.id && b.status === 'resolved').length}
                 memberDetails={memberDetails}
                 onView={handleViewTeam}
                 onEdit={handleEditTeam}
                 variant="default"
               />
            );
          })}
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

export default ManagerDashboard;
