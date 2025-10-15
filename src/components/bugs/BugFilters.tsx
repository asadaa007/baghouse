import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, User } from 'lucide-react';
import { Button } from '../common/buttons';
import type { BugFilters as BugFiltersType } from '../../types/bugs';
import { getAllUsers } from '../../services/userService';
import type { AppUser } from '../../types/auth';

interface BugFiltersProps {
  filters: BugFiltersType;
  onFiltersChange: (filters: BugFiltersType) => void;
  onSearchChange: (search: string) => void;
  onClearFilters?: () => void;
  searchTerm: string;
  projects?: Array<{ id: string; name: string }>;
}

const BugFilters: React.FC<BugFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearchChange,
  onClearFilters,
  searchTerm,
  projects = []
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [teamMembers, setTeamMembers] = useState<AppUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<AppUser[]>([]);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (key: keyof BugFiltersType, value: string | string[] | { start?: Date; end?: Date } | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      // Fallback to old behavior
      onFiltersChange({});
      onSearchChange('');
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

  // Load team members for assignee dropdown
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setLoadingMembers(true);
        const users = await getAllUsers();
        // Filter to get team members (exclude super_admin)
        const members = users.filter(user => user.role !== 'super_admin');
        setTeamMembers(members);
        setFilteredMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadTeamMembers();
  }, []);

  // Filter members based on search
  useEffect(() => {
    if (assigneeSearch.trim()) {
      const filtered = teamMembers.filter(member =>
        member.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        member.email.toLowerCase().includes(assigneeSearch.toLowerCase())
      );
      setFilteredMembers(filtered);
      setShowAssigneeDropdown(true);
    } else {
      setFilteredMembers(teamMembers);
      setShowAssigneeDropdown(false);
    }
  }, [assigneeSearch, teamMembers]);

  // Initialize assignee search from current filter
  useEffect(() => {
    if (filters.assignee) {
      const selectedMember = teamMembers.find(member => member.id === filters.assignee);
      if (selectedMember) {
        setAssigneeSearch(selectedMember.name);
      }
    } else {
      setAssigneeSearch('');
    }
  }, [filters.assignee, teamMembers]);

  const handleAssigneeSelect = (member: AppUser) => {
    setAssigneeSearch(member.name);
    handleFilterChange('assignee', member.id);
    setShowAssigneeDropdown(false);
  };

  const handleAssigneeSearchChange = (value: string) => {
    setAssigneeSearch(value);
    if (!value.trim()) {
      handleFilterChange('assignee', undefined);
      setShowAssigneeDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4 p-3">
      {/* Line 1: Search + Quick Filters */}
      <div className="flex gap-3 mb-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search bugs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        
        {/* Quick Filters */}
        <select
          value={filters.status?.[0] || 'all'}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange('status', value === 'all' ? undefined : [value]);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-32"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.priority?.[0] || 'all'}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange('priority', value === 'all' ? undefined : [value]);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-32"
        >
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div className="relative w-32" ref={assigneeDropdownRef}>
          <input
            type="text"
            placeholder="Assignee..."
            value={assigneeSearch}
            onChange={(e) => handleAssigneeSearchChange(e.target.value)}
            onFocus={() => setShowAssigneeDropdown(true)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loadingMembers}
          />
          {showAssigneeDropdown && filteredMembers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleAssigneeSelect(member)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={filters.projectName || 'all'}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange('projectName', value === 'all' ? undefined : value);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-32"
        >
          <option value="all">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            variant="ghost"
            size="sm"
            icon={showAdvancedFilters ? ChevronDown : Filter}
            className="text-xs px-2"
          >
            {showAdvancedFilters ? 'Less' : 'More'}
          </Button>
          
          {hasActiveFilters && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              icon={X}
              className="text-xs text-red-600 hover:text-red-700 px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Line 2: Date Range (when expanded) */}
      {showAdvancedFilters && (
        <div className="flex gap-3 mb-3">
          <input
            type="date"
            placeholder="Start Date"
            value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
            onChange={(e) => {
              const start = e.target.value ? new Date(e.target.value) : undefined;
              handleFilterChange('dateRange', {
                start,
                end: filters.dateRange?.end
              });
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-40"
          />
          <input
            type="date"
            placeholder="End Date"
            value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
            onChange={(e) => {
              const end = e.target.value ? new Date(e.target.value) : undefined;
              handleFilterChange('dateRange', {
                start: filters.dateRange?.start,
                end
              });
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-40"
          />
        </div>
      )}

      {/* Active Filters Display - Compact */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              <Search className="w-3 h-3 mr-1" />
              "{searchTerm}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-blue-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.status?.map(status => (
            <span key={status} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              {status}
              <button
                onClick={() => handleFilterChange('status', filters.status?.filter(s => s !== status))}
                className="ml-1 hover:text-green-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.priority?.map(priority => (
            <span key={priority} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
              {priority}
              <button
                onClick={() => handleFilterChange('priority', filters.priority?.filter(p => p !== priority))}
                className="ml-1 hover:text-orange-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.assignee && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
              <User className="w-3 h-3 mr-1" />
              {teamMembers.find(member => member.id === filters.assignee)?.name || filters.assignee}
              <button
                onClick={() => handleFilterChange('assignee', undefined)}
                className="ml-1 hover:text-purple-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BugFilters; 