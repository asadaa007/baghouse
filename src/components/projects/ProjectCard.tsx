import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Bug, 
  Settings, 
  Calendar, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,

  User as UserIcon
} from 'lucide-react';
import type { Project } from '../../types/projects';
import { useTeams } from '../../context/TeamContext';
import { getTeamById } from '../../services/teamService';
import { getUserById } from '../../services/userService';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onSettings: (project: Project) => void;
  onEditTeam?: (teamId: string) => void;
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
  onEdit,
  onDelete,
  onSettings,
  onEditTeam,
  bugCount = 0,
  bugStats
}) => {
  const { teams } = useTeams();
  const memberCount = project.members?.length || 0;
  const openBugs = bugStats?.open || 0;
  const resolvedBugs = bugStats?.resolved || 0;

  const totalBugs = bugStats?.total || bugCount;

  const [teamName, setTeamName] = useState<string>(project.teamId ? 'Loading…' : 'No Team');
  const [managerName, setManagerName] = useState<string>('-');
  const [teamLeadName, setTeamLeadName] = useState<string>('-');

  useEffect(() => {
    let isActive = true;

    const loadMeta = async () => {
      try {
        if (project.teamId) {
          const ctxTeam = teams.find(t => t.id === project.teamId);
          let teamManagerId: string | undefined;
          if (ctxTeam) {
            if (!isActive) return;
            setTeamName(ctxTeam.name);
            teamManagerId = ctxTeam.managerId;
          } else {
            const fetched = await getTeamById(project.teamId);
            if (!isActive) return;
            setTeamName(fetched?.name || 'Unknown Team');
            teamManagerId = fetched?.managerId;
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
        }

        let leadId: string | undefined;
        const adminMember = project.members?.find(m => m.role === 'admin');
        if (adminMember) leadId = adminMember.userId;
        else if (project.owner) leadId = project.owner;

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
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
              <span title={statusTooltip} className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {project.description}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              Created {project.createdAt.toLocaleDateString()}
            </div>
          </div>
          <div className="ml-4">
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meta: Team / Manager / Lead */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="relative">
            <Pill icon={<Users className="w-4 h-4" />} label="Assigned Team" value={teamName} />
            {project.teamId && onEditTeam && (
              <button
                onClick={() => onEditTeam(project.teamId!)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
                title="Edit Team"
              >
                <Edit className="w-3 h-3" />
              </button>
            )}
          </div>
          <Pill icon={<UserIcon className="w-4 h-4" />} label="Manager" value={managerName} />
          <Pill icon={<UserIcon className="w-4 h-4" />} label="Team Lead" value={teamLeadName} />
        </div>

        {/* Progress Bar */}
        {totalBugs > 0 && (
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
        )}

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
              to={`/projects/${project.id}`}
              className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Project
            </Link>
            <button
              onClick={() => onEdit(project)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onSettings(project)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Project Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 