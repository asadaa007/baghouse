import React from 'react';
import { Link } from 'react-router-dom';
import { Bug, Plus, Clock, User, MessageSquare } from 'lucide-react';
import { Button } from '../common/buttons';
import type { Bug as BugType } from '../../types/bugs';

interface RecentBugsListProps {
  bugs: BugType[];
  onNewBug: () => void;
  loading?: boolean;
}

const RecentBugsList: React.FC<RecentBugsListProps> = ({
  bugs,
  onNewBug,
  loading = false
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'revision': return 'bg-orange-100 text-orange-800';
      case 'ready-for-qc': return 'bg-purple-100 text-purple-800';
      case 'in-qc': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bugs</h3>
          <Button 
            onClick={onNewBug}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            New Bug
          </Button>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Bugs</h3>
        <Button 
          onClick={onNewBug}
          variant="primary"
          size="sm"
          icon={Plus}
        >
          New Bug
        </Button>
      </div>
      
      {bugs.length === 0 ? (
        <div className="text-center py-8">
          <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No bugs yet</h4>
          <p className="text-gray-600 mb-4">Get started by creating your first bug report.</p>
          <Button 
            onClick={onNewBug}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Create First Bug
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bugs.slice(0, 5).map((bug) => (
            <Link
              key={bug.id}
              to={`/bugs/${bug.id}`}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(bug.priority)}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                    {bug.title}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">{bug.id}</span>
                    {bug.projectName && (
                      <span className="text-sm text-gray-500">{bug.projectName}</span>
                    )}
                    {bug.assignee && (
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        {bug.assignee}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-4">
                {bug.comments && bug.comments.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {bug.comments.length}
                  </div>
                )}
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bug.status)}`}>
                  {bug.status}
                </span>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeAgo(bug.createdAt)}
                </div>
              </div>
            </Link>
          ))}
          
          {bugs.length > 5 && (
            <div className="text-center pt-4">
              <Link
                to="/bugs"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View all {bugs.length} bugs →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentBugsList; 