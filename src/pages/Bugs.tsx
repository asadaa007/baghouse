import{ useState } from 'react';
import { useBugs } from '../context/BugContext';
import Navigation from '../components/layout/Navigation';
import BugForm from '../components/dashboard/BugForm';
import BugFilters from '../components/bugs/BugFilters';
import BugTable from '../components/bugs/BugTable';
import Breadcrumb from '../components/common/Breadcrumb';
import Loading from '../components/common/Loading';
import { Plus, Download, Upload, RefreshCw } from 'lucide-react';
import type { BugFilters as BugFiltersType, BugStatus, BugPriority } from '../types/bugs';

const Bugs = () => {
  const { bugs, loading, updateBug, deleteBug, refreshBugs } = useBugs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BugFiltersType>({});
  const [isBugFormOpen, setIsBugFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filter bugs based on search and filters
  const filteredBugs = bugs.filter(bug => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !filters.status || filters.status.length === 0 || 
      filters.status.includes(bug.status);

    // Priority filter
    const matchesPriority = !filters.priority || filters.priority.length === 0 || 
      filters.priority.includes(bug.priority);

    // Assignee filter
    const matchesAssignee = !filters.assignee || 
      (bug.assignee && bug.assignee.toLowerCase().includes(filters.assignee.toLowerCase()));

    // Labels filter
    const matchesLabels = !filters.labels || filters.labels.length === 0 || 
      filters.labels.some(label => bug.labels.includes(label));

    // Date range filter
    const matchesDateRange = !filters.dateRange || 
      (!filters.dateRange.start || bug.createdAt >= filters.dateRange.start) &&
      (!filters.dateRange.end || bug.createdAt <= filters.dateRange.end);

    // Project filter
    const matchesProject = !filters.projectId || bug.projectId === filters.projectId;

    return matchesSearch && matchesStatus && matchesPriority && 
           matchesAssignee && matchesLabels && matchesDateRange && matchesProject;
  });

  const handleStatusChange = async (bugId: string, status: string) => {
    try {
      await updateBug(bugId, { status: status as BugStatus });
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  const handlePriorityChange = async (bugId: string, priority: string) => {
    try {
      await updateBug(bugId, { priority: priority as BugPriority });
    } catch (error) {
      console.error('Error updating bug priority:', error);
    }
  };

  const handleAssigneeChange = async (bugId: string, assignee: string) => {
    try {
      await updateBug(bugId, { assignee: assignee || undefined });
    } catch (error) {
      console.error('Error updating bug assignee:', error);
    }
  };

  const handleDeleteBug = async (bugId: string) => {
    if (!confirm('Are you sure you want to delete this bug? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBug(bugId);
    } catch (error) {
      console.error('Error deleting bug:', error);
      alert('Failed to delete bug');
    }
  };

  const handleBulkDelete = async (bugIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${bugIds.length} bugs? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(bugIds.map(bugId => deleteBug(bugId)));
    } catch (error) {
      console.error('Error bulk deleting bugs:', error);
      alert('Failed to delete some bugs');
    }
  };

  const handleExportBugs = () => {
    // TODO: Implement bug export functionality
    alert('Bug export functionality coming soon!');
  };

  const handleImportBugs = () => {
    // TODO: Implement bug import functionality
    alert('Bug import functionality coming soon!');
  };

  const handleRefresh = () => {
    refreshBugs();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loading size="lg" text="Loading bugs..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Bugs' }
          ]}
          showBackButton={false}
        />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bugs</h1>
              <p className="text-gray-600">
                Track and manage all your bug reports in one place.
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh bugs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleImportBugs}
                className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              <button
                onClick={handleExportBugs}
                className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setIsBugFormOpen(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Bug
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <BugFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
          totalBugs={bugs.length}
          filteredCount={filteredBugs.length}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Kanban View
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredBugs.length} of {bugs.length} bugs
          </div>
        </div>

        {/* Bugs Table */}
        {viewMode === 'table' && (
          <BugTable
            bugs={filteredBugs}
            onDeleteBug={handleDeleteBug}
            onBulkDelete={handleBulkDelete}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onAssigneeChange={handleAssigneeChange}
            loading={loading}
          />
        )}

        {/* Kanban View - Placeholder */}
        {viewMode === 'kanban' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kanban View</h3>
            <p className="text-gray-600 mb-4">Kanban board view coming soon!</p>
            <button
              onClick={() => setViewMode('table')}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Switch to Table View
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredBugs.length === 0 && bugs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs yet</h3>
            <p className="text-gray-600 mb-6">
              Start tracking bugs by creating your first bug report.
            </p>
            <button
              onClick={() => setIsBugFormOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Bug
            </button>
          </div>
        )}
      </div>

      {/* Bug Form Modal */}
      <BugForm
        isOpen={isBugFormOpen}
        onClose={() => setIsBugFormOpen(false)}
      />
    </div>
  );
};

export default Bugs; 