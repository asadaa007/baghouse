import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Project } from '../types/projects';

const PROJECTS_COLLECTION = 'projects';

export const projectService = {
  // Create a new project
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()});
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  },

  // Get all projects
  async getProjects(): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Project[];
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to get projects');
    }
  },

  // Get project by ID
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()} as Project;
      }
      return null;
    } catch (error) {
      console.error('Error getting project:', error);
      throw new Error('Failed to get project');
    }
  },

  // Update project
  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()});
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  },

  // Get projects by team ID
  async getProjectsByTeam(teamId: string): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
      const allProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Project[];
      
      // Filter projects assigned to the specified team
      return allProjects.filter(project => project.teamId === teamId);
    } catch (error) {
      console.error('Error getting projects by team:', error);
      throw new Error('Failed to get projects by team');
    }
  },

  // Get projects by user (and optionally by user's team)
  async getProjectsByUser(userId: string, teamId?: string): Promise<Project[]> {
    try {
      // Get all projects and filter in application layer to avoid index requirements
      const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
      const allProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Project[];
      
      // Filter projects where user is a member/owner, or project assigned to their team
      const userProjects = allProjects.filter(project => 
        project.members?.some(member => member.userId === userId) || 
        project.owner === userId ||
        (!!teamId && project.teamId === teamId)
      );
      
      // Sort by creation date (newest first)
      return userProjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting projects by user:', error);
      throw new Error('Failed to get projects by user');
    }
  }}; 