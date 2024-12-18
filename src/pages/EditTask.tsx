import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [newReference, setNewReference] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTask(data);
      setNewReference(data.reference);
    } catch (error) {
      toast.error('Error al cargar la tarea');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !user) return;

    setUpdating(true);
    try {
      // Check if reference already exists
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('reference', newReference)
        .neq('id', task.id)
        .single();

      if (existingTask) {
        toast.error('Esta referencia ya existe');
        return;
      }

      // First, update all logs with the old reference
      const { error: logsError } = await supabase
        .from('logs')
        .update({ task_reference: newReference })
        .eq('task_reference', task.reference);

      if (logsError) throw logsError;

      // Then update the task reference
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          reference: newReference,
          updated_by: user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (taskError) throw taskError;

      // Create a new log entry for the reference change
      const { error: newLogError } = await supabase
        .from('logs')
        .insert({
          task_reference: newReference,
          previous_status: task.status,
          new_status: task.status,
          user_email: user.email,
          user_name: user.name,
          timestamp: new Date().toISOString(),
        });

      if (newLogError) throw newLogError;

      toast.success('Referencia actualizada correctamente');
      navigate(`/task/${task.id}`);
    } catch (error) {
      console.error('Error updating reference:', error);
      toast.error('Error al actualizar la referencia');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/task/${id}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a la tarea
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Editar Referencia
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleUpdateReference} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencia actual
              </label>
              <p className="text-gray-900 mb-4">{task.reference}</p>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva referencia
              </label>
              <Input
                type="text"
                value={newReference}
                onChange={(e) => setNewReference(e.target.value)}
                required
                placeholder="Introduce la nueva referencia"
              />
            </div>

            <Button type="submit" className="w-full" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Referencia'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
