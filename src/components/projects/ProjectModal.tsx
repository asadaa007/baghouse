import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { Project, ProjectSettings, CustomField } from '../../types/projects';
import { useTeams } from '../../context/TeamContext';
import * as teamService from '../../services/teamService';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  project?: Project;
  mode: 'create' | 'edit';
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  mode
}) => {
  const { teams, loading: teamsLoading, getAllTeams } = useTeams();
  const [availableTeams, setAvailableTeams] = useState(teams);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as const,
    teamId: '' as string | undefined,
    settings: {
      allowPublicAccess: false,
      requireApproval: false,
      autoAssign: false,
      defaultAssignee: '',
      customFields: [] as CustomField[]
    } as ProjectSettings
  });
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Keep local teams in sync with context teams
  useEffect(() => {
    setAvailableTeams(teams);
  }, [teams]);

  useEffect(() => {
    if (!isOpen) return;
    // Ensure teams are fresh when modal opens
    (async () => {
      try {
        setLoadingTeams(true);
        await getAllTeams();
        // If still empty after role-based load, fallback to all teams
        if (!teams || teams.length === 0) {
          const all = await teamService.getAllTeams();
          setAvailableTeams(all);
        }
      } catch {
        // ignore
      } finally {
        setLoadingTeams(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (project && mode === 'edit') {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status as any,
        teamId: project.teamId,
        settings: project.settings
      });
      setCustomFields(project.settings.customFields || []);
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active' as const,
        teamId: '',
        settings: {
          allowPublicAccess: false,
          requireApproval: false,
          autoAssign: false,
          defaultAssignee: '',
          customFields: []
        }
      });
      setCustomFields([]);
    }
  }, [project, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const projectData = {
        ...formData,
        owner: project?.owner || '', // Will be set by the service
        members: project?.members || [], // Will be set by the service
        teamId: formData.teamId || undefined,
        settings: {
          ...formData.settings,
          customFields
        }
      } as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
      
      await onSave(projectData);
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false
    };
    setCustomFields([...customFields, newField]);
  };

  const updateCustomField = (index: number, field: CustomField) => {
    const updated = [...customFields];
    updated[index] = field;
    setCustomFields(updated);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Team (optional)
              </label>
              <select
                value={formData.teamId || ''}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value || '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={teamsLoading || loadingTeams}
              >
                <option value="">{teamsLoading || loadingTeams ? 'Loading teams...' : 'No Team'}</option>
                {!teamsLoading && !loadingTeams && availableTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Project Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.allowPublicAccess}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, allowPublicAccess: e.target.checked }
                  })}
                  className="mr-3 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Allow public access</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.requireApproval}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, requireApproval: e.target.checked }
                  })}
                  className="mr-3 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Require approval for new bugs</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.autoAssign}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, autoAssign: e.target.checked }
                  })}
                  className="mr-3 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Auto-assign bugs to default assignee</span>
              </label>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
              <button
                type="button"
                onClick={addCustomField}
                className="flex items-center text-sm text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </button>
            </div>

            {customFields.length === 0 && (
              <p className="text-sm text-gray-500">No custom fields added yet.</p>
            )}

            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateCustomField(index, { ...field, name: e.target.value })}
                    placeholder="Field name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateCustomField(index, { ...field, type: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateCustomField(index, { ...field, required: e.target.checked })}
                      className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal; 