import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';
import { toast } from 'react-hot-toast';

const FLAVORS = ['Chocolate', 'Mantequilla', 'Chicle', 'Picante'];
const PRICES = {
  Chocolate: { chica: 45, mediana: 50, grande: 55 },
  Mantequilla: { chica: 40, mediana: 45, grande: 50 },
  Chicle: { chica: 45, mediana: 50, grande: 55 },
  Picante: { chica: 45, mediana: 50, grande: 55 }
};

const BAG_SIZES = {
  chica: 'Chica',
  mediana: 'Mediana',
  grande: 'Grande'
} as const;

type BagSize = keyof typeof BAG_SIZES;

const Sales: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const { sales, loading: salesLoading, addSale, formatTotalAmount } = useSales();
  const { items: inventory, updateItem } = useInventory();
  
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVORS[0]);
  const [selectedSize, setSelectedSize] = useState<BagSize>('mediana');
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(PRICES[FLAVORS[0]].mediana);
  
  useEffect(() => {
    setTotal(quantity * PRICES[selectedFlavor][selectedSize]);
  }, [quantity, selectedFlavor, selectedSize]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const popcornInventory = inventory.find(
        item => item.name.toLowerCase().includes('maíz') && 
        item.category === 'ingredient'
      );
      
      if (!popcornInventory || popcornInventory.quantity < quantity) {
        toast.error('No hay suficiente maíz para palomitas');
        return;
      }
      
      await addSale({
        flavor: selectedFlavor,
        quantity,
        total_amount: total,
        bag_size: selectedSize
      });
      
      await updateItem(popcornInventory.id, {
        quantity: popcornInventory.quantity - quantity
      });
      
      setQuantity(1);
      setSelectedFlavor(FLAVORS[0]);
      setSelectedSize('mediana');
      
      toast.success('Venta registrada exitosamente');
    } catch (error) {
      console.error('Error registering sale:', error);
      toast.error('Error al registrar la venta');
    }
  };
  
  const processChartData = () => {
    if (!sales.length) return [];
    
    const now = new Date();
    let filteredSales = [];
    
    switch (timeRange) {
      case 'day':
        filteredSales = sales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSales = sales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredSales = sales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= monthAgo;
        });
        break;
    }
    
    return filteredSales;
  };
  
  const chartData = processChartData();
  
  if (salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Ventas</h1>
        
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-md shadow-sm">
            <button 
              onClick={() => setTimeRange('day')}
              className={`px-3 py-1.5 text-sm rounded-l-md ${
                timeRange === 'day' 
                  ? 'bg-amber-500 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Día
            </button>
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 text-sm ${
                timeRange === 'week' 
                  ? 'bg-amber-500 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Semana
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 text-sm rounded-r-md ${
                timeRange === 'month' 
                  ? 'bg-amber-500 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Mes
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Ventas por Período</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return timeRange === 'day' 
                    ? date.getHours() + ':00'
                    : date.toLocaleDateString();
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`$${value}`, 'Ventas']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_amount_raw" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Ventas ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Registrar Nueva Venta</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Sabor</label>
              <select 
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              >
                {FLAVORS.map(flavor => (
                  <option key={flavor} value={flavor}>{flavor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tamaño</label>
              <select 
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as BagSize)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              >
                {Object.entries(BAG_SIZES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad</label>
              <input 
                type="number" 
                min="1" 
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Precio Unitario ($)</label>
              <input 
                type="number" 
                value={PRICES[selectedFlavor][selectedSize]}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Total ($)</label>
              <input 
                type="number" 
                value={total}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                readOnly
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md"
            >
              Registrar Venta
            </button>
          </form>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Ventas Recientes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sabor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tamaño</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{sale.flavor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{BAG_SIZES[sale.bag_size as BagSize]}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{sale.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatTotalAmount(sale)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(sale.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;