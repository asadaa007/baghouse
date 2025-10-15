import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useBugs } from '../context/BugContext';
import { useAuth } from '../context/AuthContext';
import { useTeams } from '../context/TeamContext';
import Navigation from '../components/layout/Navigation';
import BreadcrumbNew from '../components/common/BreadcrumbNew';
import Loading from '../components/common/Loading';
import { projectService } from '../services/projectService';
import { 
  ArrowLeft,
  Calendar,
  Bug,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  Target
} from 'lucide-react';
import { Button } from '../components/common/buttons';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import { getUserById } from '../services/userService';
import { getTeamById } from '../services/teamService';
import type { Project } from '../types/projects';

const ProjectPreview = () => {
  const { projectId, slug } = useParams<{ projectId?: string; slug?: string }>();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();
  const { bugs, loading: bugsLoading } = useBugs();
  const { user } = useAuth();
  const { teams } = useTeams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Role-based permissions
  const canManageProject = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'team_lead';
  const canCreateBug = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'team_lead';

  const [teamName, setTeamName] = useState<string>('Loading...');
  const [managerName, setManagerName] = useState<string>('-');
  const [teamLeadName, setTeamLeadName] = useState<string>('-');
  const [memberDetails, setMemberDetails] = useState<Record<string, { name: string; role: string }>>({});

  // Find project by ID or slug
  useEffect(() => {
    const findProject = async () => {
      setLoading(true);
      try {
        let foundProject = null;
        
        if (projectId) {
          // Try to find by ID first
          foundProject = projects.find(p => p.id === projectId);
          if (!foundProject) {
            // If not found in context, try to fetch from service
            foundProject = await projectService.getProjectById(projectId);
          }
        } else if (slug) {
          // Try to find by slug
          foundProject = projects.find(p => p.slug === slug);
          if (!foundProject) {
            // If not found in context, try to fetch from service
            foundProject = await projectService.getProjectBySlug(slug);
          }
        }
        
        setProject(foundProject);
      } catch (error) {
        console.error('Error finding project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (projects.length > 0 || projectId || slug) {
      findProject();
    }
  }, [projectId, slug, projects]);

  // Filter bugs for this project
  const projectBugs = bugs.filter(bug => bug.projectId === project?.id);

  // Calculate bug statistics
  const bugStats = useMemo(() => {
    const total = projectBugs.length;
    const open = projectBugs.filter(bug => ['new', 'in-progress', 'review'].includes(bug.status)).length;
    const resolved = projectBugs.filter(bug => ['resolved', 'closed'].includes(bug.status)).length;
    const critical = projectBugs.filter(bug => bug.priority === 'critical').length;
    const progressPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return { total, open, resolved, critical, progressPercentage };
  }, [projectBugs]);

  // Load team and member details
  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!project) return;

      try {
        // Load team details
        if (project.teamId) {
          const team = teams.find(t => t.id === project.teamId) || await getTeamById(project.teamId);
          if (team) {
            setTeamName(team.name);

            // Load manager
            if (team.managerId) {
              const manager = await getUserById(team.managerId);
              setManagerName(manager?.name || '-');
            }

            // Load team lead
            if (team.teamLeadId) {
              const teamLead = await getUserById(team.teamLeadId);
              setTeamLeadName(teamLead?.name || '-');
            }

            // Load member details
            if (team.members && team.members.length > 0) {
              const memberPromises = team.members.map(async (memberId) => {
                const member = await getUserById(memberId);
                return { [memberId]: { name: member?.name || 'Unknown', role: 'team_member' } };
              });
              const memberResults = await Promise.all(memberPromises);
              const memberDetailsObj = Object.assign({}, ...memberResults);
              setMemberDetails(memberDetailsObj);
            }
          }
        } else {
          setTeamName('No Team Assigned');
        }
      } catch (error) {
        console.error('Error loading project details:', error);
      }
    };

    loadProjectDetails();
  }, [project, teams]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      case 'complete':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading || projectsLoading || bugsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading project details..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <BreadcrumbNew 
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project.name }
          ]}
          showBackButton={false}
        />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              {project.shortDescription && (
                <p className="text-lg text-gray-600 mb-6">{project.shortDescription}</p>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Created on {project.createdAt.toLocaleDateString()}
                {project.updatedAt && (
                  <>
                    <span className="mx-2">•</span>
                    Last updated {project.updatedAt.toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate(`/bugs?project=${project.slug}`)}
                variant="outline"
                icon={Bug}
              >
                View Bugs
              </Button>
              {canCreateBug && (
                <Button
                  onClick={() => navigate(`/p/${project.slug}?newBug=1`)}
                  variant="primary"
                  icon={Plus}
                >
                  Create Bug
                </Button>
              )}
              {canManageProject && (
                <Button
                  onClick={() => navigate(`/p/${project.slug}/edit`)}
                  variant="secondary"
                  icon={Edit}
                >
                  Edit Project
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bug className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bugs</p>
                <p className="text-2xl font-bold text-gray-900">{bugStats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Bugs</p>
                <p className="text-2xl font-bold text-gray-900">{bugStats.open}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{bugStats.resolved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">{bugStats.critical}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Bug Resolution Progress</span>
            <span>{bugStats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${bugStats.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Team Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Assigned Team</label>
                  <p className="text-gray-900">{teamName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Manager</label>
                  <p className="text-gray-900">{managerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Team Lead</label>
                  <p className="text-gray-900">{teamLeadName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Team Members</label>
                  <p className="text-gray-900">{Object.keys(memberDetails).length}</p>
                </div>
              </div>
            </div>

            {/* Project Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                {(project.status === 'discontinued' || project.status === 'on_hold') && project.statusReason && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Status Reason</span>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                      {project.statusReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Public Access</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${project.settings.allowPublicAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {project.settings.allowPublicAccess ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Require Approval</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${project.settings.requireApproval ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {project.settings.requireApproval ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto Assign</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${project.settings.autoAssign ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {project.settings.autoAssign ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Content - Project Details and Description */}
          <div className="lg:col-span-3">
            {/* Project Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
              <MarkdownRenderer content={project.description} />
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
              
              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600">Project information and configuration details.</p>
                  </div>
                </div>
              </div>

              {/* Project Timeline */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Project Timeline</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-blue-800">Start Date</label>
                      <p className="text-blue-900 mt-1">January 15, 2024</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-green-800">Expected End</label>
                      <p className="text-green-900 mt-1">March 30, 2024</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-purple-800">Duration</label>
                      <p className="text-purple-900 mt-1">2.5 months</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Scope */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Project Scope</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Objectives</label>
                    <ul className="text-gray-900 mt-1 list-disc list-inside space-y-1">
                      <li>Develop a comprehensive bug tracking system</li>
                      <li>Implement role-based access control</li>
                      <li>Create intuitive user interface for all user types</li>
                      <li>Ensure real-time collaboration features</li>
                    </ul>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Key Features</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Bug Management</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Team Collaboration</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Project Tracking</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">User Management</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Reporting</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Notifications</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Technical Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Technology Stack</label>
                    <div className="mt-2 space-y-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">React</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">TypeScript</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">Firebase</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">Tailwind CSS</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Development Environment</label>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-900 text-sm">• Node.js v18+</p>
                      <p className="text-gray-900 text-sm">• Vite Build Tool</p>
                      <p className="text-gray-900 text-sm">• Firebase Hosting</p>
                      <p className="text-gray-900 text-sm">• Git Version Control</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;
