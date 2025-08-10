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
  Upload} from 'lucide-react';

interface QuickActionsProps {
  onNewBug: () => void;
  onNewProject: () => void;
  onImportBugs: () => void;
  onExportData: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onNewBug,
  onImportBugs,
  onExportData
}) => {
  const actions = [
    {
      icon: Plus,
      label: 'Report New Bug',
      onClick: onNewBug,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Users,
      label: 'Manage Projects',
      to: '/projects',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          if (action.to) {
            return (
              <Link
                key={index}
                to={action.to}
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <span className="ml-3 text-sm font-medium">{action.label}</span>
              </Link>
            );
          }
          
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group text-left"
            >
              <div className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <span className="ml-3 text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions; 