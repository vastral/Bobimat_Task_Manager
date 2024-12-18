import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/task/new')}
              className="hidden sm:flex"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nueva Tarea</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/task/new')}
              className="sm:hidden"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/task/search')}
              className="hidden sm:flex"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Buscar Tarea</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/task/search')}
              className="sm:hidden"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
