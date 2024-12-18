import { createClient } from '@supabase/supabase-js';

// Obtén las variables de entorno usando import.meta.env (en Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no están definidas.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema and policies:
/*
-- Drop existing policies
drop policy if exists "Users can view all users" on users;
drop policy if exists "Only admins can insert users" on users;
drop policy if exists "Only admins can update users" on users;
drop policy if exists "Only admins can delete users" on users;

-- Create new policies for users table
create policy "Enable read access for all users"
  on users for select
  using (true);

create policy "Enable insert for administrators"
  on users for insert
  with check (
    exists (
      select 1 from users
      where users.email = auth.jwt()->>'email'
      and users.role = 'Administrador'
    )
  );

create policy "Enable update for administrators"
  on users for update
  using (
    exists (
      select 1 from users
      where users.email = auth.jwt()->>'email'
      and users.role = 'Administrador'
    )
  );

create policy "Enable delete for administrators"
  on users for delete
  using (
    exists (
      select 1 from users
      where users.email = auth.jwt()->>'email'
      and users.role = 'Administrador'
    )
  );

-- Ensure RLS is enabled
alter table users enable row level security;
*/

// Helper function to check if user is admin
export const isUserAdmin = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data?.role === 'Administrador';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
