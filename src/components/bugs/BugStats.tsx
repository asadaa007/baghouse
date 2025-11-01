import React from 'react';
import { 
  Bug, 
  AlertCircle, 
  CheckCircle, 
  XCircle,Users,
  MessageSquare
} from 'lucide-react';
import type { Bug as BugType } from '../../types/bugs';

interface BugStatsProps {
  bugs: BugType[];
}

const BugStats: React.FC<BugStatsProps> = ({ bugs }) => {
  const totalBugs = bugs.length;
  const openBugs = bugs.filter(bug => bug.status === 'new' || bug.status === 'in-progress').length;
  const resolvedBugs = bugs.filter(bug => bug.status === 'completed').length;
  const closedBugs = bugs.filter(bug => bug.status === 'completed').length;
  const criticalBugs = bugs.filter(bug => bug.priority === 'critical').length;
  const highPriorityBugs = bugs.filter(bug => bug.priority === 'high').length;
  const assignedBugs = bugs.filter(bug => bug.assignee).length;
  const totalComments = bugs.reduce((sum, bug) => sum + (bug.comments?.length || 0), 0);

  const resolutionRate = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0;
  const avgCommentsPerBug = totalBugs > 0 ? Math.round((totalComments / totalBugs) * 10) / 10 : 0;

  const stats = [
    {
      title: 'Total Bugs',
      value: totalBugs,
      icon: Bug,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All reported bugs'
    },
    {
      title: 'Open Bugs',
      value: openBugs,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Requires attention'
    },
    {
      title: 'Resolved',
      value: resolvedBugs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${resolutionRate}% resolution rate`
    },
    {
      title: 'Critical',
      value: criticalBugs,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'High priority issues'
    },
    {
      title: 'High Priority',
      value: highPriorityBugs,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Important issues'
    },
    {
      title: 'Assigned',
      value: assignedBugs,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'With assignees'
    },
    {
      title: 'Avg Comments',
      value: avgCommentsPerBug,
      icon: MessageSquare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Per bug'
    },
    {
      title: 'Closed',
      value: closedBugs,
      icon: CheckCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      description: 'Completed bugs'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BugStats; 