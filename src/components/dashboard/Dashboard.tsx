import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Package, DollarSign, ShoppingBag } from 'lucide-react';
import StatCard from './StatCard';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#ffc658', '#ff8042'];

const Dashboard: React.FC = () => {
  const { 
    sales, 
    getSalesByPeriod, 
    getTotalSales, 
    getSalesByFlavor,
    getGrowthRate,
    formatTotalAmount 
  } = useSales();
  
  const { 
    items: inventoryItems,
    getItemsByCategory
  } = useInventory();

  // Calculate today's sales
  const todaySales = getTotalSales('day');
  const weekSales = getTotalSales('week');
  const growthRate = getGrowthRate();

  // Get weekly sales data
  const weeklySalesData = getSalesByPeriod('week').map(sale => ({
    date: new Date(sale.created_at).toLocaleDateString(),
    sales: Number(sale.total_amount_raw)
  }));

  // Aggregate sales by flavor
  const salesByFlavor = getSalesByFlavor('week');
  const flavorData = Object.entries(salesByFlavor).map(([flavor, quantity]) => ({
    name: flavor,
    value: quantity
  }));

  // Calculate inventory usage
  const ingredientItems = getItemsByCategory('ingredient');
  const inventoryUsageData = ingredientItems.map(item => ({
    name: item.name,
    stock: item.quantity,
    reorderLevel: item.reorder_level,
    usage: item.reorder_level - item.quantity
  })).sort((a, b) => b.usage - a.usage);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ventas Totales" 
          value={`$${weekSales.toFixed(2)}`}
          change={`${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`}
          icon={<DollarSign className="text-green-500" />} 
        />
        <StatCard 
          title="Ventas Hoy" 
          value={`$${todaySales.toFixed(2)}`}
          change={`${sales.length} ventas`}
          icon={<ShoppingBag className="text-blue-500" />} 
        />
        <StatCard 
          title="Productos en Stock" 
          value={`${inventoryItems.length} items`}
          change={`${ingredientItems.length} ingredientes`}
          icon={<Package className="text-amber-500" />} 
        />
        <StatCard 
          title="Sabor más Vendido" 
          value={Object.entries(salesByFlavor).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          change={`${Object.entries(salesByFlavor).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} unidades`}
          icon={<TrendingUp className="text-purple-500" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Ventas Semanales</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklySalesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  name="Ventas ($)" 
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Ventas por Sabor</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={flavorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {flavorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Uso de Inventario</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={inventoryUsageData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="stock" 
                name="Stock Actual" 
                fill="#82ca9d" 
                stackId="a"
              />
              <Bar 
                dataKey="usage" 
                name="Consumo" 
                fill="#8884d8" 
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;