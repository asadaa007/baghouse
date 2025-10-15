import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'quick';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (...args: any[]) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-white focus:ring-primary/50 shadow-sm',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary/50 shadow-sm',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500/50',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50 shadow-sm',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500/50 shadow-sm',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500/50 shadow-sm',
    quick: 'w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out group hover:shadow-md hover:border-gray-300',
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`;
  
  const renderIcon = () => {
    if (loading) {
      return (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    
    if (Icon) {
      const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
      const iconClasses = iconPosition === 'left' ? `mr-2 ${iconSize}` : `ml-2 ${iconSize}`;
      
      return (
        <Icon className={`${iconClasses} transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12`} />
      );
    }
    
    return null;
  };

  // Special handling for quick variant
  if (variant === 'quick') {
    return (
      <button
        type={type}
        className={classes}
        onClick={onClick}
        disabled={disabled || loading}
      >
        <span className="text-sm font-medium text-gray-900">{children}</span>
        {Icon && (
          <div className="relative">
            <Icon className="w-4 h-4 text-gray-400 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12" />
          </div>
        )}
      </button>
    );
  }
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default Button;
