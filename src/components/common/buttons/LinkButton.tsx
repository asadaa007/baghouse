import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface LinkButtonProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  external?: boolean;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  to,
  onClick,
  icon: Icon,
  variant = 'default',
  size = 'md',
  className = '',
  external = false,
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 group';
  
  const variantClasses = {
    default: 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:ring-gray-500/50',
    primary: 'text-primary hover:text-primary/80 hover:bg-primary/5 focus:ring-primary/50',
    secondary: 'text-secondary hover:text-secondary/80 hover:bg-secondary/5 focus:ring-secondary/50',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:ring-gray-500/50',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  const renderIcon = () => {
    if (Icon) {
      return (
        <Icon className="w-4 h-4 mr-2 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12" />
      );
    }
    return null;
  };

  // If onClick is provided, render as a button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={classes}
        type="button"
      >
        {renderIcon()}
        {children}
      </button>
    );
  }

  // If external is true, render as external link
  if (external && to) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {renderIcon()}
        {children}
      </a>
    );
  }
  
  // Default: render as internal Link (requires to prop)
  if (to) {
    return (
      <Link to={to} className={classes}>
        {renderIcon()}
        {children}
      </Link>
    );
  }

  // Fallback: render as button if no to prop provided
  return (
    <button
      className={classes}
      type="button"
      disabled
    >
      {renderIcon()}
      {children}
    </button>
  );
};

export default LinkButton;
