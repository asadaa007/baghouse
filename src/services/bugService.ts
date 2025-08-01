import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
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
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating bug:', error);
      throw new Error('Failed to create bug');
    }
  },

  // Get all bugs (filtered by current user)
  async getBugs(userId?: string): Promise<Bug[]> {
    try {
      let q;
      
      if (userId) {
        // Filter bugs by reporter or assignee
        q = query(
          collection(db, BUGS_COLLECTION),
          where('reporter', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Get all bugs (for admin or when user is not specified)
        q = query(
          collection(db, BUGS_COLLECTION),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Bug[];
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
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
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
      const docRef = doc(db, BUGS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
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
      const q = query(
        collection(db, BUGS_COLLECTION),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Bug[];
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
  async getRecentBugs(limitCount: number = 10, userId?: string): Promise<Bug[]> {
    try {
      let q;
      
      if (userId) {
        // Filter by user
        q = query(
          collection(db, BUGS_COLLECTION),
          where('reporter', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        // Get all recent bugs
        q = query(
          collection(db, BUGS_COLLECTION),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Bug[];
    } catch (error) {
      console.error('Error getting recent bugs:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.warn('Permission denied - returning empty array');
        return [];
      }
      throw new Error('Failed to get recent bugs');
    }
  },
}; 