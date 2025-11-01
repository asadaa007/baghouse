import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import type { Team, CreateTeamData } from '../../types/auth';
import { getAllUsers } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamData: CreateTeamData) => Promise<void>;
  team?: Team;
  mode: 'create' | 'edit';
}

const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  team,
  mode
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
    teamLeadIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [availableManagers, setAvailableManagers] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [availableTeamLeads, setAvailableTeamLeads] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load available managers and team leads
  useEffect(() => {
    if (!isOpen) return;
    
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const allUsers = await getAllUsers();
        
        // Filter managers (users with manager role)
        const managers = allUsers.filter(u => u.role === 'manager').map(u => ({
          id: u.id,
          name: u.name,
          email: u.email
        }));
        setAvailableManagers(managers);
        
        // Filter team leads (users with team_lead role)
        const teamLeads = allUsers.filter(u => u.role === 'team_lead').map(u => ({
          id: u.id,
          name: u.name,
          email: u.email
        }));
        setAvailableTeamLeads(teamLeads);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [isOpen]);

  useEffect(() => {
    if (team && mode === 'edit' && isOpen) {
      setFormData({
        name: team.name,
        description: team.description || '',
        managerId: team.managerId || '',
        teamLeadIds: team.teamLeadIds || []
      });
    } else if (mode === 'create' || !team) {
      setFormData({
        name: '',
        description: '',
        managerId: user?.role === 'manager' ? user.id : '',
        teamLeadIds: []
      });
    }
  }, [team, mode, isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const teamData: CreateTeamData = {
        name: formData.name,
        description: formData.description?.trim() || undefined,
        managerId: formData.managerId,
        teamLeadIds: formData.teamLeadIds.length > 0 ? formData.teamLeadIds : undefined
      };
      
      await onSave(teamData);
      onClose();
    } catch (error) {
      console.error('Error saving team:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create' ? 'Create New Team' : 'Edit Team'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Enter team name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Enter team description"
            />
          </div>

          {/* Only show manager selection if user is not a manager or if editing */}
          {!(user?.role === 'manager' && mode === 'create') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  disabled={loadingUsers}
                >
                  <option value="">Select a manager</option>
                  {availableManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
                <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              {loadingUsers && (
                <p className="text-xs text-gray-500 mt-1">Loading managers...</p>
              )}
            </div>
          )}

          {/* Show manager info when manager is creating team */}
          {user?.role === 'manager' && mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {user.name} ({user.email})
              </div>
              <p className="text-xs text-gray-500 mt-1">You will be assigned as the manager of this team</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Leads (Optional)
            </label>
            <div className="space-y-2">
              {availableTeamLeads.map((teamLead) => (
                <label key={teamLead.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.teamLeadIds.includes(teamLead.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          teamLeadIds: [...formData.teamLeadIds, teamLead.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          teamLeadIds: formData.teamLeadIds.filter(id => id !== teamLead.id)
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    disabled={loadingUsers}
                  />
                  <span className="text-sm text-gray-700">
                    {teamLead.name} ({teamLead.email})
                  </span>
                </label>
              ))}
              {availableTeamLeads.length === 0 && !loadingUsers && (
                <p className="text-sm text-gray-500">No team leads available</p>
              )}
              {loadingUsers && (
                <p className="text-xs text-gray-500">Loading team leads...</p>
              )}
            </div>
            {formData.teamLeadIds.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600">
                  Selected: {formData.teamLeadIds.length} team lead(s)
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingUsers}
              className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Create Team' : 'Update Team'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;
