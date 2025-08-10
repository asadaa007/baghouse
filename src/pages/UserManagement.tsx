import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTeams } from '../context/TeamContext';
import Navigation from '../components/layout/Navigation';
import type { UserRole } from '../types/auth';
import { createUser, getAllUsers, deleteUser, updateUser, sendPasswordResetToUser, type CreateUserData, getUserById } from '../services/userService';
import { getTeamById } from '../services/teamService';
import TeamModal from '../components/projects/TeamModal';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus,
  Users,
  Shield,
  User,
  Mail,
  Crown,
  UserCheck
} from 'lucide-react';

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const { teams, createTeam, getAllTeams } = useTeams();
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamModalMode, setTeamModalMode] = useState<'create' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});

  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'team_member',
    teamId: ''
  });

  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadUsers();
    loadTeams();
  }, [user]);

  // Ensure teams are loaded when component mounts
  useEffect(() => {
    if (user?.role === 'manager' && teams.length === 0) {
      loadTeams();
    }
  }, [user, teams.length]);

  useEffect(() => {
    if (teams && teams.length > 0) {
      setTeamNames(prev => {
        const updated = { ...prev };
        teams.forEach(t => { updated[t.id] = t.name; });
        return updated;
      });
    }
  }, [teams]);

  const ensureTeamNames = async (userList: UserItem[]) => {
    const ids = Array.from(new Set(userList.map(u => u.teamId).filter((id: string | null | undefined): id is string => !!id)));
    const known = new Set(Object.keys(teamNames));
    const contextKnown = new Set(teams.map(t => t.id));
    const toFetch = ids.filter(id => !known.has(id) && !contextKnown.has(id));
    if (toFetch.length === 0) return;
    const results = await Promise.all(toFetch.map(async id => {
      try { const team = await getTeamById(id); return { id, name: team?.name || 'Unknown Team' }; } catch { return { id, name: 'Unknown Team' }; }
    }));
    setTeamNames(prev => { const next = { ...prev }; results.forEach(({ id, name }) => { next[id] = name; }); return next; });
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      let usersData: UserItem[] = [];
      if (user?.role === 'super_admin') {
        usersData = await getAllUsers();
      } else if (user?.role === 'manager') {
        // Get users created by this manager
        const createdUsers = await getAllUsers({ createdBy: user.id });
        
        // Get the manager's own record
        const selfRecord = await getUserById(user.id);
        
        // Get all users assigned to teams managed by this manager
        const managedTeamIds = teams.map(team => team.id);
        
        // Get all users and filter by team
        const allUsersFromDB = await getAllUsers();
        
        const teamRelatedUsers = allUsersFromDB.filter((userItem: UserItem) => {
          const isInManagedTeam = managedTeamIds.includes(userItem.teamId || '');
          const isNotSelf = userItem.id !== user.id;
          return isInManagedTeam && isNotSelf;
        });
        
        // Combine all users, removing duplicates
        const allUsers = [...createdUsers];
        if (selfRecord && !allUsers.find(u => u.id === selfRecord.id)) {
          const userItem: UserItem = {
            ...selfRecord,
            createdAt: selfRecord.createdAt || new Date(),
            updatedAt: selfRecord.updatedAt || new Date()
          };
          allUsers.unshift(userItem);
        }
        
        // Add team-related users that weren't created by this manager
        teamRelatedUsers.forEach(teamUser => {
          if (!allUsers.find(u => u.id === teamUser.id)) {
            const userItem: UserItem = {
              ...teamUser,
              createdAt: teamUser.createdAt || new Date(),
              updatedAt: teamUser.updatedAt || new Date()
            };
            allUsers.push(userItem);
          }
        });
        
        usersData = allUsers;
      } else {
        usersData = [];
      }
      
      await ensureTeamNames(usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => { try { await getAllTeams(); } catch (e) { console.error('Error loading teams:', e); } };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      if (userFormData.role === 'team_lead' && !userFormData.teamId) {
        alert('Please select a team for the Team Lead role.');
        return;
      }
      const userData: CreateUserData = {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        teamId: userFormData.role === 'super_admin' ? undefined : (userFormData.teamId || undefined),
        createdBy: user.id
      };
      await createUser(userData);
      setShowCreateUserModal(false);
      setUserFormData({ name: '', email: '', role: 'team_member', teamId: '' });
      setSuccessMessage(`User "${userFormData.name}" created successfully! They will need to use "Forgot Password" to set up their account.`);
      await loadUsers();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userItem: UserItem) => {
    if (userItem.id === user?.id) { alert('You cannot edit your own account from this page. Please use the Settings page.'); return; }
    setEditingUser(userItem);
    setUserFormData({ name: userItem.name, email: userItem.email, role: userItem.role, teamId: userItem.teamId || '' });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user || !editingUser) throw new Error('User not authenticated');
      if (userFormData.role === 'team_lead' && !userFormData.teamId) {
        alert('Please select a team for the Team Lead role.');
        return;
      }
      const updateData = {
        name: userFormData.name,
        role: userFormData.role,
        teamId: userFormData.role === 'super_admin' ? undefined : (userFormData.teamId || undefined),
        updatedBy: user.id
      };
      await updateUser(editingUser.id, updateData);
      setShowEditUserModal(false);
      setEditingUser(null);
      setUserFormData({ name: '', email: '', role: 'team_member', teamId: '' });
      setSuccessMessage(`User "${userFormData.name}" updated successfully!`);
      await loadUsers();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) { alert('You cannot delete your own account.'); return; }
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setLoading(true);
    try { 
      await deleteUser(userId); 
      setSuccessMessage('User deleted successfully!'); 
      await loadUsers(); 
      setTimeout(() => setSuccessMessage(''), 5000); 
    } catch (error: unknown) { 
      console.error('Error deleting user:', error); 
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      alert(errorMessage); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try { 
      if (!user) throw new Error('User not authenticated'); 
      const teamData = { ...teamFormData, managerId: user.id }; 
      await createTeam(teamData); 
      setShowCreateTeamModal(false); 
      setTeamFormData({ name: '', description: '' }); 
      await loadTeams(); 
    } catch (error: unknown) { 
      console.error('Error creating team:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleOpenTeamModal = () => {
    setSelectedTeam(null);
    setTeamModalMode('create');
    setTeamModalOpen(true);
  };

  const handleSaveTeam = async (teamData: any) => {
    try {
      if (teamModalMode === 'create') {
        await createTeam(teamData);
        setSuccessMessage(`Team "${teamData.name}" created successfully!`);
      }
      setTeamModalOpen(false);
      setSelectedTeam(null);
      await loadTeams();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Failed to save team');
    }
  };

  const handleSendPasswordReset = async (userEmail: string, userName: string) => {
    if (!confirm(`Send password reset email to ${userName}?`)) return;
    setLoading(true);
    try { 
      await sendPasswordResetToUser(userEmail); 
      setSuccessMessage(`Password reset email sent to ${userName} successfully!`); 
      setTimeout(() => setSuccessMessage(''), 5000); 
    } catch (error: unknown) { 
      console.error('Error sending password reset:', error); 
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email';
      alert(errorMessage); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Group users by role
  const usersByRole = {
    super_admin: filteredUsers.filter(u => u.role === 'super_admin'),
    manager: filteredUsers.filter(u => u.role === 'manager'),
    team_lead: filteredUsers.filter(u => u.role === 'team_lead'),
    team_member: filteredUsers.filter(u => u.role === 'team_member')
  };

  const canCreateUsers = user?.role === 'super_admin' || user?.role === 'manager';
  const canCreateTeams = user?.role === 'super_admin';
  const canAccessUserManagement = user?.role === 'super_admin' || user?.role === 'manager';

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-4 h-4" />;
      case 'manager': return <Shield className="w-4 h-4" />;
      case 'team_lead': return <UserCheck className="w-4 h-4" />;
      case 'team_member': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'team_lead': return 'bg-green-100 text-green-800 border-green-200';
      case 'team_member': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'manager': return 'Manager';
      case 'team_lead': return 'Team Lead';
      case 'team_member': return 'Team Member';
      default: return role;
    }
  };

  if (!canAccessUserManagement) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access user management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">
            {user?.role === 'super_admin' 
              ? 'Manage users and teams across the organization' 
              : 'Manage your team members and view team-related users'
            }
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}



        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admins</option>
                  <option value="manager">Managers</option>
                  <option value="team_lead">Team Leads</option>
                  <option value="team_member">Team Members</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canCreateUsers && (
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add User
                </button>
              )}
              {canCreateTeams && (
                <button
                  onClick={handleOpenTeamModal}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Create Team
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users by Role Sections */}
        <div className="space-y-8">
          {/* Super Admins Section */}
          {usersByRole.super_admin.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-purple-900">Super Admins</h2>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {usersByRole.super_admin.length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersByRole.super_admin.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-purple-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(userItem.role)}`}>
                                  {getRoleIcon(userItem.role)}
                                  <span className="ml-1">{getRoleLabel(userItem.role)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.createdAt?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSendPasswordReset(userItem.email, userItem.name)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Send Password Reset"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(userItem)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Managers Section */}
          {usersByRole.manager.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-blue-900">Managers</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {usersByRole.manager.length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersByRole.manager.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(userItem.role)}`}>
                                  {getRoleIcon(userItem.role)}
                                  <span className="ml-1">{getRoleLabel(userItem.role)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.teamId ? teamNames[userItem.teamId] || 'Unknown Team' : 'No Team'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.createdAt?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSendPasswordReset(userItem.email, userItem.name)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Send Password Reset"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(userItem)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Team Leads Section */}
          {usersByRole.team_lead.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-green-900">Team Leads</h2>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {usersByRole.team_lead.length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersByRole.team_lead.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(userItem.role)}`}>
                                  {getRoleIcon(userItem.role)}
                                  <span className="ml-1">{getRoleLabel(userItem.role)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.teamId ? teamNames[userItem.teamId] || 'Unknown Team' : 'No Team'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.createdAt?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSendPasswordReset(userItem.email, userItem.name)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Send Password Reset"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(userItem)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Team Members Section */}
          {usersByRole.team_member.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {usersByRole.team_member.length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersByRole.team_member.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(userItem.role)}`}>
                                  {getRoleIcon(userItem.role)}
                                  <span className="ml-1">{getRoleLabel(userItem.role)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.teamId ? teamNames[userItem.teamId] || 'Unknown Team' : 'No Team'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.createdAt?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSendPasswordReset(userItem.email, userItem.name)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Send Password Reset"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(userItem)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new user.'
                }
              </p>
              {canCreateUsers && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="btn-primary"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" required value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" required value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                    <p className="text-xs text-gray-500 mt-1">User will need to use "Forgot Password" to set up their account</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setUserFormData({ ...userFormData, role: newRole, teamId: newRole === 'super_admin' ? '' : userFormData.teamId });
                      }}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      {user?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                      {user?.role === 'super_admin' && <option value="manager">Manager</option>}
                      {(user?.role === 'super_admin' || user?.role === 'manager') && <option value="team_lead">Team Lead</option>}
                      <option value="team_member">Team Member</option>
                    </select>
                  </div>
                  {teams.length > 0 && userFormData.role !== 'super_admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Team {userFormData.role === 'team_lead' ? '(Required)' : '(Optional)'}</label>
                      <select value={userFormData.teamId} onChange={(e) => setUserFormData({ ...userFormData, teamId: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                        <option value="">No Team</option>
                        {teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setShowCreateUserModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">{loading ? 'Creating...' : 'Create User'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" required value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" required value={userFormData.email} disabled className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setUserFormData({ ...userFormData, role: newRole, teamId: newRole === 'super_admin' ? '' : userFormData.teamId });
                      }}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      {user?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                      {user?.role === 'super_admin' && <option value="manager">Manager</option>}
                      {(user?.role === 'super_admin' || user?.role === 'manager') && <option value="team_lead">Team Lead</option>}
                      <option value="team_member">Team Member</option>
                    </select>
                  </div>
                  {teams.length > 0 && userFormData.role !== 'super_admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Team {userFormData.role === 'team_lead' ? '(Required)' : '(Optional)'}</label>
                      <select value={userFormData.teamId} onChange={(e) => setUserFormData({ ...userFormData, teamId: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                        <option value="">No Team</option>
                        {teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => { setShowEditUserModal(false); setEditingUser(null); setUserFormData({ name: '', email: '', role: 'team_member', teamId: '' }); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">{loading ? 'Updating...' : 'Update User'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Team</h3>
              <form onSubmit={handleCreateTeam}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Name</label>
                    <input type="text" required value={teamFormData.name} onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={teamFormData.description} onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setShowCreateTeamModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">{loading ? 'Creating...' : 'Create Team'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default UserManagement;
