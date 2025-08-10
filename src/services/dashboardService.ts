import { bugService } from './bugService';
import { projectService } from './projectService';
import type { Bug } from '../types/bugs';


export interface DashboardStats {
  totalBugs: number;
  openBugs: number;
  resolvedBugs: number;
  closedBugs: number;
  criticalBugs: number;
  totalProjects: number;
  activeProjects: number;
  totalMembers: number;
  bugsThisWeek: number;
  bugsLastWeek: number;
  resolutionRate: number;
  avgResolutionTime: number;
}

export interface ActivityItem {
  id: string;
  type: 'bug_created' | 'bug_updated' | 'bug_resolved' | 'comment_added' | 'user_joined' | 'project_created';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  projectId?: string;
  projectName?: string;
  bugId?: string;
  bugTitle?: string;
}

export interface ProjectStats {
  [projectId: string]: number;
}

export const dashboardService = {
  // Get comprehensive dashboard statistics
  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    try {
      const [bugs, projects] = await Promise.all([
        bugService.getBugs(userId),
        projectService.getProjectsByUser(userId || '')
      ]);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const bugsThisWeek = bugs.filter(bug => bug.createdAt >= oneWeekAgo).length;
      const bugsLastWeek = bugs.filter(bug => 
        bug.createdAt >= twoWeeksAgo && bug.createdAt < oneWeekAgo
      ).length;

      const resolvedBugs = bugs.filter(bug => bug.status === 'resolved');
      const resolutionRate = bugs.length > 0 ? (resolvedBugs.length / bugs.length) * 100 : 0;

      // Calculate average resolution time
      const resolvedBugsWithTime = resolvedBugs.filter(bug => bug.resolvedAt);
      const avgResolutionTime = resolvedBugsWithTime.length > 0 
        ? resolvedBugsWithTime.reduce((sum, bug) => {
            const resolutionTime = bug.resolvedAt!.getTime() - bug.createdAt.getTime();
            return sum + resolutionTime;
          }, 0) / resolvedBugsWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      return {
        totalBugs: bugs.length,
        openBugs: bugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress').length,
        resolvedBugs: bugs.filter(bug => bug.status === 'resolved').length,
        closedBugs: bugs.filter(bug => bug.status === 'closed').length,
        criticalBugs: bugs.filter(bug => bug.priority === 'critical').length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalMembers: projects.reduce((sum, project) => sum + (project.members?.length || 0), 0),
        bugsThisWeek,
        bugsLastWeek,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  },

  // Get recent activity feed
  async getRecentActivity(userId?: string): Promise<ActivityItem[]> {
    try {
      const [bugs, projects] = await Promise.all([
        bugService.getBugs(userId),
        projectService.getProjectsByUser(userId || '')
      ]);

      const activities: ActivityItem[] = [];

      // Add bug activities
      bugs.slice(0, 10).forEach(bug => {
        activities.push({
          id: `bug-${bug.id}`,
          type: 'bug_created',
          title: 'New bug reported',
          description: bug.description || 'No description provided',
          timestamp: bug.createdAt,
          userId: bug.reporter,
          userName: bug.reporterName,
          projectId: bug.projectId,
          projectName: bug.projectName,
          bugId: bug.id,
          bugTitle: bug.title
        });

        if (bug.status === 'resolved') {
          activities.push({
            id: `bug-resolved-${bug.id}`,
            type: 'bug_resolved',
            title: 'Bug resolved',
            description: `Bug "${bug.title}" has been resolved`,
            timestamp: bug.resolvedAt || bug.updatedAt,
            userId: bug.assignee,
            userName: bug.assigneeName,
            projectId: bug.projectId,
            projectName: bug.projectName,
            bugId: bug.id,
            bugTitle: bug.title
          });
        }

        if (bug.comments && bug.comments.length > 0) {
          const latestComment = bug.comments[bug.comments.length - 1];
          activities.push({
            id: `comment-${bug.id}-${latestComment.id}`,
            type: 'comment_added',
            title: 'Comment added',
            description: `New comment on bug "${bug.title}"`,
            timestamp: latestComment.createdAt,
            userId: latestComment.userId,
            userName: latestComment.userName,
            projectId: bug.projectId,
            projectName: bug.projectName,
            bugId: bug.id,
            bugTitle: bug.title
          });
        }
      });

      // Add project activities
      projects.slice(0, 5).forEach(project => {
        activities.push({
          id: `project-${project.id}`,
          type: 'project_created',
          title: 'Project created',
          description: `New project "${project.name}" has been created`,
          timestamp: project.createdAt,
          userId: project.owner,
          userName: project.ownerName,
          projectId: project.id,
          projectName: project.name
        });
      });

      // Sort by timestamp (newest first) and return top 20
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  },

  // Get project statistics
  async getProjectStats(userId?: string): Promise<ProjectStats> {
    try {
      const [bugs, projects] = await Promise.all([
        bugService.getBugs(userId),
        projectService.getProjectsByUser(userId || '')
      ]);

      const projectStats: ProjectStats = {};

      // Count bugs per project
      bugs.forEach(bug => {
        if (bug.projectId) {
          projectStats[bug.projectId] = (projectStats[bug.projectId] || 0) + 1;
        }
      });

      // Ensure all projects have a count (even if 0)
      projects.forEach(project => {
        if (!projectStats[project.id]) {
          projectStats[project.id] = 0;
        }
      });

      return projectStats;
    } catch (error) {
      console.error('Error getting project stats:', error);
      return {};
    }
  },

  // Get bugs with project names
  async getBugsWithProjectNames(userId?: string): Promise<Bug[]> {
    try {
      const [bugs, projects] = await Promise.all([
        bugService.getBugs(userId),
        projectService.getProjectsByUser(userId || '')
      ]);

      // Create a map of project IDs to project names
      const projectMap = new Map(projects.map(p => [p.id, p.name]));

      // Add project names to bugs
      return bugs.map(bug => ({
        ...bug,
        projectName: bug.projectId ? projectMap.get(bug.projectId) : undefined
      }));
    } catch (error) {
      console.error('Error getting bugs with project names:', error);
      return [];
    }
  }
}; 