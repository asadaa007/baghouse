import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc,serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Bug } from '../types/bugs';

const BUGS_COLLECTION = 'bugs';

export const bugService = {
  // Create new bug
  async createBug(bugData: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, BUGS_COLLECTION), {
        ...bugData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()});
      return docRef.id;
    } catch (error) {
      console.error('Error creating bug:', error);
      throw new Error('Failed to create bug');
    }
  },

  // Get all bugs (filtered by current user)
  async getBugs(userId?: string): Promise<Bug[]> {
    try {
      // Get all bugs and filter in application layer to avoid index requirements
      const querySnapshot = await getDocs(collection(db, BUGS_COLLECTION));
      const allBugs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Bug[];
      
      let filteredBugs = allBugs;
      
      if (userId) {
        // Filter bugs by reporter or assignee
        filteredBugs = allBugs.filter(bug => 
          bug.reporter === userId || bug.assignee === userId
        );
      }
      
      // Sort by creation date (newest first)
      return filteredBugs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting bugs:', error);
      // Return empty array instead of throwing error for empty collections
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
      const docRef = doc(db, BUGS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()} as Bug;
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
      const docRef = doc(db, BUGS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()});
    } catch (error) {
      console.error('Error updating bug:', error);
      throw new Error('Failed to update bug');
    }
  },

  // Delete bug
  async deleteBug(id: string): Promise<void> {
    try {
      const docRef = doc(db, BUGS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw new Error('Failed to delete bug');
    }
  },

  // Get bugs by project
  async getBugsByProject(projectId: string): Promise<Bug[]> {
    try {
      // Get all bugs and filter by project in application layer
      const querySnapshot = await getDocs(collection(db, BUGS_COLLECTION));
      const allBugs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Bug[];
      
      // Filter bugs by project
      const projectBugs = allBugs.filter(bug => bug.projectId === projectId);
      
      // Sort by creation date (newest first)
      return projectBugs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting bugs by project:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.warn('Permission denied - returning empty array');
        return [];
      }
      throw new Error('Failed to get bugs by project');
    }
  },

  // Get recent bugs
  async getRecentBugs(count: number = 10, userId?: string): Promise<Bug[]> {
    try {
      // Get all bugs and filter in application layer
      const querySnapshot = await getDocs(collection(db, BUGS_COLLECTION));
      const allBugs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Bug[];
      
      let filteredBugs = allBugs;
      
      if (userId) {
        // Filter bugs by reporter or assignee
        filteredBugs = allBugs.filter(bug => 
          bug.reporter === userId || bug.assignee === userId
        );
      }
      
      // Sort by creation date (newest first) and return filtered bugs
      return filteredBugs
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, count);
    } catch (error) {
      console.error('Error getting recent bugs:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.warn('Permission denied - returning empty array');
        return [];
      }
      throw new Error('Failed to get recent bugs');
    }
  }
}; 