import React, { useState } from 'react';
import { useBugs } from '../../context/BugContext';
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: bug?.title || '',
    description: bug?.description || '',
    priority: bug?.priority || 'medium',
    status: bug?.status || 'new',
    projectId: projectId || bug?.projectId || '',
  });
  const [attachments, setAttachments] = useState<UploadResult[]>(bug?.attachments || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (bug) {
        // Update existing bug
        await updateBug(bug.id, formData);
      } else {
        // Create new bug
        await addBug({
          ...formData,
          reporter: user?.id || '',
          assignee: '',
          labels: [],
          attachments: attachments,
          comments: [],
        });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bug ? 'Edit Bug' : 'Create New Bug'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter bug title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the bug in detail..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
         </div>

         {/* File Upload */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Attachments
           </label>
           <FileUpload
             onUpload={handleFileUpload}
             onRemove={handleFileRemove}
             multiple={true}
             maxSize={10}
             acceptedTypes={['image/*', 'application/pdf', 'text/*']}
           />
         </div>
 
         <div className="flex justify-end space-x-3">
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