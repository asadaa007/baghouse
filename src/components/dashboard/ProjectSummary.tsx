import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Plus, Users, Bug, TrendingUp } from 'lucide-react';
import { Button } from '../common/buttons';
import type { Project } from '../../types/projects';

interface ProjectSummaryProps {
  projects: Project[];
  projectStats: Record<string, number>;
  loading?: boolean;
  onNewProject: () => void;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  projects,
  projectStats,
  loading = false,
  onNewProject
}) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalBugs = Object.values(projectStats).reduce((sum, count) => sum + count, 0);
  const totalMembers = projects.reduce((sum, project) => sum + (project.members?.length || 0), 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Project Summary</h3>
          <div className="w-24 h-8 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-12"></div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Project Summary</h3>
        <Button 
          onClick={onNewProject}
          variant="primary"
          size="sm"
          icon={Plus}
        >
          New Project
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
          <Folder className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <p className="text-2xl font-bold text-blue-600">{totalProjects}</p>
            <p className="text-xs text-blue-600">Total Projects</p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-green-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
            <p className="text-xs text-green-600">Active Projects</p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
          <Bug className="w-5 h-5 text-orange-600 mr-3" />
          <div>
            <p className="text-2xl font-bold text-orange-600">{totalBugs}</p>
            <p className="text-xs text-orange-600">Total Bugs</p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
          <Users className="w-5 h-5 text-purple-600 mr-3" />
          <div>
            <p className="text-2xl font-bold text-purple-600">{totalMembers}</p>
            <p className="text-xs text-purple-600">Team Members</p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Projects</h4>
        {projects.length === 0 ? (
          <div className="text-center py-6">
            <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">No projects yet</p>
            <Button 
              onClick={onNewProject}
              variant="ghost"
              size="sm"
              icon={Plus}
            >
              Create your first project
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                to={`/p/${project.slug}`}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </h5>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      {projectStats[project.id] || 0} bugs
                    </span>
                    <span className="text-xs text-gray-500">
                      {project.members?.length || 0} members
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            
            {projects.length > 3 && (
              <div className="text-center pt-3">
                <Link
                  to="/projects"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View all {projects.length} projects →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSummary; 