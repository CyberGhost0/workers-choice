'use client';

import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnline?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({ src, alt, name, size = 'md', className, showOnline, isOnline }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div className={cn(
        'rounded-full overflow-hidden bg-primary/10 flex items-center justify-center',
        sizeClasses[size]
      )}>
        {src ? (
          <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <span className="font-medium text-primary">{getInitials(name || 'U')}</span>
        )}
      </div>
      {showOnline && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full border-2 border-card',
          isOnline ? 'bg-green-500' : 'bg-muted-foreground/40',
          size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
        )} />
      )}
    </div>
  );
}
