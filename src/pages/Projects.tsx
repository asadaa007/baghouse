import{ useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search,Grid, List, RefreshCw } from 'lucide-react';
import { Button, IconButton } from '../components/common/buttons';
import { useProjects } from '../context/ProjectContext';
import { useBugs } from '../context/BugContext';
import type { Project } from '../types/projects';
import Navigation from '../components/layout/Navigation';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectSettingsModal from '../components/projects/ProjectSettingsModal';
import TeamModal from '../components/projects/TeamModal';
import BreadcrumbNew from '../components/common/BreadcrumbNew';
import { useAuth } from '../context/AuthContext';
import { useTeams } from '../context/TeamContext';
import { updateTeam } from '../services/teamService';

const Projects = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    loading, 
    error, 
    projectStats, 
    updateProject, 
    deleteProject, 
    refreshProjects} = useProjects();
  const { bugs } = useBugs();
  const { user } = useAuth();
  const { teams } = useTeams();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [status, setStatus] = useState<'all' | Project['status']>('all');
  const [team, setTeam] = useState<string>('');
  const [assignedOnly, setAssignedOnly] = useState<boolean>(false);
  


  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsProject, setSettingsProject] = useState<Project | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamModalMode] = useState<'create' | 'edit'>('edit');

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
    navigate('/projects/add');
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




  const handleSettingsClose = () => {
    setSettingsOpen(false);
    setSettingsProject(null);
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
      // Treat new, in-progress, and review as open
      open: projectBugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress' || bug.status === 'review').length,
      // Treat resolved and closed as resolved/completed
      resolved: projectBugs.filter(bug => bug.status === 'resolved' || bug.status === 'closed').length,
      critical: projectBugs.filter(bug => bug.priority === 'critical').length};
  };

  const filteredProjects = projects
    .filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Breadcrumb */}
        <BreadcrumbNew items={[{ label: 'Projects' }]} showBackButton={false} />
        
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {projects.length}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <IconButton
                onClick={() => setViewMode('grid')}
                icon={Grid}
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                title="Grid View"
              />
              <IconButton
                onClick={() => setViewMode('list')}
                icon={List}
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                title="List View"
              />
            </div>
            {canCreateProjects && (
              <Button 
                onClick={handleCreateProject} 
                icon={Plus}
                variant="primary"
              >
                New Project
              </Button>
            )}
          </div>
        </div>
        
        {/* Stats ands */}
        <div className="mb-8">

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

              {user?.role === 'team_member' && (
                <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer select-none text-sm">
                  <input
                    type="checkbox"
                    checked={assignedOnly}
                    onChange={(e) => setAssignedOnly(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Assigned to me
                </label>
              )}

              <Button
                onClick={resets}
                variant="outline"
                icon={RefreshCw}
                size="sm"
              >
                Reset
              </Button>
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
              <Button 
                onClick={handleCreateProject} 
                icon={Plus}
                variant="primary"
                size="lg"
              >
                Create Your First Project
              </Button>
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
                onDelete={handleDeleteProject}
                onSettings={handleOpenSettings}
              />
            ))}
          </div>
        )}
      </div>


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