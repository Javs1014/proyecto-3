import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { InventoryItem } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { toast } from 'react-hot-toast';

export function useInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
    
    // Subscribe to all inventory changes
    const mainChannel = supabase
      .channel('inventory_main')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        handleInventoryChange
      )
      .subscribe();

    // Subscribe to category-specific channels
    const categoryChannels = ['ingredient', 'packaging', 'equipment'].map(category =>
      supabase
        .channel(`inventory_${category}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_items',
            filter: `category=eq.${category}`
          },
          handleInventoryChange
        )
        .subscribe()
    );

    // Subscribe to low stock alerts
    const alertChannel = supabase
      .channel('low_stock_alerts')
      .on(
        'broadcast',
        { event: 'low_stock_alert' },
        () => {
          toast.warning('¡Alerta! Productos con stock bajo');
        }
      )
      .subscribe();

    return () => {
      mainChannel.unsubscribe();
      categoryChannels.forEach(channel => channel.unsubscribe());
      alertChannel.unsubscribe();
    };
  }, []);

  const handleInventoryChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setItems(current => {
        // Check for duplicates before adding
        const exists = current.some(item => 
          item.name === payload.new.name && 
          item.category === payload.new.category
        );
        if (exists) return current;
        return [...current, payload.new as InventoryItem];
      });
      toast.success(`${payload.new.name} agregado al inventario`);
    } else if (payload.eventType === 'UPDATE') {
      setItems(current =>
        current.map(item =>
          item.id === payload.new.id ? { ...item, ...payload.new } : item
        )
      );
      
      const updatedItem = payload.new as InventoryItem;
      if (updatedItem.quantity <= updatedItem.reorder_level) {
        toast.warning(`¡Stock bajo para ${updatedItem.name}!`);
      }
    } else if (payload.eventType === 'DELETE') {
      setItems(current =>
        current.filter(item => item.id !== payload.old.id)
      );
      toast.success(`${payload.old.name} eliminado del inventario`);
    }
  };

  async function fetchInventory() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Remove duplicates based on name and category
      const uniqueItems = data.reduce((acc, current) => {
        const exists = acc.some(item => 
          item.name === current.name && 
          item.category === current.category
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, [] as InventoryItem[]);
      
      setItems(uniqueItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }

  async function addItem(item: Omit<InventoryItem, 'id' | 'last_updated' | 'updated_by'>) {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      // Validate item
      if (item.quantity < 0) throw new Error('La cantidad no puede ser negativa');
      if (item.reorder_level < 0) throw new Error('El nivel mínimo no puede ser negativo');
      if (!['ingredient', 'packaging', 'equipment'].includes(item.category)) {
        throw new Error('Categoría inválida');
      }

      // Check for duplicates
      const duplicate = items.find(
        i => i.name.toLowerCase() === item.name.toLowerCase() && 
        i.category === item.category
      );

      if (duplicate) {
        throw new Error('Ya existe un producto con el mismo nombre en esta categoría');
      }

      const { error } = await supabase
        .from('inventory_items')
        .insert([{ ...item, updated_by: user.id }]);

      if (error) throw error;
      toast.success('Producto agregado exitosamente');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar el producto');
      throw error;
    }
  }

  async function updateItem(
    id: string,
    updates: Partial<Omit<InventoryItem, 'id' | 'last_updated' | 'updated_by'>>
  ) {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      // Validate updates
      if (updates.quantity !== undefined && updates.quantity < 0) {
        throw new Error('La cantidad no puede ser negativa');
      }
      if (updates.reorder_level !== undefined && updates.reorder_level < 0) {
        throw new Error('El nivel mínimo no puede ser negativo');
      }
      if (updates.category && !['ingredient', 'packaging', 'equipment'].includes(updates.category)) {
        throw new Error('Categoría inválida');
      }

      const { error } = await supabase
        .from('inventory_items')
        .update({ ...updates, updated_by: user.id })
        .eq('id', id);

      if (error) throw error;
      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el producto');
      throw error;
    }
  }

  async function deleteItem(id: string) {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar el producto');
      throw error;
    }
  }

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category === category);
  };

  const getLowStockItems = () => {
    return items.filter(item => item.quantity <= item.reorder_level);
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getItemsByCategory,
    getLowStockItems
  };
}