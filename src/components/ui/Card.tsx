'use client';

import React from 'react';
import { CardProps } from '@/types';

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  onClick,
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200 p-4';
  const interactiveClasses = interactive 
    ? 'hover:shadow-md active:shadow-lg transition-shadow duration-200 cursor-pointer min-h-touch'
    : '';
  
  const classes = `${baseClasses} ${interactiveClasses} ${className}`.trim();
  
  const CardComponent = onClick ? 'button' : 'div';
  
  return (
    <CardComponent
      className={classes}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </CardComponent>
  );
};

export default Card;