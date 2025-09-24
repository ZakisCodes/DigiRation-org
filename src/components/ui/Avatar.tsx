'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
  };

  const baseClasses = 'rounded-full bg-gray-200 flex items-center justify-center overflow-hidden';
  const classes = `${baseClasses} ${sizeClasses[size]} ${className}`.trim();

  // Generate initials from alt text if no fallback provided
  const initials = fallback || alt
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <div className={classes}>
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide image on error, show fallback
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Fallback initials (hidden by default, shown when image fails) */}
        <div className="w-full h-full flex items-center justify-center font-medium text-gray-600 bg-gray-200">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className={`${classes} font-medium text-gray-600`}>
      {initials}
    </div>
  );
};

export default Avatar;