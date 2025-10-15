import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

// Minimal, professional breadcrumb used across the app
const BreadcrumbNew: React.FC<BreadcrumbProps> = ({ items, showBackButton = false, className }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-500 mb-8 pb-4 border-b border-gray-200 ${className || ''}`}>
      {showBackButton && (
        <Link
          to=".."
          className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
      )}

      <Link to="/dashboard" className="flex items-center text-gray-400 hover:text-gray-600 transition-colors" title="Home">
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-300">/</span>
          {item.href ? (
            <Link
              to={item.href}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNew;


