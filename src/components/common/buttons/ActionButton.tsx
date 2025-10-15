import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ActionButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
}) => {
  const baseClasses = 'flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group';
  
  const variantClasses = {
    default: 'text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500/50',
    primary: 'bg-primary hover:bg-primary/90 text-white focus:ring-primary/50 shadow-sm',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary/50 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50 shadow-sm',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`;
  
  const renderIcon = () => {
    if (Icon) {
      return (
        <Icon className="w-4 h-4 mr-2 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12" />
      );
    }
    return null;
  };

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {renderIcon()}
      {children}
    </button>
  );
};

export default ActionButton;
