import React, { useState } from 'react';
import { useBugs } from '../../context/BugContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import FileUpload from '../common/FileUpload';
import type { Bug } from '../../types/bugs';
import type { UploadResult } from '../../services/cloudinaryService';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: bug?.title || '',
    description: bug?.description || '',
    priority: bug?.priority || 'medium',
    status: bug?.status || 'new',
    projectId: projectId || bug?.projectId || '',
    assignee: bug?.assignee || '',
  });
  const [attachments, setAttachments] = useState<UploadResult[]>(bug?.attachments || []);

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
          labels: [],
          attachments: attachments,
          comments: [],
        };

        // Only include assignee if it's not empty
        if (formData.assignee && formData.assignee.trim()) {
          bugData.assignee = formData.assignee.trim();
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: UploadResult) => {
    setAttachments(prev => [...prev, file]);
  };

  const handleFileRemove = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);

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
          {formData.projectId && selectedProject && (
            <p className="text-sm text-gray-500 mt-1">
              Project: {selectedProject.name} • {selectedProject.description}
            </p>
          )}
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
              Assignee
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => handleChange('assignee', e.target.value)}
              placeholder="Assign to team member"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
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