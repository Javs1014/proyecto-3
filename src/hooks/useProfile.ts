import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { toast } from 'react-hot-toast';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    if (user?.id) {
      getProfile();
      fetchUsers();
    }
  }, [user?.id]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!user?.id) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }

      setProfile(data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    }
  }

  async function createUser(email: string, password: string, role: 'admin' | 'empleado', name: string) {
    try {
      if (profile?.role !== 'admin') {
        throw new Error('Solo los administradores pueden crear usuarios');
      }

      // Create auth user
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!newUser) throw new Error('Error al crear usuario');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: newUser.id,
          role,
          name,
          email
        }]);

      if (profileError) throw profileError;

      toast.success('Usuario creado exitosamente');
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
      throw error;
    }
  }

  async function updateUser(userId: string, updates: { role?: 'admin' | 'empleado'; name?: string; email?: string }) {
    try {
      if (profile?.role !== 'admin' && userId !== user?.id) {
        throw new Error('No tienes permisos para actualizar este usuario');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      if (userId === user?.id) {
        await getProfile();
      }

      toast.success('Usuario actualizado exitosamente');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
      throw error;
    }
  }

  async function deleteUser(userId: string) {
    try {
      if (profile?.role !== 'admin') {
        throw new Error('Solo los administradores pueden eliminar usuarios');
      }

      if (userId === user?.id) {
        throw new Error('No puedes eliminar tu propio usuario');
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuario eliminado exitosamente');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
      throw error;
    }
  }

  async function updatePassword(userId: string, newPassword: string) {
    try {
      if (!profile?.role) throw new Error('No autorizado');

      if (profile.role !== 'admin' && userId !== user?.id) {
        throw new Error('No tienes permisos para cambiar la contraseña de otro usuario');
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;
      
      toast.success('Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error al actualizar la contraseña');
      throw error;
    }
  }

  return {
    profile,
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    updatePassword,
    isAdmin: profile?.role === 'admin'
  };
}