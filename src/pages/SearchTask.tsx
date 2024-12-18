import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, ArrowLeft, Search } from 'lucide-react';
import TaskCard from '../components/TaskCard';

export default function SearchTask() {
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [task, setTask] = useState<Task | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearchPerformed(true);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('reference', reference)
        .single();

      if (error) {
        const createNew = window.confirm(
          'Esta tarea no existe, ¿quieres crearla?'
        );
        if (createNew) {
          navigate('/task/new');
        }
        return;
      }

      setTask(data);
    } catch (error) {
      toast.error('Error al buscar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al dashboard
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Buscar Tarea</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de referencia
              </label>
              <div className="flex space-x-4">
                <Input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  required
                  placeholder="Introduce el número de referencia"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {searchPerformed && !loading && (
          <div>
            {task ? (
              <TaskCard task={task} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                No se encontró ninguna tarea con esa referencia.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
