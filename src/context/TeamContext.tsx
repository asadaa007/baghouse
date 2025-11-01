import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as teamService from '../services/teamService';
import type { Team, TeamWithDetails, CreateTeamData } from '../types/auth';

interface TeamContextType {
  teams: Team[];
  teamDetails: TeamWithDetails | null;
  loading: boolean;
  error: string | null;
  createTeam: (teamData: CreateTeamData) => Promise<void>;
  getAllTeams: () => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addMemberToTeam: (teamId: string, userId: string) => Promise<void>;
  removeMemberFromTeam: (teamId: string, userId: string) => Promise<void>;
  getTeamDetails: (teamId: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamProvider');
  }
  return context;
};

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamDetails, setTeamDetails] = useState<TeamWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load teams based on user role
  const loadTeams = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let teamsData: Team[] = [];

      if (user.role === 'super_admin') {
        // Super admin can see all teams
        teamsData = await teamService.getAllTeams();
      } else if (user.role === 'manager') {
        // Manager can see teams they manage
        teamsData = await teamService.getTeamsByManager(user.id);
      } else if (user.role === 'team_lead') {
        // Team lead can see teams they lead
        teamsData = await teamService.getTeamsByTeamLead(user.id);
      } else if (user.role === 'team_member' && user.teamId) {
        // Team member can see their team
        const team = await teamService.getTeamById(user.teamId);
        if (team) {
          teamsData = [team];
        }
      }

      setTeams(teamsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Load teams when user changes
  useEffect(() => {
    loadTeams();
  }, [user]);

  const createTeam = async (teamData: CreateTeamData) => {
    setLoading(true);
    setError(null);

    try {
      await teamService.createTeam(teamData);
      await loadTeams(); // Refresh teams list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    setLoading(true);
    setError(null);

    try {
      await teamService.updateTeam(teamId, updates);
      await loadTeams(); // Refresh teams list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    setLoading(true);
    setError(null);

    try {
      await teamService.deleteTeam(teamId);
      await loadTeams(); // Refresh teams list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMemberToTeam = async (teamId: string, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      await teamService.addMemberToTeam(teamId, userId);
      await loadTeams(); // Refresh teams list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member to team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromTeam = async (teamId: string, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      await teamService.removeMemberFromTeam(teamId, userId);
      await loadTeams(); // Refresh teams list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member from team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTeamDetails = async (teamId: string) => {
    setLoading(true);
    setError(null);

    try {
      const details = await teamService.getTeamWithDetails(teamId);
      setTeamDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get team details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshTeams = async () => {
    await loadTeams();
  };

  const getAllTeams = async () => {
    await loadTeams();
  };

  const value: TeamContextType = {
    teams,
    teamDetails,
    loading,
    error,
    createTeam,
    getAllTeams,
    updateTeam,
    deleteTeam,
    addMemberToTeam,
    removeMemberFromTeam,
    getTeamDetails,
    refreshTeams,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};
