import React from 'react';
import { 
  Users, 
  Edit, 
  Eye, 
  Settings, 
  UserPlus, 
  BarChart3, 
  MessageSquare,
  Calendar,
  Bug,
  CheckCircle,
  User,
  UserCheck
} from 'lucide-react';
import type { Team } from '../../types/auth';

interface TeamCardProps {
  team: Team;
  managerName?: string;
  teamLeadName?: string;
  projectCount?: number;
  performance?: number;
  bugsResolved?: number;
  totalBugs?: number;
  avgResponseTime?: number;
  showActions?: boolean;
  showPerformance?: boolean;
  memberDetails?: Record<string, { name: string; role: string }>;
  onEdit?: (team: Team) => void;
  onView?: (team: Team) => void;
  onSettings?: (team: Team) => void;
  onAddMember?: (team: Team) => void;
  onViewPerformance?: (team: Team) => void;
  onCommunicate?: (team: Team) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  managerName,
  teamLeadName,
  projectCount = 0,
  performance,
  bugsResolved = 0,
  totalBugs = 0,
  showActions = true,
  memberDetails = {},
  onEdit,
  onView,
  onSettings,
  onAddMember,
  onViewPerformance,
  onCommunicate,
  variant = 'default'
}) => {
  const getPerformanceColor = (perf: number) => {
    if (perf >= 90) return 'bg-green-100 text-green-700';
    if (perf >= 80) return 'bg-blue-100 text-blue-700';
    if (perf >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  // Calculate member count - show only team_member role users
  const getRegularMemberCount = () => {
    // Ensure team.members exists and is an array
    const members = Array.isArray(team.members) ? team.members : [];
    
    // If no members array or empty array, return 0
    if (members.length === 0) {
      return 0;
    }
    
    // If member details are available, count only team_member role users
    if (Object.keys(memberDetails).length > 0) {
      const teamMembers = members.filter(memberId => 
        memberDetails[memberId]?.role === 'team_member'
      );
      return teamMembers.length;
    }
    
    // Fallback to total count if member details not available
    return members.length;
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
            {performance !== undefined && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPerformanceColor(performance)}`}>
                {performance}%
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Bug className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Total Bugs</p>
                <p className="text-lg font-semibold text-gray-900">{totalBugs}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Fixed</p>
                <p className="text-lg font-semibold text-gray-900">{bugsResolved}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Projects</p>
                <p className="text-lg font-semibold text-gray-900">{projectCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getRegularMemberCount()}
                </p>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2 pt-4 border-t border-gray-100">
              <button 
                onClick={() => onView?.(team)}
                className="flex-1 px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Details
              </button>
              <button 
                onClick={() => onViewPerformance?.(team)}
                className="flex-1 px-3 py-2 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
              {performance !== undefined && (
                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {performance}% Performance
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {onView && (
                <button 
                  onClick={() => onView(team)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {onEdit && (
                <button 
                  onClick={() => onEdit(team)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                  title="Edit Team"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onSettings && (
                <button 
                  onClick={() => onSettings(team)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                  title="Team Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {team.description && (
            <p className="text-sm text-gray-600 mb-4">{team.description}</p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <div className="text-lg font-semibold text-gray-900">
                {getRegularMemberCount()}
              </div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <Bug className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <div className="text-lg font-semibold text-gray-900">{totalBugs}</div>
              <div className="text-xs text-gray-500">Total Bugs</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-semibold text-gray-900">{bugsResolved}</div>
              <div className="text-xs text-gray-500">Fixed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-semibold text-gray-900">{projectCount}</div>
              <div className="text-xs text-gray-500">Projects</div>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2 pt-4 border-t border-gray-100">
              {onAddMember && (
                <button 
                  onClick={() => onAddMember(team)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </button>
              )}
              {onViewPerformance && (
                <button 
                  onClick={() => onViewPerformance(team)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Performance
                </button>
              )}
              {onCommunicate && (
                <button 
                  onClick={() => onCommunicate(team)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Communicate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant - Professional layout
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
          <div className="flex items-center space-x-2">
            {onView && (
              <button 
                onClick={() => onView(team)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                title="View Team Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(team)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                title="Edit Team"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Description */}
        {team.description && (
          <p className="text-sm text-gray-600 mb-4">{team.description}</p>
        )}
        
        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {managerName && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <User className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Manager</p>
                <p className="text-sm font-medium text-gray-900">{managerName}</p>
              </div>
            </div>
          )}
          
          {teamLeadName && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Team Lead</p>
                <p className="text-sm font-medium text-gray-900">{teamLeadName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{projectCount}</div>
            <div className="text-xs text-gray-500">Projects</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Bug className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{totalBugs}</div>
            <div className="text-xs text-gray-500">Bugs</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{bugsResolved}</div>
            <div className="text-xs text-gray-500">Fixed</div>
          </div>
        </div>
        
        {/* Members at the bottom */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-500">Team Members</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {getRegularMemberCount()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
