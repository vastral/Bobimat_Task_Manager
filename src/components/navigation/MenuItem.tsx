import React from 'react';
import { useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MenuItemProps {
  name: string;
  path: string;
  icon: LucideIcon;
  onClick: () => void;
}

export default function MenuItem({ name, path, icon: Icon, onClick }: MenuItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex items-center px-2 py-2 text-base font-medium rounded-md w-full transition-colors duration-200',
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon
        className={cn(
          'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
          isActive
            ? 'text-blue-600'
            : 'text-gray-400 group-hover:text-gray-500'
        )}
      />
      {name}
    </button>
  );
}
