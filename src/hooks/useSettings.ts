// hooks/useSettings.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StoreSetting } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { useProfile } from './useProfile';
import { toast } from 'react-hot-toast';

export function useSettings() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [settings, setSettings] = useState<StoreSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    const subscription = supabase
      .channel('settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'store_settings'
        },
        (payload) => {
          console.log('Received settings update:', payload);
          setSettings(payload.new as StoreSetting);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data || null);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }

  async function updateSettings(updates: Partial<Omit<StoreSetting, 'id' | 'updated_at' | 'updated_by'>>) {
    try {
      if (!user) throw new Error('Usuario no autenticado');
      if (profile?.role !== 'admin') {
        throw new Error('Solo los administradores pueden modificar la configuración');
      }

      if (!settings?.id) {
        // Create a new settings record if none exists
        const { data, error } = await supabase
          .from('store_settings')
          .insert({ ...updates, updated_by: user.id })
          .select()
          .single();
        if (error) throw error;
        setSettings(data);
        toast.success('Configuración creada exitosamente');
      } else {
        const { error } = await supabase
          .from('store_settings')
          .update({ ...updates, updated_by: user.id })
          .eq('id', settings.id);
        if (error) throw error;
        toast.success('Configuración actualizada exitosamente');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Error al actualizar la configuración');
      throw error;
    }
  }

  return {
    settings,
    loading,
    updateSettings,
    isAdmin: profile?.role === 'admin'
  };
}