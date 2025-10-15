import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Bug, 
  Settings, 
  Calendar, 
  MoreVertical, 
  Eye, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Edit,

  User as UserIcon
} from 'lucide-react';
import type { Project } from '../../types/projects';
import { useTeams } from '../../context/TeamContext';
import { useAuth } from '../../context/AuthContext';
import { getTeamById } from '../../services/teamService';
import { getUserById } from '../../services/userService';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
  onSettings: (project: Project) => void;
  bugCount?: number;
  bugStats?: {
    total: number;
    open: number;
    resolved: number;
    critical: number;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onSettings,
  bugCount = 0,
  bugStats
}) => {
  const { teams } = useTeams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memberCount, setMemberCount] = useState<number>(0);
  const openBugs = bugStats?.open || 0;
  const resolvedBugs = bugStats?.resolved || 0;

  const totalBugs = bugStats?.total || bugCount;

  const [teamName, setTeamName] = useState<string>(project.teamId ? 'Loading…' : 'No Team');
  const [managerName, setManagerName] = useState<string>('-');
  const [teamLeadName, setTeamLeadName] = useState<string>('-');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const canManageProject = useMemo(() => {
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'manager' || user.role === 'team_lead';
  }, [user]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Role-gated create bug permission: allow super_admin/manager/team_lead; allow team_member only if QC/QA team
  const canCreateBug = useMemo(() => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'manager' || user.role === 'team_lead') return true;
    if (user.role === 'team_member') {
      const team = user.teamId ? teams.find(t => t.id === user.teamId) : undefined;
      if (team?.name) {
        const name = team.name.toLowerCase();
        return name.includes('qa') || name.includes('qc') || name.includes('quality');
      }
    }
    return false;
  }, [user, teams]);

  useEffect(() => {
    let isActive = true;

    const loadMeta = async () => {
      try {
        if (project.teamId) {
          const ctxTeam = teams.find(t => t.id === project.teamId);
          let teamManagerId: string | undefined;
          let teamMembersCount = 0;
          
          if (ctxTeam) {
            if (!isActive) return;
            setTeamName(ctxTeam.name);
            teamManagerId = ctxTeam.managerId;
            teamMembersCount = ctxTeam.members?.length || 0;
            setMemberCount(teamMembersCount);
          } else {
            const fetched = await getTeamById(project.teamId);
            if (!isActive) return;
            setTeamName(fetched?.name || 'Unknown Team');
            teamManagerId = fetched?.managerId;
            teamMembersCount = fetched?.members?.length || 0;
            setMemberCount(teamMembersCount);
          }

          if (teamManagerId) {
            const manager = await getUserById(teamManagerId);
            if (!isActive) return;
            setManagerName(manager?.name || '-');
          } else {
            setManagerName('-');
          }
        } else {
          setTeamName('No Team');
          setManagerName('-');
          setMemberCount(0);
        }

        let leadId: string | undefined;
        
        // First, try to get team lead from the assigned team
        if (project.teamId) {
          const ctxTeam = teams.find(t => t.id === project.teamId);
          if (ctxTeam?.teamLeadId) {
            leadId = ctxTeam.teamLeadId;
          } else {
            // If no team lead in team, try to fetch team data
            try {
              const fetched = await getTeamById(project.teamId);
              if (fetched?.teamLeadId) {
                leadId = fetched.teamLeadId;
              }
            } catch (error) {
              console.error('Error fetching team for lead:', error);
            }
          }
        }
        
        // Fallback: look for team_lead in project members
        if (!leadId) {
          const teamLeadMember = project.members?.find(m => m.role === 'team_lead');
          if (teamLeadMember) leadId = teamLeadMember.userId;
        }
        
        // Final fallback: use project owner
        if (!leadId && project.owner) {
          leadId = project.owner;
        }

        if (leadId) {
          const lead = await getUserById(leadId);
          if (!isActive) return;
          setTeamLeadName(lead?.name || '-');
        } else {
          setTeamLeadName('-');
        }
      } catch {
        if (!isActive) return;
        setTeamName(project.teamId ? 'Unknown Team' : 'No Team');
        setManagerName('-');
        setTeamLeadName('-');
        setMemberCount(0);
      }
    };

    loadMeta();

    return () => { isActive = false; };
  }, [project.teamId, project.owner, project.members, teams]);

  const progressPercentage = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0;

  const statusLabel = useMemo(() => {
    switch (project.status) {
      case 'on_hold':
        return 'on hold';
      case 'discontinued':
        return 'discontinued';
      case 'complete':
        return 'complete';
      default:
        return project.status; // active, inactive
    }
  }, [project.status]);

  const statusTooltip = useMemo(() => {
    if (project.status === 'on_hold' || project.status === 'discontinued') {
      return project.statusReason && project.statusReason.trim().length > 0
        ? project.statusReason
        : 'No reason provided';
    }
    return '';
  }, [project.status, project.statusReason]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      case 'complete':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const StatBox: React.FC<{ icon: React.ReactNode; label: string; value: string | number; valueClass?: string }>
    = ({ icon, label, value, valueClass }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="mr-2">{icon}</div>
        <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <span className={`text-gray-900 font-semibold ${valueClass || 'text-sm'}`}>{value}</span>
    </div>
  );

  const Pill: React.FC<{ icon: React.ReactNode; label: string; value: string }>
    = ({ icon, label, value }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="mr-2 text-gray-500">{icon}</div>
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-gray-900 truncate">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 
                onClick={() => navigate(`/p/${project.slug}/preview`)}
                className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors truncate cursor-pointer hover:text-primary"
              >
                {project.name}
              </h3>
              <span title={statusTooltip} className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {project.shortDescription || 'No description'}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              Created {project.createdAt.toLocaleDateString()}
            </div>
          </div>
          {(canManageProject || canCreateBug) && (
            <div className="ml-4 relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { setMenuOpen(false); navigate(`/p/${project.slug}/edit`); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 inline mr-2 text-gray-500" /> Edit
                </button>
                {onSettings && canManageProject && (
                  <button
                    onClick={() => { setMenuOpen(false); onSettings(project); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 inline mr-2 text-gray-500" />Settings
                  </button>
                )}
                {onDelete && canManageProject && (
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(project.id); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" /> Delete
                  </button>
                )}
                {canCreateBug && (
                  <button
                    onClick={() => { setMenuOpen(false); navigate(`/p/${project.slug}?newBug=1`); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Bug className="w-4 h-4 inline mr-2 text-gray-500" /> Create Bug
                  </button>
                )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meta: Team / Manager / Lead */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <Pill icon={<Users className="w-4 h-4" />} label="Assigned Team" value={teamName} />
          <Pill icon={<UserIcon className="w-4 h-4" />} label="Manager" value={managerName} />
          <Pill icon={<UserIcon className="w-4 h-4" />} label="Team Lead" value={teamLeadName} />
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatBox 
            icon={<Users className="w-4 h-4 text-gray-500" />} 
            label="Members" 
            value={memberCount} 
            valueClass="text-base"
          />
          <StatBox 
            icon={<Bug className="w-4 h-4 text-gray-500" />} 
            label="Total Bugs" 
            value={totalBugs} 
            valueClass="text-base"
          />
          <StatBox 
            icon={<AlertCircle className="w-4 h-4 text-orange-500" />} 
            label="Open" 
            value={openBugs} 
            valueClass="text-base"
          />
          <StatBox 
            icon={<CheckCircle className="w-4 h-4 text-green-600" />} 
            label="Resolved" 
            value={resolvedBugs} 
            valueClass="text-base"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <Link
              to={`/p/${project.slug}`}
              className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Eye className="w-4 h-4 mr-1" />
              Kenben View
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigate(`/p/${project.slug}/preview`)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 