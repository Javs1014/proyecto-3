import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../lib/supabase';
import { useProfile } from './useProfile';
import { toast } from 'react-hot-toast';

export function useRecipes() {
  const { profile } = useProfile();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('recipes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recipes'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecipes(current => [...current, payload.new as Recipe]);
          } else if (payload.eventType === 'UPDATE') {
            setRecipes(current =>
              current.map(recipe =>
                recipe.id === payload.new.id ? { ...recipe, ...payload.new } : recipe
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRecipes(current =>
              current.filter(recipe => recipe.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchRecipes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name');

      if (error) throw error;
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Error al cargar las recetas');
    } finally {
      setLoading(false);
    }
  }

  async function addRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) {
    try {
      if (profile?.role !== 'admin') {
        throw new Error('Solo los administradores pueden gestionar recetas');
      }

      const { error } = await supabase
        .from('recipes')
        .insert([recipe]);

      if (error) throw error;
      toast.success('Receta agregada exitosamente');
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast.error('Error al agregar la receta');
      throw error;
    }
  }

  async function updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      if (profile?.role !== 'admin') {
        throw new Error('Solo los administradores pueden gestionar recetas');
      }

      const { error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Receta actualizada exitosamente');
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Error al actualizar la receta');
      throw error;
    }
  }

  async function deleteRecipe(id: string) {
    try {
      if (profile?.role !== 'admin') {
        throw new Error('Solo los administradores pueden gestionar recetas');
      }

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Receta eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Error al eliminar la receta');
      throw error;
    }
  }

  return {
    recipes,
    loading,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    isAdmin: profile?.role === 'admin'
  };
}