import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useTeams } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/layout/Navigation';
import BreadcrumbNew from '../components/common/BreadcrumbNew';
import Loading from '../components/common/Loading';
import { 
  ArrowLeft,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/common/buttons';
import MarkdownEditor from '../components/common/MarkdownEditor';
import type { Project, ProjectSettings } from '../types/projects';

const ProjectEdit = () => {
  const { projectId, slug } = useParams<{ projectId?: string; slug?: string }>();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  const { teams } = useTeams();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    status: 'active' as Project['status'],
    teamId: '' as string | undefined,
    settings: {
      allowPublicAccess: false,
      requireApproval: false,
      autoAssign: false,
      customFields: []
    } as ProjectSettings
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTeams, setAvailableTeams] = useState(teams);

  // Role-based permissions
  const canEditProjects = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'team_lead';

  // Find project by ID or slug
  useEffect(() => {
    const findProject = () => {
      let foundProject = null;
      
      if (projectId) {
        foundProject = projects.find(p => p.id === projectId);
      } else if (slug) {
        foundProject = projects.find(p => p.slug === slug);
      }
      
      if (foundProject) {
        setProject(foundProject);
        setFormData({
          name: foundProject.name,
          shortDescription: foundProject.shortDescription || '',
          description: foundProject.description,
          status: foundProject.status,
          teamId: foundProject.teamId || '',
          settings: foundProject.settings
        });
      }
      
      setLoading(false);
    };

    if (projects.length > 0 || projectId || slug) {
      findProject();
    }
  }, [projectId, slug, projects]);

  useEffect(() => {
    setAvailableTeams(teams);
  }, [teams]);

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditProjects || !project) {
      setError('You do not have permission to edit this project');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const projectData = {
        ...formData,
        settings: formData.settings
      };

      await updateProject(project.id, projectData);
      navigate(`/projects/${project.id}/preview`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loading size="lg" text="Loading project details..." />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
            <Button
              onClick={() => navigate('/projects')}
              variant="primary"
              icon={ArrowLeft}
            >
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!canEditProjects) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to edit this project.</p>
            <Button
              onClick={() => navigate(`/projects/${project.id}/preview`)}
              variant="primary"
              icon={ArrowLeft}
            >
              Back to Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <BreadcrumbNew
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project.name, href: `/p/${project.slug}/preview` },
            { label: 'Edit' }
          ]}
          showBackButton={false}
        />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
                <p className="text-gray-600 mt-1">Update project details and settings</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate(`/projects/${project.id}/preview`)}
                  variant="outline"
                  icon={X}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name.trim()}
                  variant="primary"
                  icon={Save}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-6">
            {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription || ''}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  placeholder="Brief description of the project"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <MarkdownEditor
                  value={formData.description}
                  onChange={(value) => handleChange('description', value)}
                  placeholder="Describe the project goals and objectives"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_hold">On Hold</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="complete">Complete</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Team
                </label>
                <select
                  value={formData.teamId || ''}
                  onChange={(e) => handleChange('teamId', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="">Select a team</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default ProjectEdit;
