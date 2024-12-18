import React from 'react';
import { cn } from '../../lib/utils';

interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function TableContainer({ children, className, ...props }: TableContainerProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className={cn("overflow-x-auto relative", className)} {...props}>
        <div className="inline-block min-w-full align-middle">
          {children}
        </div>
      </div>
    </div>
  );
}
