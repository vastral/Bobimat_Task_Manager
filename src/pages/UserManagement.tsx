import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase, isUserAdmin } from '../lib/supabase';
import { User, Role } from '../types';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import TableContainer from '../components/ui/TableContainer';
import { Loader2, Plus, Trash2, Save, X } from 'lucide-react';
import { isValidEmail } from '../lib/utils';

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Operario' as Role,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!isValidEmail(newUser.email)) {
      toast.error('Por favor, introduce un correo electrónico válido');
      return;
    }

    try {
      // Check admin status
      const isAdmin = await isUserAdmin(currentUser.email);
      if (!isAdmin) {
        toast.error('No tienes permisos para realizar esta acción');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{ ...newUser, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Ya existe un usuario con ese correo electrónico');
        } else {
          throw error;
        }
        return;
      }

      await fetchUsers();
      setNewUser({ name: '', email: '', role: 'Operario' });
      toast.success('Usuario creado correctamente');
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Error al crear el usuario');
    }
  };

  const startEditing = (user: User) => {
    setEditingId(user.id);
    setEditingUser({ ...user });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingUser(null);
  };

  const handleUpdateUser = async (user: User) => {
    if (!currentUser) return;

    if (!isValidEmail(user.email)) {
      toast.error('Por favor, introduce un correo electrónico válido');
      return;
    }

    try {
      // Check admin status
      const isAdmin = await isUserAdmin(currentUser.email);
      if (!isAdmin) {
        toast.error('No tienes permisos para realizar esta acción');
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          role: user.role,
        })
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Ya existe un usuario con ese correo electrónico');
        } else {
          throw error;
        }
        return;
      }

      await fetchUsers();
      setEditingId(null);
      setEditingUser(null);
      toast.success('Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar el usuario');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!currentUser) return;

    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      // Check admin status
      const isAdmin = await isUserAdmin(currentUser.email);
      if (!isAdmin) {
        toast.error('No tienes permisos para realizar esta acción');
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchUsers();
      toast.success('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Añadir nuevo usuario</h2>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <Input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
              required
            >
              <option value="Operario">Operario</option>
              <option value="Administrador">Administrador</option>
            </Select>
          </div>
          <div className="lg:col-span-3">
            <Button type="submit" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Usuario
            </Button>
          </div>
        </form>
      </div>

      <TableContainer>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo electrónico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === user.id && editingUser ? (
                    <Input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{user.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === user.id && editingUser ? (
                    <Input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{user.email}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === user.id && editingUser ? (
                    <Select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          role: e.target.value as Role,
                        })
                      }
                    >
                      <option value="Operario">Operario</option>
                      <option value="Administrador">Administrador</option>
                    </Select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Administrador'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === user.id && editingUser ? (
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateUser(editingUser)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
}
