import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Bug, BugFilters } from '../types/bugs';
import { bugService } from '../services/bugService';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface BugContextType {
  bugs: Bug[];
  loading: boolean;
  error: string | null;
  filters: BugFilters;
  setFilters: (filters: BugFilters) => void;
  addBug: (bug: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBug: (id: string, updates: Partial<Bug>, projectId?: string) => Promise<void>;
  deleteBug: (id: string, projectId?: string) => Promise<void>;
  refreshBugs: () => Promise<void>;
}

const BugContext = createContext<BugContextType | undefined>(undefined);

export const useBugs = () => {
  const context = useContext(BugContext);
  if (context === undefined) {
    throw new Error('useBugs must be used within a BugProvider');
  }
  return context;
};

export const BugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BugFilters>({});
  const { user } = useAuth();

  const refreshBugs = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedBugs = await bugService.getBugs(user);
      setBugs(fetchedBugs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bugs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time listener for bugs
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = async () => {
      try {
        // Get initial bugs
        const initialBugs = await bugService.getBugs(user);
        setBugs(initialBugs);
        setLoading(false);

        // Set up real-time listener for projects (bugs are stored as subcollections in projects)
        let projectsQuery;
        
        if (user.role === 'team_member' && user.teamId) {
          // Team members can only see bugs from projects assigned to their team
          projectsQuery = query(
            collection(db, 'projects'),
            where('teamId', '==', user.teamId)
          );
        } else {
          // Admins, managers, and team leads can see all projects
          projectsQuery = query(collection(db, 'projects'));
        }
        
        unsubscribe = onSnapshot(projectsQuery, 
          async (snapshot) => {
            try {
              // Extract bugs from all projects (same logic as bugService.getBugs)
              const allBugs: Bug[] = [];
              
              snapshot.docs.forEach(projectDoc => {
                const projectData = projectDoc.data();
                if (projectData.bugs && Array.isArray(projectData.bugs)) {
                  const projectBugs = projectData.bugs.map((bug: any) => ({
                    ...bug,
                    projectId: projectDoc.id, // Ensure projectId is set
                    projectName: projectData.name || 'Unknown Project', // Add project name
                    createdAt: bug.createdAt && typeof bug.createdAt.toDate === 'function' ? bug.createdAt.toDate() : new Date(),
                    updatedAt: bug.updatedAt && typeof bug.updatedAt.toDate === 'function' ? bug.updatedAt.toDate() : new Date()
                  }));
                  allBugs.push(...projectBugs);
                }
              });

              setBugs(allBugs);
              setError(null);
            } catch (err) {
              console.error('Error processing real-time bug updates:', err);
              setError('Failed to sync bug updates');
            }
          },
          (err) => {
            console.error('Real-time listener error:', err);
            setError('Failed to connect to real-time updates');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error setting up real-time listener:', err);
        setError('Failed to load bugs');
        setLoading(false);
      }
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const addBug = async (bugData: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      await bugService.createBug(bugData);
      await refreshBugs(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bug');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBug = async (id: string, updates: Partial<Bug>, projectId?: string) => {
    try {
      setError(null);
      
      // Optimistic update - update local state immediately
      setBugs(prevBugs => 
        prevBugs.map(bug => 
          bug.id === id 
            ? { ...bug, ...updates, updatedAt: new Date() }
            : bug
        )
      );
      
      // Update in database
      await bugService.updateBug(id, updates, projectId);
    } catch (err) {
      // Revert optimistic update on error
      await refreshBugs();
      setError(err instanceof Error ? err.message : 'Failed to update bug');
      throw err;
    }
  };

  const deleteBug = async (id: string, projectId?: string) => {
    try {
      setLoading(true);
      setError(null);
      await bugService.deleteBug(id, projectId);
      await refreshBugs(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bug');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: BugContextType = {
    bugs,
    loading,
    error,
    filters,
    setFilters,
    addBug,
    updateBug,
    deleteBug,
    refreshBugs,
  };

  return (
    <BugContext.Provider value={value}>
      {children}
    </BugContext.Provider>
  );
}; 