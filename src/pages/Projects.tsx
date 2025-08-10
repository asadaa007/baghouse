import{ useState } from 'react';
import { Plus, Search,Grid, List, RotateCcw } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useBugs } from '../context/BugContext';
import type { Project } from '../types/projects';
import Navigation from '../components/layout/Navigation';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import ProjectSettingsModal from '../components/projects/ProjectSettingsModal';
import TeamModal from '../components/projects/TeamModal';
import Breadcrumb from '../components/common/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import { useTeams } from '../context/TeamContext';
import { getTeamById, updateTeam } from '../services/teamService';

const Projects = () => {
  const { 
    projects, 
    loading, 
    error, 
    projectStats, 
    createProject, 
    updateProject, 
    deleteProject, 
    refreshProjects} = useProjects();
  const { bugs } = useBugs();
  const { user } = useAuth();
  const { teams } = useTeams();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const [status, setStatus] = useState<'all' | Project['status']>('all');
  const [team, setTeam] = useState<string>('');
  const [assignedOnly, setAssignedOnly] = useState<boolean>(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsProject, setSettingsProject] = useState<Project | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamModalMode, setTeamModalMode] = useState<'create' | 'edit'>('edit');

  const canCreateProjects = user?.role === 'super_admin' || user?.role === 'manager';

  const canOpenSettings = (project: Project) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'manager') return true;
    return project.members?.some(m => m.userId === user.id && m.role === 'team_lead');
  };

  const handleOpenSettings = (project: Project) => {
    if (!canOpenSettings(project)) {
      alert('You do not have permission to change this project settings');
      return;
    }
    setSettingsProject(project);
    setSettingsOpen(true);
  };

  const handleSaveSettings = async (updates: Partial<Project>) => {
    if (!settingsProject) return;
    await updateProject(settingsProject.id, updates);
    await refreshProjects();
  };

  const handleCreateProject = () => {
    setModalMode('create');
    setSelectedProject(undefined);
    setShowModal(true);
  };

  const handleEditProject = (project: Project) => {
    setModalMode('edit');
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (modalMode === 'create') {
        await createProject(projectData);
      } else if (selectedProject) {
        await updateProject(selectedProject.id, projectData);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };



  const handleSettingsClose = () => {
    setSettingsOpen(false);
    setSettingsProject(null);
  };

  const handleEditTeam = async (teamId: string) => {
    try {
      const team = await getTeamById(teamId);
      if (team) {
        setSelectedTeam(team);
        setTeamModalMode('edit');
        setTeamModalOpen(true);
      }
    } catch (error) {
      console.error('Error loading team:', error);
      alert('Failed to load team details');
    }
  };

  const handleSaveTeam = async (teamData: any) => {
    try {
      if (teamModalMode === 'edit' && selectedTeam) {
        await updateTeam(selectedTeam.id, teamData);
      }
      setTeamModalOpen(false);
      setSelectedTeam(null);
      // Refresh projects to update team information
      await refreshProjects();
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Failed to save team');
    }
  };

  const handleSettingsSave = async (updates: Partial<Project>) => {
    await handleSaveSettings(updates);
    handleSettingsClose();
  };



  const resets = () => {
    setSearchTerm('');
    setStatus('all');
    setTeam('');
    setAssignedOnly(false);
  };

  const getProjectBugStats = (projectId: string) => {
    const projectBugs = bugs.filter(bug => bug.projectId === projectId);
    return {
      total: projectBugs.length,
      open: projectBugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress').length,
      resolved: projectBugs.filter(bug => bug.status === 'resolved').length,
      critical: projectBugs.filter(bug => bug.priority === 'critical').length};
  };

  const filteredProjects = projects
    .filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(project => (status=== 'all' ? true : project.status === status))
    .filter(project => (team ? project.teamId === team : true))
    .filter(project => (
      assignedOnly
        ? (project.owner === user?.id || project.members?.some(m => m.userId === user?.id))
        : true
    ));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage your projects and teams</p>
          </div>
          {canCreateProjects && (
            <button onClick={handleCreateProject} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          )}
        </div>

        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Projects' }]} showBackButton={true} />
        
        {/* Stats ands */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {projects.length} Project{projects.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-gray-600">Manage your projects and team members</p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search ands */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white min-w-[160px] focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_hold">On Hold</option>
                <option value="discontinued">Discontinued</option>
                <option value="complete">Complete</option>
              </select>

              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Teams</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer select-none text-sm">
                <input
                  type="checkbox"
                  checked={assignedOnly}
                  onChange={(e) => setAssignedOnly(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Assigned to me
              </label>

              <button
                type="button"
                onClick={resets}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || status !== 'all' || team || assignedOnly ? 'No projects match your filters' : 'No projects yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || status !== 'all' || team || assignedOnly
                ? 'Try adjusting your filters'
                : 'Get started by creating your first project'}
            </p>
            {!searchTerm && !status && !team && !assignedOnly && canCreateProjects && (
              <button onClick={handleCreateProject} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'
            : 'space-y-4'
          }>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                bugCount={projectStats[project.id] || 0}
                bugStats={getProjectBugStats(project.id)}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onSettings={handleOpenSettings}
                onEditTeam={handleEditTeam}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProject}
        project={selectedProject}
        mode={modalMode}
      />

      <ProjectSettingsModal
        isOpen={settingsOpen}
        project={settingsProject}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
      />

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
  );
};

export default Projects; 