import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
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
  // Create a new bug
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

  // Get all bugs
  async getBugs(): Promise<Bug[]> {
    try {
      const querySnapshot = await getDocs(collection(db, BUGS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Bug[];
    } catch (error) {
      console.error('Error getting bugs:', error);
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
      throw new Error('Failed to get bugs by project');
    }
  },

  // Get recent bugs
  async getRecentBugs(limitCount: number = 10): Promise<Bug[]> {
    try {
      const q = query(
        collection(db, BUGS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Bug[];
    } catch (error) {
      console.error('Error getting recent bugs:', error);
      throw new Error('Failed to get recent bugs');
    }
  },
}; 