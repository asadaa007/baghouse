import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Bug, 
  BarChart3, 
  Settings, 
  FileText, 
  Download,
  Upload,
  Calendar,
  Target,
  UserPlus,
  Shield,
  type LucideIcon
} from 'lucide-react';
import { IconButton } from '../common/buttons';

interface QuickActionsProps {
  onNewBug: () => void;
  onNewProject: () => void;
  onImportBugs: () => void;
  onExportData: () => void;
}

interface ActionItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  to?: string;
  color?: string;
  bgColor?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onNewBug,
  onNewProject,
  onImportBugs,
  onExportData
}) => {
  const primaryActions = [
    {
      icon: Plus,
      label: 'Report New Bug',
      onClick: onNewBug,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Users,
      label: 'Create Project',
      onClick: onNewProject,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: UserPlus,
      label: 'Add Team Member',
      to: '/user-management',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Shield,
      label: 'Manage Teams',
      to: '/teams',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const secondaryActions = [
    {
      icon: Bug,
      label: 'View All Bugs',
      to: '/bugs',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      to: '/analytics',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Calendar,
      label: 'Schedule Meeting',
      onClick: () => console.log('Schedule meeting'),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Target,
      label: 'Performance Review',
      onClick: () => console.log('Performance review'),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  const utilityActions = [
    {
      icon: Settings,
      label: 'Settings',
      to: '/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    {
      icon: FileText,
      label: 'Reports',
      to: '/reports',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Upload,
      label: 'Import Bugs',
      onClick: onImportBugs,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Download,
      label: 'Export Data',
      onClick: onExportData,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    }
  ];

  const renderAction = (action: ActionItem, index: number) => {
    if (action.to) {
      return (
        <Link
          key={index}
          to={action.to}
          className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <IconButton
            icon={action.icon}
            variant="ghost"
            size="sm"
            className="mr-3 pointer-events-none"
          />
          <span className="text-sm font-medium">{action.label}</span>
        </Link>
      );
    }
    
    return (
      <button
        key={index}
        onClick={action.onClick}
        className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group text-left w-full"
      >
        <IconButton
          icon={action.icon}
          variant="ghost"
          size="sm"
          className="mr-3 pointer-events-none"
        />
        <span className="text-sm font-medium">{action.label}</span>
      </button>
    );
  };

  // Combine all actions
  const allActions = [...primaryActions, ...secondaryActions, ...utilityActions];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {allActions.map((action, index) => renderAction(action, index))}
      </div>
    </div>
  );
};

export default QuickActions; 