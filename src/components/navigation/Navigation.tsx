import React from 'react';
import { ClipboardList, Users, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import MenuItem from './MenuItem';

interface NavigationProps {
  onNavigate: (path: string) => void; // Nueva función para manejar la navegación
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const { isAdmin } = useAuthStore();

  const menuItems = [
    {
      name: 'Tareas',
      icon: ClipboardList,
      path: '/dashboard',
      show: true,
    },
    {
      name: 'Usuarios',
      icon: Users,
      path: '/users',
      show: isAdmin(),
    },
    {
      name: 'Registros',
      icon: FileText,
      path: '/logs',
      show: isAdmin(),
    },
  ];

  return (
    <nav className="flex-1 mt-5 px-2">
      <div className="space-y-1">
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <MenuItem
              key={item.path}
              name={item.name}
              path={item.path}
              icon={item.icon}
              onClick={() => onNavigate(item.path)} // Usamos onNavigate
            />
          ))}
      </div>
    </nav>
  );
}
