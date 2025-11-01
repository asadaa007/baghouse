import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bug,
  CheckCircle,
  MessageSquare,
  UserPlus,
  Folder,
  Edit,
  XCircle,
  Clock,
  // AlertTriangle
} from 'lucide-react';
import type { ActivityItem } from '../../services/activityService';

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  showProject?: boolean;
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  loading = false, 
  showProject = true, 
  maxItems = 10 
}) => {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bug_created':
        return Bug;
      case 'bug_updated':
        return Edit;
      case 'bug_resolved':
        return CheckCircle;
      case 'bug_closed':
        return XCircle;
      case 'comment_added':
        return MessageSquare;
      case 'user_joined':
      case 'member_added':
        return UserPlus;
      case 'project_created':
      case 'project_updated':
        return Folder;
      case 'team_created':
        return UserPlus;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'bug_created':
        return 'text-blue-500 bg-blue-100';
      case 'bug_updated':
        return 'text-yellow-500 bg-yellow-100';
      case 'bug_resolved':
        return 'text-green-500 bg-green-100';
      case 'bug_closed':
        return 'text-gray-500 bg-gray-100';
      case 'comment_added':
        return 'text-purple-500 bg-purple-100';
      case 'user_joined':
      case 'member_added':
        return 'text-indigo-500 bg-indigo-100';
      case 'project_created':
        return 'text-green-500 bg-green-100';
      case 'project_updated':
        return 'text-orange-500 bg-orange-100';
      case 'team_created':
        return 'text-cyan-500 bg-cyan-100';
      default:
        return 'text-gray-500 bg-gray-100';
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
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
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

  if (displayActivities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
        {displayActivities.map((activity) => {
          const IconComponent = getActivityIcon(activity.type);
          const colorClasses = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                {showProject && activity.projectName && (
                  <p className="text-xs text-gray-500 mt-1">in {activity.projectName}</p>
                )}
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">
                    by {activity.userName}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {activities.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link 
            to="/activities" 
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;