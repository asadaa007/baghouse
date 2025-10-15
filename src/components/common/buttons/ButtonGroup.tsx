import React from 'react';

export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
}) => {
  const baseClasses = 'inline-flex';
  
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };
  
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    md: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    lg: orientation === 'horizontal' ? 'space-x-3' : 'space-y-3',
  };
  
  const classes = `${baseClasses} ${orientationClasses[orientation]} ${spacingClasses[spacing]} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default ButtonGroup;
