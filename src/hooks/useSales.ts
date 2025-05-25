import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Sale } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { useInventory } from './useInventory';
import { toast } from 'react-hot-toast';

export function useSales() {
  const { user } = useAuth();
  const { updateItem } = useInventory();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
    
    // Subscribe to sales changes
    const salesChannel = supabase
      .channel('sales_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales'
        },
        handleSaleChange
      )
      .subscribe();

    // Subscribe to low stock alerts
    const alertChannel = supabase
      .channel('low_stock_alerts')
      .on(
        'broadcast',
        { event: 'low_stock_alert' },
        () => {
          toast.warning('¡Alerta! Stock bajo después de la venta');
        }
      )
      .subscribe();

    return () => {
      salesChannel.unsubscribe();
      alertChannel.unsubscribe();
    };
  }, []);

  const handleSaleChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setSales(current => [payload.new as Sale, ...current]);
      toast.success('Venta registrada exitosamente');
    } else if (payload.eventType === 'UPDATE') {
      setSales(current =>
        current.map(sale =>
          sale.id === payload.new.id ? { ...sale, ...payload.new } : sale
        )
      );
    }
  };

  async function fetchSales() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  }

  async function addSale(sale: Omit<Sale, 'id' | 'created_at' | 'created_by'>) {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      // Validate sale data
      if (sale.quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }
      if (sale.total_amount <= 0) {
        throw new Error('El total debe ser mayor a 0');
      }

      // Check inventory before sale
      const { data: popcornItem, error: popcornError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('category', 'ingredient')
        .ilike('name', '%maíz%')
        .single();

      if (popcornError) throw popcornError;
      if (!popcornItem) throw new Error('No hay maíz disponible');

      const popcornNeeded = sale.quantity * 0.05; // 50g per unit
      if (popcornItem.quantity < popcornNeeded) {
        throw new Error('No hay suficiente maíz para esta venta');
      }

      // Register sale
      const { error: saleError } = await supabase
        .from('sales')
        .insert([{ ...sale, created_by: user.id }]);

      if (saleError) throw saleError;

      toast.success('Venta registrada exitosamente');
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar la venta');
      throw error;
    }
  }

  const getSalesByPeriod = (period: 'day' | 'week' | 'month') => {
    const now = new Date();
    let cutoff = new Date();
    
    switch (period) {
      case 'day':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    return sales.filter(sale => new Date(sale.created_at) >= cutoff);
  };

  const getTotalSales = (period: 'day' | 'week' | 'month') => {
    const periodSales = getSalesByPeriod(period);
    return periodSales.reduce((total, sale) => total + Number(sale.total_amount_raw), 0);
  };

  const getSalesByFlavor = (period: 'day' | 'week' | 'month') => {
    const periodSales = getSalesByPeriod(period);
    return periodSales.reduce((acc, sale) => {
      acc[sale.flavor] = (acc[sale.flavor] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);
  };

  const getGrowthRate = () => {
    const currentPeriodSales = getTotalSales('week');
    const previousPeriodSales = sales
      .filter(sale => {
        const saleDate = new Date(sale.created_at);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return saleDate >= twoWeeksAgo && saleDate < oneWeekAgo;
      })
      .reduce((total, sale) => total + Number(sale.total_amount_raw), 0);

    if (previousPeriodSales === 0) return 100;
    return ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100;
  };

  // Format the total amount for display (using raw value)
  const formatTotalAmount = (sale: Sale) => {
    return `$${Number(sale.total_amount_raw).toFixed(2)}`;
  };

  return {
    sales,
    loading,
    addSale,
    getSalesByPeriod,
    getTotalSales,
    getSalesByFlavor,
    getGrowthRate,
    formatTotalAmount
  };
}