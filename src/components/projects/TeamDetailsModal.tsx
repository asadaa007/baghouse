import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Bug, CheckCircle, Folder, User, UserCheck } from 'lucide-react';
import type { Team } from '../../types/auth';
import type { Project } from '../../types/projects';
import { projectService } from '../../services/projectService';
import { getUserDetailsByIds } from '../../services/userService';

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  managerName?: string;
  teamLeadName?: string;
  totalBugs?: number;
  bugsResolved?: number;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  isOpen,
  onClose,
  team,
  managerName,
  teamLeadName,
  totalBugs = 0,
  bugsResolved = 0
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberDetails, setMemberDetails] = useState<Record<string, { name: string; role: string }>>({});

  useEffect(() => {
    if (isOpen && team) {
      fetchTeamData();
    }
  }, [isOpen, team]);

  const fetchTeamData = async () => {
    if (!team) return;
    
    setLoading(true);
    try {
      // Fetch team projects
      const teamProjects = await projectService.getProjectsByTeam(team.id);
      setProjects(teamProjects);

      // Fetch member details
      if (team.members && team.members.length > 0) {
        const details = await getUserDetailsByIds(team.members);
        setMemberDetails(details);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'complete': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
              <p className="text-gray-600">{team.description || 'No description available'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Team Info */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Team Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{totalBugs}</div>
                    <div className="text-sm text-gray-600">Total Bugs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{bugsResolved}</div>
                    <div className="text-sm text-gray-600">Resolved</div>
                  </div>
                                                <div className="text-center">
                                                                                               <div className="text-2xl font-bold text-purple-600">
                                 {(() => {
                                   const members = Array.isArray(team.members) ? team.members : [];
                                   
                                   if (members.length === 0) {
                                     return 0;
                                   }
                                   
                                   if (Object.keys(memberDetails).length > 0) {
                                     const teamMembers = members.filter(memberId => 
                                       memberDetails[memberId]?.role === 'team_member'
                                     );
                                     return teamMembers.length;
                                   }
                                   
                                   return members.length;
                                 })()}
                               </div>
                                <div className="text-sm text-gray-600">Members</div>
                              </div>
                </div>
              </div>

              {/* Team Leadership */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Leadership</h3>
                <div className="space-y-3">
                  {managerName && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{managerName}</div>
                        <div className="text-xs text-gray-600">Manager</div>
                      </div>
                    </div>
                  )}
                  {teamLeadName && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{teamLeadName}</div>
                        <div className="text-xs text-gray-600">Team Lead</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

                             {/* Team Members */}
               <div className="bg-white border border-gray-200 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
                 <div className="space-y-2">
                   {(() => {
                     const members = Array.isArray(team.members) ? team.members : [];
                     
                     if (members.length === 0) {
                       return <p className="text-sm text-gray-500">No members assigned</p>;
                     }
                     
                                           // Show only team_member role users in the member list
                      const teamMembers = members.filter(memberId => 
                        memberDetails[memberId]?.role === 'team_member'
                      );

                      if (teamMembers.length === 0) {
                        return <p className="text-sm text-gray-500">No team members assigned</p>;
                      }

                      return (
                        <div className="space-y-2">
                          {teamMembers.map((memberId) => (
                           <div key={memberId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                             <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                               <Users className="w-4 h-4 text-gray-600" />
                             </div>
                             <div className="text-sm font-medium text-gray-900">
                               {memberDetails[memberId]?.name || memberId}
                             </div>
                           </div>
                         ))}
                       </div>
                     );
                   })()}
                 </div>
               </div>

              {/* Team Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium text-gray-900">
                      {team.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900">
                      {team.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Projects List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Team Projects</h3>
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">{projects.length} projects</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h4>
                <p className="text-gray-600">This team hasn't been assigned any projects.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProjectStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{project.description || 'No description available'}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="text-xs text-gray-500">Start Date</div>
                                                             <div className="text-sm font-medium text-gray-900">
                                 Not set
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="text-xs text-gray-500">End Date</div>
                                                             <div className="text-sm font-medium text-gray-900">
                                 Not set
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Bug className="w-4 h-4 text-red-500" />
                            <div>
                              <div className="text-xs text-gray-500">Bugs</div>
                                                             <div className="text-sm font-medium text-gray-900">0</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <div>
                              <div className="text-xs text-gray-500">Resolved</div>
                                                             <div className="text-sm font-medium text-gray-900">0</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Progress</div>
                                                     <div className="text-sm font-medium text-gray-900">0%</div>
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                                         style={{ width: '0%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsModal;
