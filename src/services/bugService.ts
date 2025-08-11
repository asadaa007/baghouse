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
    
         // Find the highest bug number
     let maxBugNumber = 0;
     existingBugs.forEach((bug: Bug) => {
       const bugNumber = parseInt(bug.customId || '0');
       if (bugNumber > maxBugNumber) {
         maxBugNumber = bugNumber;
       }
     });
    
    // Return next bug number
    return (maxBugNumber + 1).toString();
  } catch (error) {
    console.error('Error generating project bug ID:', error);
    // Fallback to timestamp-based ID
    return Date.now().toString();
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
      
      // Create the bug object
      const newBug = {
        id: `${bugData.projectId}_${Date.now()}`, // Unique ID for the bug
        customId,
        ...bugData,
        assigneeName,
        externalAssigneeName,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add bug to the project's bugs array
      const projectRef = doc(db, PROJECTS_COLLECTION, bugData.projectId);
      await updateDoc(projectRef, {
        bugs: arrayUnion(newBug),
        updatedAt: serverTimestamp()
      });
      
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
                createdAt: bug.createdAt && typeof bug.createdAt.toDate === 'function' ? bug.createdAt.toDate() : new Date(),
                updatedAt: bug.updatedAt && typeof bug.updatedAt.toDate === 'function' ? bug.updatedAt.toDate() : new Date()
              }));
              allBugs = [...allBugs, ...projectBugs];
            }
          });
        }
      }
      
      // Sort by creation date (newest first)
      return allBugs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
  async getBugById(id: string): Promise<Bug | null> {
    try {
      // Extract project ID from bug ID (format: projectId_timestamp)
      const projectId = id.split('_')[0];
      
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
      
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
  async updateBug(id: string, updates: Partial<Bug>): Promise<void> {
    try {
      // Extract project ID from bug ID
      const projectId = id.split('_')[0];
      
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
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const bugs = projectData.bugs || [];
      
             // Find and update the specific bug
       const updatedBugs = bugs.map((bug: any) => {
         if (bug.id === id) {
           return {
             ...bug,
             ...updates,
             ...(assigneeName && { assigneeName }),
             ...(externalAssigneeName && { externalAssigneeName }),
             updatedAt: new Date()
           };
         }
         return bug;
       });
      
      // Update the project document
      await updateDoc(projectRef, {
        bugs: updatedBugs,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating bug:', error);
      throw new Error('Failed to update bug');
    }
  },

  // Delete bug
  async deleteBug(id: string): Promise<void> {
    try {
      // Extract project ID from bug ID
      const projectId = id.split('_')[0];
      
      // Get the project document
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
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