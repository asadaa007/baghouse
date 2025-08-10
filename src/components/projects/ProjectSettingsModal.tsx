import React, { useEffect, useState } from 'react';
import type { Project } from '../../types/projects';
import { X, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (updates: Partial<Project>) => Promise<void>;
}

const ProjectSettingsModal: React.FC<Props> = ({ isOpen, project, onClose, onSave }) => {
  const [status, setStatus] = useState<Project['status']>('active');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setStatus(project.status);
      setReason(project.statusReason || '');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const requiresReason = status === 'on_hold' || status === 'discontinued';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ status, statusReason: requiresReason ? reason.trim() : null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Project['status'])}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_hold">On Hold</option>
              <option value="discontinued">Discontinued</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          {requiresReason && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={`Provide a reason for marking this project as ${status === 'on_hold' ? 'On Hold' : 'Discontinued'}`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              />
              <p className="mt-1 text-xs text-gray-500">This reason will be visible on the project card tooltip.</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="mr-2 inline-block h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;
