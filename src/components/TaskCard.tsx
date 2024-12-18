import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Taller':
        return 'bg-yellow-100 text-yellow-800';
      case 'Presupuesto':
        return 'bg-blue-100 text-blue-800';
      case 'Pendiente de repuesto':
        return 'bg-red-100 text-red-800';
      case 'Hecho':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/task/${task.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Ref: {task.reference}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            task.status
          )}`}
        >
          {task.status}
        </span>
      </div>
      
      {task.previous_status && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className={`px-2 py-0.5 rounded ${getStatusColor(task.previous_status)}`}>
            {task.previous_status}
          </span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span className={`px-2 py-0.5 rounded ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>Creado por: {task.created_by}</p>
        <p>
          Fecha: {format(new Date(task.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>
    </div>
  );
}
