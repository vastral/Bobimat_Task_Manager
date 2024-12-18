import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { isValidEmail } from '../lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Nuevo estado para la contraseña
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      toast.error('Por favor, introduce un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      // Primero, verificamos si el usuario existe en la tabla 'users'
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        toast.error('Usuario no autorizado');
        return;
      }

      // Si el usuario es administrador, necesitamos que haya contraseña y autenticación con Supabase Auth
      if (user.role === 'Administrador') {
        if (!password) {
          toast.error('Por favor, introduce la contraseña');
          return;
        }

        // Intentamos iniciar sesión en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          // Si falla la autenticación, no permitimos el acceso
          toast.error('Contraseña incorrecta o error al iniciar sesión');
          return;
        }

        // Si la autenticación es correcta, guardamos el usuario y navegamos
        setUser(user);
        navigate('/dashboard');
        toast.success('Bienvenido/a ' + user.name);

      } else {
        // Si no es administrador, no requerimos contraseña ni autenticación formal
        setUser(user);
        navigate('/dashboard');
        toast.success('Bienvenido/a ' + user.name);
      }

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-8">
          Tareas Bobimat SL
        </h1>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ejemplo@bobimat.es"
                />
              </div>
            </div>
            
            {/* Nuevo campo de contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña (sólo requerida si eres administrador)
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accediendo...
                </>
              ) : (
                'Acceder'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
