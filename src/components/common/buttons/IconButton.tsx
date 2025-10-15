import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  title,
  type = 'button',
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
  
  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500/50 shadow-sm hover:shadow-md',
    ghost: 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 focus:ring-gray-500/50 shadow-sm hover:shadow-md',
    danger: 'text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 focus:ring-red-500/50 shadow-sm hover:shadow-md',
    success: 'text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 focus:ring-green-500/50 shadow-sm hover:shadow-md',
    warning: 'text-yellow-600 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500/50 shadow-sm hover:shadow-md',
  };
  
  const sizeClasses = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Icon className={`${iconSizes[size]} transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12`} />
    </button>
  );
};

export default IconButton;
