import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { TaskStatus } from '../types';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreateTask() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Taller');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Check if task already exists
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('reference', reference)
        .single();

      if (existingTask) {
        const goToExisting = window.confirm(
          'Esta tarea ya existe, ¿quieres ir a verla?'
        );
        if (goToExisting) {
          navigate(`/task/${existingTask.id}`);
        }
        return;
      }

      // Create new task
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([
          {
            reference,
            status,
            previous_status: null,
            created_by: user.email,
            updated_by: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Create log entry
      await supabase.from('logs').insert({
        task_reference: reference,
        previous_status: null,
        new_status: status,
        user_email: user.email,
        user_name: user.name,
        timestamp: new Date().toISOString(),
      });

      toast.success('Tarea creada correctamente');
      navigate(`/task/${newTask.id}`);
    } catch (error) {
      toast.error('Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al dashboard
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Crear Nueva Tarea</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de referencia
              </label>
              <Input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                placeholder="Introduce el número de referencia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado inicial
              </label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                required
              >
                <option value="Taller">Taller</option>
                <option value="Presupuesto">Presupuesto</option>
                <option value="Pendiente de repuesto">Pendiente de repuesto</option>
                <option value="Hecho">Hecho</option>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Tarea'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
