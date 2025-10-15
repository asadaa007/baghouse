import { db } from '../firebase/config';
import { collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';

export interface ActivityItem {
  id: string;
  type: 'bug_created' | 'bug_updated' | 'bug_resolved' | 'bug_closed' | 'comment_added' | 'user_joined' | 'project_created' | 'project_updated' | 'team_created' | 'member_added';
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
  projectId?: string;
  projectName?: string;
  bugId?: string;
  bugTitle?: string;
  teamId?: string;
  teamName?: string;
  metadata?: Record<string, any>;
}

export const activityService = {
  // Log a new activity
  async logActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activity,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      throw new Error('Failed to log activity');
    }
  },

  // Get recent activities for a user
  async getRecentActivities(userId: string, limitCount: number = 10): Promise<ActivityItem[]> {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(activitiesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as ActivityItem[];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },

  // Get activities for a project
  async getProjectActivities(projectId: string, limitCount: number = 10): Promise<ActivityItem[]> {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(activitiesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as ActivityItem[];
    } catch (error) {
      console.error('Error fetching project activities:', error);
      return [];
    }
  },

  // Get all activities (for admin dashboard)
  async getAllActivities(limitCount: number = 20): Promise<ActivityItem[]> {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(activitiesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as ActivityItem[];
    } catch (error) {
      console.error('Error fetching all activities:', error);
      return [];
    }
  },

  // Helper function to create activity from bug changes
  createBugActivity: {
    created: (bug: any, user: any) => ({
      type: 'bug_created' as const,
      title: 'Bug Created',
      description: `"${bug.title}" was created`,
      userId: user.id,
      userName: user.name || user.email,
      projectId: bug.projectId,
      projectName: bug.projectName,
      bugId: bug.id,
      bugTitle: bug.title
    }),

    updated: (bug: any, user: any, changes: Record<string, any>) => ({
      type: 'bug_updated' as const,
      title: 'Bug Updated',
      description: `"${bug.title}" was updated`,
      userId: user.id,
      userName: user.name || user.email,
      projectId: bug.projectId,
      projectName: bug.projectName,
      bugId: bug.id,
      bugTitle: bug.title,
      metadata: { changes }
    }),

    resolved: (bug: any, user: any) => ({
      type: 'bug_resolved' as const,
      title: 'Bug Resolved',
      description: `"${bug.title}" was resolved`,
      userId: user.id,
      userName: user.name || user.email,
      projectId: bug.projectId,
      projectName: bug.projectName,
      bugId: bug.id,
      bugTitle: bug.title
    }),

    closed: (bug: any, user: any) => ({
      type: 'bug_closed' as const,
      title: 'Bug Closed',
      description: `"${bug.title}" was closed`,
      userId: user.id,
      userName: user.name || user.email,
      projectId: bug.projectId,
      projectName: bug.projectName,
      bugId: bug.id,
      bugTitle: bug.title
    }),

    commentAdded: (bug: any, user: any) => ({
      type: 'comment_added' as const,
      title: 'Comment Added',
      description: `Comment added to "${bug.title}"`,
      userId: user.id,
      userName: user.name || user.email,
      projectId: bug.projectId,
      projectName: bug.projectName,
      bugId: bug.id,
      bugTitle: bug.title
    })
  }
};
