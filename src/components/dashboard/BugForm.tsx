import React, { useState, useEffect } from 'react';
import { useBugs } from '../../context/BugContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useTeams } from '../../context/TeamContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import FileUpload from '../common/FileUpload';
import { getAllUsers } from '../../services/userService';
import type { Bug, BugStatus, BugPriority } from '../../types/bugs';
import type { UploadResult } from '../../services/cloudinaryService';
import type { AppUser } from '../../types/auth';

interface BugFormProps {
  isOpen: boolean;
  onClose: () => void;
  bug?: Bug | null;
  projectId?: string;
}

const BugForm: React.FC<BugFormProps> = ({ isOpen, onClose, bug, projectId }) => {
  const { addBug, updateBug } = useBugs();
  const { projects } = useProjects();
  const { user } = useAuth();
  const { teams } = useTeams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [teamMembers, setTeamMembers] = useState<AppUser[]>([]);

  // Role-based permissions
  const canCreateBug = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'team_lead';
  const canAssignBug = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'team_lead';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as BugPriority,
    status: 'new' as BugStatus,
    projectId: projectId || '',
    assignee: '',
    externalAssignee: '',
  });
  const [attachments, setAttachments] = useState<UploadResult[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Bug title is required');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Bug description is required');
      setLoading(false);
      return;
    }

    if (!formData.projectId) {
      setError('Please select a project');
      setLoading(false);
      return;
    }

    try {
      if (bug) {
        // Update existing bug
        await updateBug(bug.id, formData);
      } else {
        // Create new bug - handle assignee properly
        const bugData = {
          ...formData,
          reporter: user?.id || '',
          reporterName: user?.name || user?.email || '',
          userId: user?.id || '',
          userName: user?.name || user?.email || '',
          labels: [],
          attachments: attachments,
          comments: [],
          history: [],
        };

        // Only include assignee if it's not empty
        if (formData.assignee && formData.assignee.trim()) {
          bugData.assignee = formData.assignee.trim();
        }

        // Only include external assignee if it's not empty
        if (formData.externalAssignee && formData.externalAssignee.trim()) {
          bugData.externalAssignee = formData.externalAssignee.trim();
        }

        await addBug(bugData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bug');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: field === 'priority' ? value as BugPriority : 
               field === 'status' ? value as BugStatus : 
               value 
    }));
  };

  const handleFileUpload = (file: UploadResult) => {
    setAttachments(prev => [...prev, file]);
  };

  const handleFileRemove = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  // Load all users for external assignee selection
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

  // Update form data when bug prop changes (for edit mode)
  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title || '',
        description: bug.description || '',
        priority: bug.priority || 'medium' as BugPriority,
        status: bug.status || 'new' as BugStatus,
        projectId: bug.projectId || '',
        assignee: bug.assignee || '',
        externalAssignee: bug.externalAssignee || '',
      });
      setAttachments(bug.attachments || []);
    } else {
      // Reset form for new bug
      setFormData({
        title: '',
        description: '',
        priority: 'medium' as BugPriority,
        status: 'new' as BugStatus,
        projectId: projectId || '',
        assignee: '',
        externalAssignee: '',
      });
      setAttachments([]);
    }
  }, [bug, projectId]);

  // Load team members when project changes
  useEffect(() => {
    if (formData.projectId && user) {
      const selectedProject = projects.find(p => p.id === formData.projectId);
      
      if (selectedProject?.teamId) {
        const team = teams.find(t => t.id === selectedProject.teamId);
        
        if (team?.members) {
          const members = allUsers.filter(member => 
            team.members.includes(member.id) && member.role === 'team_member'
          );
          setTeamMembers(members);
        } else {
          setTeamMembers([]);
        }
      } else {
        setTeamMembers([]);
      }
    } else {
      setTeamMembers([]);
    }
  }, [formData.projectId, teams, allUsers, user, bug]);

  const selectedProject = projects.find(p => p.id === formData.projectId);

  // Check if user has permission to create/edit bugs
  if (!canCreateBug) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Access Denied"
        size="md"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-6">
            You don't have permission to create or edit bugs. Only admins, managers, and team leads can create bugs.
          </p>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bug ? 'Edit Bug' : 'Create New Bug'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Project Selection - Most Important */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.projectId}
            onChange={(e) => handleChange('projectId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bug Title */}
        <Input
          label="Bug Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter a clear, descriptive title for the bug"
          required
        />

        {/* Bug Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the bug in detail. Include steps to reproduce, expected behavior, and actual behavior..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={5}
            required
          />
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Assignee
              {!canAssignBug && (
                <span className="text-xs text-gray-500 ml-2">(Read-only - Only admins, managers, and team leads can assign)</span>
              )}
            </label>
            <select
              value={formData.assignee}
              onChange={(e) => handleChange('assignee', e.target.value)}
              disabled={!canAssignBug}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                !canAssignBug ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select team member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            {teamMembers.length === 0 && formData.projectId && (
              <p className="text-sm text-gray-500 mt-1">
                No team members available for this project
              </p>
            )}
          </div>
        </div>

        {/* External Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            External Assignee (Optional)
            {!canAssignBug && (
              <span className="text-xs text-gray-500 ml-2">(Read-only - Only admins, managers, and team leads can assign)</span>
            )}
          </label>
          <select
            value={formData.externalAssignee}
            onChange={(e) => handleChange('externalAssignee', e.target.value)}
            disabled={!canAssignBug}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              !canAssignBug ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select external team member</option>
            {allUsers.filter(u => u.role === 'team_member' && u.teamId !== selectedProject?.teamId).map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email}) - {user.teamId ? 'Team: ' + (teams.find(t => t.id === user.teamId)?.name || 'Unknown') : 'No Team'}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Assign to team members from other teams (not from the selected project's team)
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <FileUpload
              onUpload={handleFileUpload}
              onRemove={handleFileRemove}
              multiple={true}
              maxSize={10}
              acceptedTypes={['image/*', 'application/pdf', 'text/*']}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Upload screenshots, logs, or other files to help describe the bug (max 10MB per file)
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {bug ? 'Update Bug' : 'Create Bug'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BugForm; 