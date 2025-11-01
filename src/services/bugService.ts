import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Bug } from '../types/bugs';
import type { AppUser } from '../types/auth';
import { activityService } from './activityService';



const PROJECTS_COLLECTION = 'projects';

// Generate project-specific bug ID (e.g., #1, #2, #3, etc.)
const generateProjectBugId = async (projectId: string): Promise<string> => {
  try {
    // Get the project document
    const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
    
    if (!projectDoc.exists()) {
      throw new Error('Project not found');
    }
    
    const projectData = projectDoc.data();
    const existingBugs = projectData.bugs || [];
    
    // Find the highest bug number from existing bugs
    let maxBugNumber = 0;
    existingBugs.forEach((bug: Bug) => {
      // Extract number from ID format like "#1", "#2", etc.
      const idMatch = bug.id?.match(/#(\d+)$/);
      if (idMatch) {
        const bugNumber = parseInt(idMatch[1]);
        if (bugNumber > maxBugNumber) {
          maxBugNumber = bugNumber;
        }
      }
    });
    
    // Return next bug number with # prefix
    return `#${maxBugNumber + 1}`;
  } catch (error) {
    console.error('Error generating project bug ID:', error);
    // Fallback to timestamp-based ID
    return `#${Date.now()}`;
  }
};

export const bugService = {
  // Create new bug within a project
  async createBug(bugData: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Generate project-specific bug ID
      const customId = await generateProjectBugId(bugData.projectId);
      
      // Get assignee names if assignee IDs are provided
      let assigneeName = '';
      let externalAssigneeName = '';
      
      if (bugData.assignee) {
        try {
          const assigneeDoc = await getDoc(doc(db, 'users', bugData.assignee));
          if (assigneeDoc.exists()) {
            assigneeName = assigneeDoc.data().name || '';
          }
        } catch (error) {
          console.warn('Could not fetch assignee name:', error);
        }
      }
      
      if (bugData.externalAssignee) {
        try {
          const externalAssigneeDoc = await getDoc(doc(db, 'users', bugData.externalAssignee));
          if (externalAssigneeDoc.exists()) {
            externalAssigneeName = externalAssigneeDoc.data().name || '';
          }
        } catch (error) {
          console.warn('Could not fetch external assignee name:', error);
        }
      }
      
      // Get project name for the bug
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, bugData.projectId));
      const projectData = projectDoc.data();
      const projectName = projectData?.name || 'Unknown Project';
      
      // Create the bug object
      const newBug = {
        id: customId, // Use the sequential ID as the main ID
        customId, // Keep customId for backward compatibility
        ...bugData,
        assigneeName,
        externalAssigneeName,
        projectName,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add bug to the project's bugs array
      const projectRef = doc(db, PROJECTS_COLLECTION, bugData.projectId);
      await updateDoc(projectRef, {
        bugs: arrayUnion(newBug),
        updatedAt: serverTimestamp()
      });
      
      // Log activity
      try {
        const user = bugData.userId ? { id: bugData.userId, name: bugData.userName } : { id: bugData.reporter, name: bugData.reporterName };
        
        await activityService.logActivity(
          activityService.createBugActivity.created(newBug, user)
        );
      } catch (error) {
        console.error('Could not log bug creation activity:', error);
      }
      
      return newBug.id;
    } catch (error) {
      console.error('Error creating bug:', error);
      throw new Error('Failed to create bug');
    }
  },

  // Get all bugs (filtered by current user role and team)
  async getBugs(user?: AppUser): Promise<Bug[]> {
    try {
      let allBugs: Bug[] = [];
      
      if (user) {
        if (user.role === 'team_member') {
          // Team members can only see bugs from projects assigned to their team
          if (user.teamId) {
            // Get all projects for the user's team
            const projectsQuery = query(
              collection(db, PROJECTS_COLLECTION),
              where('teamId', '==', user.teamId)
            );
            const projectsSnapshot = await getDocs(projectsQuery);
            
            // Extract bugs from each project
            projectsSnapshot.docs.forEach(projectDoc => {
              const projectData = projectDoc.data();
              if (projectData.bugs && Array.isArray(projectData.bugs)) {
                const projectBugs = projectData.bugs.map((bug: any) => ({
                  ...bug,
                  projectId: projectDoc.id, // Ensure projectId is set
                  projectName: projectData.name || 'Unknown Project', // Add project name
                  createdAt: bug.createdAt && typeof bug.createdAt.toDate === 'function' ? bug.createdAt.toDate() : new Date(),
                  updatedAt: bug.updatedAt && typeof bug.updatedAt.toDate === 'function' ? bug.updatedAt.toDate() : new Date()
                }));
                allBugs = [...allBugs, ...projectBugs];
              }
            });
          }
        } else {
          // Admins, managers, and team leads can see all bugs
          const projectsSnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
          
          // Extract bugs from all projects
          projectsSnapshot.docs.forEach(projectDoc => {
            const projectData = projectDoc.data();
            if (projectData.bugs && Array.isArray(projectData.bugs)) {
              const projectBugs = projectData.bugs.map((bug: any) => ({
                ...bug,
                projectId: projectDoc.id, // Ensure projectId is set
                projectName: projectData.name || 'Unknown Project', // Add project name
                createdAt: bug.createdAt && typeof bug.createdAt.toDate === 'function' ? bug.createdAt.toDate() : new Date(),
                updatedAt: bug.updatedAt && typeof bug.updatedAt.toDate === 'function' ? bug.updatedAt.toDate() : new Date()
              }));
              allBugs = [...allBugs, ...projectBugs];
            }
          });
        }
      }
      
      // Remove duplicates based on bug ID and project ID combination
      const uniqueBugs = allBugs.filter((bug, index, self) => 
        index === self.findIndex(b => b.id === bug.id && b.projectId === bug.projectId)
      );
      
      // Sort by creation date (newest first)
      return uniqueBugs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting bugs:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.warn('Permission denied - returning empty array');
        return [];
      }
      throw new Error('Failed to get bugs');
    }
  },

  // Get bug by ID
  async getBugById(id: string, projectId?: string): Promise<Bug | null> {
    try {
      let targetProjectId = projectId;
      
      // If no projectId provided, we need to search through all projects
      if (!targetProjectId) {
        const projectsSnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
        
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData = projectDoc.data();
          const bugs = projectData.bugs || [];
          
          const bug = bugs.find((b: any) => b.id === id);
          if (bug) {
            return {
              ...bug,
              createdAt: bug.createdAt?.toDate() || new Date(),
              updatedAt: bug.updatedAt?.toDate() || new Date()
            } as Bug;
          }
        }
        
        return null;
      }
      
      // If projectId is provided, search in that specific project
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, targetProjectId));
      
      if (!projectDoc.exists()) {
        return null;
      }
      
      const projectData = projectDoc.data();
      const bugs = projectData.bugs || [];
      
      const bug = bugs.find((b: any) => b.id === id);
      
      if (bug) {
        return {
          ...bug,
          createdAt: bug.createdAt?.toDate() || new Date(),
          updatedAt: bug.updatedAt?.toDate() || new Date()
        } as Bug;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting bug:', error);
      throw new Error('Failed to get bug');
    }
  },

  // Update bug
  async updateBug(id: string, updates: Partial<Bug>, projectId?: string): Promise<void> {
    try {
      let targetProjectId = projectId;
      
      // If no projectId provided, we need to find it by searching through all projects
      if (!targetProjectId) {
        const projectsSnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
        
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData = projectDoc.data();
          const bugs = projectData.bugs || [];
          
          const bug = bugs.find((b: any) => b.id === id);
          if (bug) {
            targetProjectId = projectDoc.id;
            break;
          }
        }
        
        if (!targetProjectId) {
          throw new Error('Bug not found in any project');
        }
      }
      
      // Get assignee names if assignee IDs are provided
      let assigneeName = updates.assigneeName;
      let externalAssigneeName = updates.externalAssigneeName;
      
      if (updates.assignee && !assigneeName) {
        try {
          const assigneeDoc = await getDoc(doc(db, 'users', updates.assignee));
          if (assigneeDoc.exists()) {
            assigneeName = assigneeDoc.data().name || '';
          }
        } catch (error) {
          console.warn('Could not fetch assignee name:', error);
        }
      }
      
      if (updates.externalAssignee && !externalAssigneeName) {
        try {
          const externalAssigneeDoc = await getDoc(doc(db, 'users', updates.externalAssignee));
          if (externalAssigneeDoc.exists()) {
            externalAssigneeName = externalAssigneeDoc.data().name || '';
          }
        } catch (error) {
          console.warn('Could not fetch external assignee name:', error);
        }
      }
      
      // Get the project document
      const projectRef = doc(db, PROJECTS_COLLECTION, targetProjectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const bugs = projectData.bugs || [];
      
      // Find the current bug to track changes
      const currentBug = bugs.find((b: any) => b.id === id);
      if (!currentBug) {
        throw new Error('Bug not found');
      }
      
      // Create history entries for changes
      const historyEntries: any[] = [];
      const now = new Date();
      
      // Track status changes
      if (updates.status && updates.status !== currentBug.status) {
        historyEntries.push({
          id: `history-${Date.now()}-${Math.random()}`,
          action: 'Status changed',
          field: 'status',
          oldValue: currentBug.status,
          newValue: updates.status,
          userId: updates.userId || 'system',
          userName: updates.userName || 'System',
          createdAt: now
        });
      }
      
      // Track priority changes
      if (updates.priority && updates.priority !== currentBug.priority) {
        historyEntries.push({
          id: `history-${Date.now()}-${Math.random()}`,
          action: 'Priority changed',
          field: 'priority',
          oldValue: currentBug.priority,
          newValue: updates.priority,
          userId: updates.userId || 'system',
          userName: updates.userName || 'System',
          createdAt: now
        });
      }
      
      // Track assignee changes
      if (updates.assignee && updates.assignee !== currentBug.assignee) {
        historyEntries.push({
          id: `history-${Date.now()}-${Math.random()}`,
          action: 'Assignee changed',
          field: 'assignee',
          oldValue: currentBug.assigneeName || currentBug.assignee,
          newValue: assigneeName || updates.assignee,
          userId: updates.userId || 'system',
          userName: updates.userName || 'System',
          createdAt: now
        });
      }
      
      // Track title changes
      if (updates.title && updates.title !== currentBug.title) {
        historyEntries.push({
          id: `history-${Date.now()}-${Math.random()}`,
          action: 'Title changed',
          field: 'title',
          oldValue: currentBug.title,
          newValue: updates.title,
          userId: updates.userId || 'system',
          userName: updates.userName || 'System',
          createdAt: now
        });
      }
      
      // Track description changes
      if (updates.description && updates.description !== currentBug.description) {
        historyEntries.push({
          id: `history-${Date.now()}-${Math.random()}`,
          action: 'Description changed',
          field: 'description',
          oldValue: currentBug.description.substring(0, 50) + '...',
          newValue: updates.description.substring(0, 50) + '...',
          userId: updates.userId || 'system',
          userName: updates.userName || 'System',
          createdAt: now
        });
      }
      
      // Find and update the specific bug
      const updatedBugs = bugs.map((bug: any) => {
        if (bug.id === id) {
          const existingHistory = bug.history || [];
          
          // If updates already contain history, use that instead of creating new entries
          let finalHistory;
          if (updates.history && Array.isArray(updates.history)) {
            // Use the provided history (from component)
            finalHistory = updates.history;
          } else {
            // Use existing history + new entries (from service)
            finalHistory = [...existingHistory, ...historyEntries];
          }
          
          return {
            ...bug,
            ...updates,
            ...(assigneeName && { assigneeName }),
            ...(externalAssigneeName && { externalAssigneeName }),
            history: finalHistory,
            updatedAt: now
          };
        }
        return bug;
      });
      
      // Update the project document
      await updateDoc(projectRef, {
        bugs: updatedBugs,
        updatedAt: serverTimestamp()
      });
      
      // Log activity for significant changes
      try {
        const updatedBug = updatedBugs.find((bug: any) => bug.id === id);
        if (updatedBug && updates.userId) {
          const user = { id: updates.userId, name: updates.userName || 'Unknown' };
          
          // Log different types of activities based on what was updated
          if (updates.status === 'completed') {
            await activityService.logActivity(
              activityService.createBugActivity.resolved(updatedBug, user)
            );
          } else if (updates.status || updates.priority || updates.assignee || updates.title || updates.description) {
            await activityService.logActivity(
              activityService.createBugActivity.updated(updatedBug, user, updates)
            );
          }
        }
      } catch (error) {
        console.warn('Could not log bug update activity:', error);
      }
    } catch (error) {
      console.error('Error updating bug:', error);
      throw new Error('Failed to update bug');
    }
  },

  // Delete bug
  async deleteBug(id: string, projectId?: string): Promise<void> {
    try {
      let targetProjectId = projectId;
      
      // If no projectId provided, we need to find it by searching through all projects
      if (!targetProjectId) {
        const projectsSnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
        
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData = projectDoc.data();
          const bugs = projectData.bugs || [];
          
          const bug = bugs.find((b: any) => b.id === id);
          if (bug) {
            targetProjectId = projectDoc.id;
            break;
          }
        }
        
        if (!targetProjectId) {
          throw new Error('Bug not found in any project');
        }
      }
      
      // Get the project document
      const projectRef = doc(db, PROJECTS_COLLECTION, targetProjectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const bugs = projectData.bugs || [];
      
      // Remove the specific bug
      const updatedBugs = bugs.filter((bug: any) => bug.id !== id);
      
      // Update the project document
      await updateDoc(projectRef, {
        bugs: updatedBugs,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw new Error('Failed to delete bug');
    }
  },

  // Get bugs by project
  async getBugsByProject(projectId: string): Promise<Bug[]> {
    try {
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
      
      if (!projectDoc.exists()) {
        return [];
      }
      
      const projectData = projectDoc.data();
      const bugs = projectData.bugs || [];
      
      const projectBugs = bugs.map((bug: any) => ({
        ...bug,
        createdAt: bug.createdAt?.toDate() || new Date(),
        updatedAt: bug.updatedAt?.toDate() || new Date()
      })) as Bug[];
      
      return projectBugs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting bugs by project:', error);
      throw new Error('Failed to get bugs by project');
    }
  },

  // Get recent bugs
  async getRecentBugs(count: number = 10, user?: AppUser): Promise<Bug[]> {
    try {
      const allBugs = await this.getBugs(user);
      return allBugs.slice(0, count);
    } catch (error) {
      console.error('Error getting recent bugs:', error);
      throw new Error('Failed to get recent bugs');
    }
  }
}; 