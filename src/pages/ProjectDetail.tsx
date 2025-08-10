import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useBugs } from '../context/BugContext';
import Navigation from '../components/layout/Navigation';
import Breadcrumb from '../components/common/Breadcrumb';
import Loading from '../components/common/Loading';
import BugForm from '../components/dashboard/BugForm';
import { 
  Plus, 
  Bug, 
  Settings, 
  Calendar, 
  ArrowLeft,
  Filter,
  Search,
  Trash2,
  X,
  CheckSquare,
  Square,
  Edit2,
  Save,
  ChevronDown,
  User,
  Tag,
  Paperclip,
  Clock,
  MessageSquare,
  Eye
} from 'lucide-react';
import type { Bug as BugType, BugStatus } from '../types/bugs';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  isDefault?: boolean;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();
  const { bugs, loading: bugsLoading, deleteBug, updateBug } = useBugs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isBugFormOpen, setIsBugFormOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<BugType | null>(null);
  const [filterStatus, setFilterStatus] = useState<BugStatus[]>([]);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState('');
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Find the current project
  const project = projects.find(p => p.id === projectId);
  
  // Filter bugs for this project
  const projectBugs = bugs.filter(bug => bug.projectId === projectId);

  // Apply search and filters
  const filteredBugs = projectBugs.filter(bug => {
    const matchesSearch = searchTerm === '' || 
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(bug.status);
    const matchesPriority = filterPriority.length === 0 || filterPriority.includes(bug.priority);

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Enhanced Kanban columns with database-like structure
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([
    { id: 'new', title: 'New', color: 'bg-primary/5 border-primary/20', isDefault: true },
    { id: 'in-progress', title: 'In Progress', color: 'bg-primary/5 border-primary/20', isDefault: true },
    { id: 'review', title: 'Review', color: 'bg-primary/5 border-primary/20', isDefault: true },
    { id: 'resolved', title: 'Resolved', color: 'bg-primary/5 border-primary/20', isDefault: true },
    { id: 'closed', title: 'Closed', color: 'bg-primary/5 border-primary/20', isDefault: true },
  ]);

  const getBugsForColumn = (columnId: string) => {
    return filteredBugs.filter(bug => bug.status === columnId);
  };

  const handleDeleteBug = async (bugId: string) => {
    if (!confirm('Are you sure you want to delete this bug?')) {
      return;
    }

    try {
      await deleteBug(bugId);
      if (selectedBug?.id === bugId) {
        setSelectedBug(null);
      }
    } catch (error) {
      console.error('Error deleting bug:', error);
    }
  };

  const handleEditBug = (bug: BugType) => {
    setSelectedBug(bug);
  };

  const handleStatusChange = async (bugId: string, newStatus: BugStatus) => {
    try {
      await updateBug(bugId, { status: newStatus });
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  const handleAddColumn = () => {
    const newColumnId = `custom-${Date.now()}`;
    const newColumn: KanbanColumn = {
      id: newColumnId,
      title: 'New Column',
      color: 'bg-primary/5 border-primary/20',
      isDefault: false
    };
    setKanbanColumns([...kanbanColumns, newColumn]);
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = kanbanColumns.find(col => col.id === columnId);
    if (column?.isDefault) {
      alert('Cannot delete default columns');
      return;
    }
    
    if (confirm(`Are you sure you want to delete the column "${column?.title}"? All bugs in this column will be moved to "New".`)) {
      // Move bugs to "new" column
      const bugsInColumn = getBugsForColumn(columnId);
      bugsInColumn.forEach(async (bug) => {
        await handleStatusChange(bug.id, 'new');
      });
      
      // Remove column
      setKanbanColumns(prev => prev.filter(col => col.id !== columnId));
    }
  };

  const handleEditColumnTitle = (columnId: string) => {
    const column = kanbanColumns.find(col => col.id === columnId);
    if (column) {
      setEditingColumn(columnId);
      setEditingColumnTitle(column.title);
    }
  };

  const handleSaveColumnTitle = (columnId: string) => {
    setKanbanColumns(prev => 
      prev.map(col => 
        col.id === columnId 
          ? { ...col, title: editingColumnTitle }
          : col
      )
    );
    setEditingColumn(null);
    setEditingColumnTitle('');
  };

  const handleDragStart = (e: React.DragEvent, bugId: string) => {
    e.dataTransfer.setData('bugId', bugId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: BugStatus) => {
    e.preventDefault();
    const bugId = e.dataTransfer.getData('bugId');
    if (bugId) {
      await handleStatusChange(bugId, targetStatus);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setFilterStatus([]);
    setFilterPriority([]);
    setSearchTerm('');
  };

  if (projectsLoading || bugsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loading size="lg" text="Loading project..." />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/projects')}
              className="btn-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      <Navigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Project Header - Fixed at top */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Breadcrumb 
                items={[
                  { label: 'Projects' },
                  { label: project.name }
                ]}
                showBackButton={true}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsBugFormOpen(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Bug
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters - Fixed below header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowFilterPopup(!showFilterPopup)}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  filterStatus.length > 0 || filterPriority.length > 0
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {/* Filter Popup */}
              {showFilterPopup && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Filter Bugs</h3>
                      <button
                        onClick={() => setShowFilterPopup(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="space-y-2">
                          {kanbanColumns.map((column) => (
                            <label key={column.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filterStatus.includes(column.id as BugStatus)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterStatus([...filterStatus, column.id as BugStatus]);
                                  } else {
                                    setFilterStatus(filterStatus.filter(s => s !== column.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize">{column.title}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <div className="space-y-2">
                          {['low', 'medium', 'high', 'critical'].map((priority) => (
                            <label key={priority} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filterPriority.includes(priority)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterPriority([...filterPriority, priority]);
                                  } else {
                                    setFilterPriority(filterPriority.filter(p => p !== priority));
                                  }
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize">{priority}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear all
                      </button>
                      <button
                        onClick={() => setShowFilterPopup(false)}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(filterStatus.length > 0 || filterPriority.length > 0 || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Kanban Board - Takes remaining height */}
        <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
          {kanbanColumns.map((column) => {
            const columnBugs = getBugsForColumn(column.id);
            return (
              <div 
                key={column.id} 
                className="flex-shrink-0 w-80 p-2"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id as BugStatus)}
              >
                <div className={`rounded-lg border ${column.color} h-full flex flex-col`}>
                  <div className="p-3 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      {editingColumn === column.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={editingColumnTitle}
                            onChange={(e) => setEditingColumnTitle(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm font-semibold border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveColumnTitle(column.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {column.title}
                          </h3>
                          <button
                            onClick={() => handleEditColumnTitle(column.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <span className="bg-white text-gray-600 text-sm font-medium px-2 py-1 rounded-full">
                          {columnBugs.length}
                        </span>
                        {!column.isDefault && (
                          <button
                            onClick={() => handleDeleteColumn(column.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Delete column"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                    {columnBugs.map((bug) => (
                      <div
                        key={bug.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, bug.id)}
                        className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleEditBug(bug)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
                            #{bug.id.slice(-3)}: {bug.title}
                          </h4>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {bug.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(bug.priority)}`}>
                            {bug.priority}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {bug.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        
                        {bug.assignee && (
                          <div className="text-xs text-gray-500 mb-2">
                            Assigned to: {bug.assignee}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {bug.comments?.length || 0} comments
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newStatus = bug.status === 'closed' ? 'new' : 'closed';
                              handleStatusChange(bug.id, newStatus);
                            }}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark bug as complete"
                          >
                            {bug.status === 'closed' ? (
                              <CheckSquare className="w-4 h-4 text-green-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {columnBugs.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Bug className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No bugs</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Add Column Button */}
          <div className="flex-shrink-0 w-80 p-2">
            <button
              onClick={handleAddColumn}
              className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Bug Details Absolute Panel */}
      {selectedBug && (
        <div className="absolute bottom-0 right-0 w-1/3 h-3/4 bg-white border-l border-gray-200 shadow-xl z-40">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="font-semibold text-gray-900">
                Bug #{selectedBug.id.slice(-3)} | {selectedBug.status}
              </h3>
              <p className="text-sm text-gray-500">
                Reported {selectedBug.createdAt.toLocaleDateString()} at {selectedBug.createdAt.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedBug(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Content - Vertical Scrolling */}
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedBug.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedBug.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <div className="relative">
                  <button 
                    className="flex items-center px-3 py-2 bg-primary text-white rounded-lg text-sm"
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  >
                    Mark as Done
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {/* Column Dropdown */}
                  {showColumnDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {kanbanColumns.map((column) => (
                          <button
                            key={column.id}
                            onClick={() => {
                              handleStatusChange(selectedBug.id, column.id as BugStatus);
                              setShowColumnDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Move to {column.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteBug(selectedBug.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>

              {/* Bug Details - Vertical Layout */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">SEVERITY:</span>
                  <select className="text-sm border border-gray-300 rounded px-3 py-2 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Not set</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">ASSIGNED TO:</span>
                  <button className="flex items-center text-sm text-primary hover:text-primary/80">
                    <User className="w-4 h-4 mr-1" />
                    {selectedBug.assignee || 'Assign user'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">TAGS:</span>
                  <button className="flex items-center text-sm text-primary hover:text-primary/80">
                    <Tag className="w-4 h-4 mr-1" />
                    + New tag
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">DUE DATE:</span>
                  <button className="flex items-center text-sm text-primary hover:text-primary/80">
                    <Clock className="w-4 h-4 mr-1" />
                    Select date
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">ATTACHMENTS:</span>
                  <button className="flex items-center text-sm text-primary hover:text-primary/80">
                    <Paperclip className="w-4 h-4 mr-1" />
                    Attach File
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">TECHNICAL INFO:</span>
                  <button className="text-sm text-primary hover:text-primary/80">
                    Show details
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">COMMENTS:</span>
                  <button className="text-sm text-primary hover:text-primary/80">
                    View log
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  {selectedBug.comments?.map((comment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs mr-2">
                            {comment.userName?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {comment.userName || 'User'} | {comment.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <textarea
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-primary text-white rounded text-sm">
                        Add
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                        Cancel
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">All users</span>
                      <div className="w-8 h-4 bg-primary rounded-full relative">
                        <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bug Form Modal */}
      <BugForm
        isOpen={isBugFormOpen}
        onClose={() => {
          setIsBugFormOpen(false);
          setSelectedBug(null);
        }}
        bug={selectedBug}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectDetail; 