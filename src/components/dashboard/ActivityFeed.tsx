import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'bug_created' | 'bug_updated' | 'bug_resolved' | 'comment_added' | 'user_joined' | 'project_created';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  projectId?: string;
  projectName?: string;
  bugId?: string;
  bugTitle?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {


  const getActivityColor = (type: string) => {
    switch (type) {
      case 'bug_created':
        return 'bg-blue-100';
      case 'bug_updated':
        return 'bg-yellow-100';
      case 'bug_resolved':
        return 'bg-green-100';
      case 'comment_added':
        return 'bg-purple-100';
      case 'user_joined':
        return 'bg-indigo-100';
      case 'project_created':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h4>
          <p className="text-gray-600">Activity will appear here as you use the system.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type).replace('bg-', 'bg-').replace('-100', '-500')}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {activity.title}
                  {activity.bugId && (
                    <Link 
                      to={`/bugs/${activity.bugId}`}
                      className="text-primary hover:text-primary/80 font-medium ml-1"
                    >
                      #{activity.bugId}
                    </Link>
                  )}
                  {activity.projectId && (
                    <Link 
                      to={`/projects/${activity.projectId}`}
                      className="text-primary hover:text-primary/80 font-medium ml-1"
                    >
                      {activity.projectName}
                    </Link>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                  {activity.userName && ` by ${activity.userName}`}
                </p>
              </div>
            </div>
          ))}
          
          {activities.length > 8 && (
            <div className="text-center pt-4">
              <Link
                to="/activity"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View all activity →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 