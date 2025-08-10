import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, User, Tag } from 'lucide-react';
import type { BugFilters as BugFiltersType } from '../../types/bugs';

interface BugFiltersProps {
  filters: BugFiltersType;
  onFiltersChange: (filters: BugFiltersType) => void;
  onSearchChange: (search: string) => void;
  searchTerm: string;
  totalBugs: number;
  filteredCount: number;
}

const BugFilters: React.FC<BugFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearchChange,
  searchTerm,
  totalBugs,
  filteredCount
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFilterChange = (key: keyof BugFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search and Basic Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bugs by title, description, or ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status?.[0] || 'all'}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('status', value === 'all' ? undefined : [value]);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority?.[0] || 'all'}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('priority', value === 'all' ? undefined : [value]);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Results Count and Advanced Filters */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {filteredCount} of {totalBugs} bugs
          </div>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Assignee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Assignee
              </label>
              <input
                type="text"
                placeholder="Filter by assignee..."
                value={filters.assignee || ''}
                onChange={(e) => handleFilterChange('assignee', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Labels Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Labels
              </label>
              <input
                type="text"
                placeholder="Filter by labels..."
                value={filters.labels?.join(', ') || ''}
                onChange={(e) => {
                  const labels = e.target.value.split(',').map(l => l.trim()).filter(l => l);
                  handleFilterChange('labels', labels.length > 0 ? labels : undefined);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const start = e.target.value ? new Date(e.target.value) : undefined;
                    handleFilterChange('dateRange', {
                      start,
                      end: filters.dateRange?.end
                    });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const end = e.target.value ? new Date(e.target.value) : undefined;
                    handleFilterChange('dateRange', {
                      start: filters.dateRange?.start,
                      end
                    });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={filters.projectId || 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('projectId', value === 'all' ? undefined : value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Projects</option>
                <option value="project1">Project Alpha</option>
                <option value="project2">Project Beta</option>
                <option value="project3">Project Gamma</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => onSearchChange('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.status?.map(status => (
                  <span key={status} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Status: {status}
                    <button
                      onClick={() => handleFilterChange('status', filters.status?.filter(s => s !== status))}
                      className="ml-1 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.priority?.map(priority => (
                  <span key={priority} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Priority: {priority}
                    <button
                      onClick={() => handleFilterChange('priority', filters.priority?.filter(p => p !== priority))}
                      className="ml-1 hover:text-orange-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.assignee && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Assignee: {filters.assignee}
                    <button
                      onClick={() => handleFilterChange('assignee', undefined)}
                      className="ml-1 hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BugFilters; 