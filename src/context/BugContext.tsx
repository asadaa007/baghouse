import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Bug, BugFilters } from '../types/bugs';
import { bugService } from '../services/bugService';
import { useAuth } from './AuthContext';

interface BugContextType {
  bugs: Bug[];
  loading: boolean;
  error: string | null;
  filters: BugFilters;
  setFilters: (filters: BugFilters) => void;
  addBug: (bug: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBug: (id: string, updates: Partial<Bug>) => Promise<void>;
  deleteBug: (id: string) => Promise<void>;
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

  const refreshBugs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedBugs = await bugService.getBugs();
      setBugs(fetchedBugs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bugs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBugs();
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

  const updateBug = async (id: string, updates: Partial<Bug>) => {
    try {
      setLoading(true);
      setError(null);
      await bugService.updateBug(id, updates);
      await refreshBugs(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bug');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBug = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await bugService.deleteBug(id);
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