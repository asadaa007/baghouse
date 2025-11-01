import React, { useState, useEffect } from 'react';
import { useBugs } from '../../context/BugContext';
import { useTeams } from '../../context/TeamContext';
import { Button } from '../common/buttons';
import Input from '../common/Input';
import MarkdownEditor from '../common/MarkdownEditor';
import { getAllUsers } from '../../services/userService';
import type { Bug, BugStatus, BugPriority } from '../../types/bugs';
import type { AppUser } from '../../types/auth';

interface BugFormProps {
  bug?: Bug | null;
  onSubmit: (bugData: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  projects: any[];
  user: AppUser | null;
}

const BugForm: React.FC<BugFormProps> = ({ 
  bug, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  projects, 
  user 
}) => {
  const { addBug, updateBug } = useBugs();
  const { teams } = useTeams();
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [teamMembers, setTeamMembers] = useState<AppUser[]>([]);

  // Role-based permissions
  const canAssignBug = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'team_lead';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as BugPriority,
    status: 'new' as BugStatus,
    projectId: '',
    assignee: '',
    externalAssignee: '',
  });

  // Initialize form data
  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title || '',
        description: bug.description || '',
        priority: bug.priority || 'medium',
        status: bug.status || 'new',
        projectId: bug.projectId || '',
        assignee: bug.assignee || '',
        externalAssignee: bug.externalAssignee || '',
      });
    }
  }, [bug]);


  // Load team members
  useEffect(() => {
    if (formData.projectId) {
      const project = projects.find(p => p.id === formData.projectId);
      if (project && project.teamId) {
        const team = teams.find(t => t.id === project.teamId);
        if (team) {
          // Filter users to get only team members
          const teamUserIds = team.members || [];
          const teamUsers = allUsers.filter(user => teamUserIds.includes(user.id));
          setTeamMembers(teamUsers);
        }
      }
    }
  }, [formData.projectId, projects, teams, allUsers]);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.projectId) {
      setError('Project is required');
      return;
    }

    try {
      const bugData = {
        ...formData,
        reporter: user?.id || '',
        reporterName: user?.name || user?.email || '',
        userId: user?.id || '',
        userName: user?.name || user?.email || '',
        labels: [],
        attachments: [],
        comments: [],
        history: [],
      };

      if (bug) {
        // Update existing bug
        await updateBug(bug.id, bugData);
      } else {
        // Create new bug
        await addBug(bugData);
      }

      onSubmit(bugData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bug');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const availableProjects = projects.filter(p => 
    p.status !== 'on_hold' && p.status !== 'discontinued'
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter bug title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a project</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="new">ToDo</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {canAssignBug && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Assignee
                </label>
                <select
                  value={formData.assignee}
                  onChange={(e) => handleInputChange('assignee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Assignee
                </label>
                <Input
                  type="text"
                  value={formData.externalAssignee}
                  onChange={(e) => handleInputChange('externalAssignee', e.target.value)}
                  placeholder="External assignee name"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <MarkdownEditor
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe the bug in detail..."
          className="min-h-[300px]"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !formData.title.trim() || !formData.projectId}
        >
          {isSubmitting ? 'Saving...' : (bug ? 'Update Bug' : 'Create Bug')}
        </Button>
      </div>
    </form>
  );
};

export default BugForm;