import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project } from '../types/projects';
import { projectService } from '../services/projectService';
import { bugService } from '../services/bugService';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  projectStats: Record<string, number>;
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState<Record<string, number>>({});
  const { user } = useAuth();

  const refreshProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Role-based visibility
      let visibleProjects: Project[] = [];
      if (user.role === 'super_admin' || user.role === 'manager') {
        // Admins and managers can see all projects
        visibleProjects = await projectService.getProjects();
      } else {
        // Team members see only projects they are assigned to (or own) and those assigned to their team
        visibleProjects = await projectService.getProjectsByUser(user.id, user.teamId);
      }
      setProjects(visibleProjects);

      // Get bug counts for each project
      const stats: Record<string, number> = {};
      for (const project of visibleProjects) {
        try {
          const bugs = await bugService.getBugsByProject(project.id);
          stats[project.id] = bugs.length;
        } catch (error) {
          stats[project.id] = 0;
        }
      }
      setProjectStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [user]);

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Only super admins and managers can create projects
      if (!user || (user.role !== 'super_admin' && user.role !== 'manager')) {
        throw new Error('You do not have permission to create projects');
      }
      
      // Add current user as owner and member
      const newProjectData = {
        ...projectData,
        owner: user.id,
        members: [{
          userId: user.id,
          role: 'owner' as const,
          joinedAt: new Date()
        }]
      };
      
      await projectService.createProject(newProjectData);
      await refreshProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      setLoading(true);
      setError(null);
      await projectService.updateProject(id, updates);
      await refreshProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await projectService.deleteProject(id);
      await refreshProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: ProjectContextType = {
    projects,
    loading,
    error,
    projectStats,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 