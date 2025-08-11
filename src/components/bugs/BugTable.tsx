import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Edit, 
  Trash2,ChevronUp, 
  ChevronDown,
  MessageSquare,
  Clock,
  User,
  Tag,
  CheckSquare,
  Square
} from 'lucide-react';
import BugViewModal from './BugViewModal';
import type { Bug } from '../../types/bugs';

interface BugTableProps {
  bugs: Bug[];
  onDeleteBug: (bugId: string) => void;
  onBulkDelete: (bugIds: string[]) => void;
  onStatusChange: (bugId: string, status: string) => void;
  onPriorityChange: (bugId: string, priority: string) => void;
  onEditBug?: (bug: Bug) => void;
  loading?: boolean;
}

type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const BugTable: React.FC<BugTableProps> = ({
  bugs,
  onDeleteBug,
  onBulkDelete,
  onStatusChange,
  onPriorityChange,
  onEditBug,
  loading = false
}) => {
  const [selectedBugs, setSelectedBugs] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedBugs = [...bugs].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSelectAll = () => {
    if (selectedBugs.size === bugs.length) {
      setSelectedBugs(new Set());
    } else {
      setSelectedBugs(new Set(bugs.map(bug => bug.id)));
    }
  };

  const handleSelectBug = (bugId: string) => {
    const newSelected = new Set(selectedBugs);
    if (newSelected.has(bugId)) {
      newSelected.delete(bugId);
    } else {
      newSelected.add(bugId);
    }
    setSelectedBugs(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedBugs.size > 0) {
      onBulkDelete(Array.from(selectedBugs));
      setSelectedBugs(new Set());
    }
  };

  const handleViewBug = (bug: Bug) => {
    setSelectedBug(bug);
    setViewModalOpen(true);
  };

  const handleEditBug = (bug: Bug) => {
    onEditBug?.(bug);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-primary" /> : 
      <ChevronDown className="w-4 h-4 text-primary" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
                <div className="h-6 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Bulk Actions */}
        {selectedBugs.size > 0 && (
          <div className="px-6 py-3 bg-primary/5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedBugs.size} bug{selectedBugs.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {selectedBugs.size === bugs.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Priority
                    <SortIcon field="priority" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('assignee')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Team Assignee
                    <SortIcon field="assignee" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  External Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Created
                    <SortIcon field="createdAt" />
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBugs.map((bug) => (
                <tr key={bug.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectBug(bug.id)}
                      className="flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {selectedBugs.has(bug.id) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(bug.priority)} mr-3`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/bugs/${bug.id}`} className="hover:text-primary transition-colors">
                            {bug.title}
                          </Link>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">#{bug.customId || bug.id}</span>
                          {bug.projectName && (
                            <span className="text-sm text-gray-500">{bug.projectName}</span>
                          )}
                          {bug.comments && bug.comments.length > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {bug.comments.length}
                            </div>
                          )}
                          {bug.labels && bug.labels.length > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Tag className="w-3 h-3 mr-1" />
                              {bug.labels.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={bug.status}
                      onChange={(e) => onStatusChange(bug.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(bug.status)} focus:ring-2 focus:ring-primary focus:ring-offset-0`}
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={bug.priority}
                      onChange={(e) => onPriorityChange(bug.id, e.target.value)}
                      className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {bug.assigneeName || bug.assignee || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-purple-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {bug.externalAssigneeName || bug.externalAssignee || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeAgo(bug.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewBug(bug)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View bug"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditBug(bug)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit bug"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBug(bug.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete bug"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedBugs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Bug View Modal */}
      <BugViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedBug(null);
        }}
        bug={selectedBug}
        onEdit={handleEditBug}
        onDelete={onDeleteBug}
      />
    </>
  );
};

export default BugTable; 