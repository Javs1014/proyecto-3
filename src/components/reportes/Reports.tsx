import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Calendar, Filter, Download, Printer, FileText } from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'combined'>('sales');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const { generating, generateSalesReport, generateInventoryReport } = useReports();
  const { sales, getSalesByPeriod, getTotalSales, getSalesByFlavor, formatTotalAmount } = useSales();
  const { items, getLowStockItems } = useInventory();
  
  const periodSales = getSalesByPeriod(timeRange);
  const totalSales = getTotalSales(timeRange);
  const salesByFlavor = getSalesByFlavor(timeRange);
  const lowStockItems = getLowStockItems();
  
  const handleExportPDF = async () => {
    if (reportType === 'sales' || reportType === 'combined') {
      await generateSalesReport(timeRange, 'pdf');
    }
    if (reportType === 'inventory' || reportType === 'combined') {
      await generateInventoryReport('pdf');
    }
  };
  
  const handleExportExcel = async () => {
    if (reportType === 'sales' || reportType === 'combined') {
      await generateSalesReport(timeRange, 'excel');
    }
    if (reportType === 'inventory' || reportType === 'combined') {
      await generateInventoryReport('excel');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Reportes</h1>
        
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
          
          <button 
            onClick={handleExportExcel}
            disabled={generating}
            className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Download size={18} />
          </button>
          
          <button 
            onClick={handleExportPDF}
            disabled={generating}
            className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Printer size={18} />
          </button>
          
          <button 
            onClick={handleExportPDF}
            disabled={generating}
            className="flex items-center space-x-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md disabled:opacity-50"
          >
            <FileText size={18} />
            <span>Generar Reporte</span>
          </button>
        </div>
      </div>
      
      <div id="report-content" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setReportType('sales')}
            className={`px-4 py-2 rounded-md ${
              reportType === 'sales'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Ventas
          </button>
          <button
            onClick={() => setReportType('inventory')}
            className={`px-4 py-2 rounded-md ${
              reportType === 'inventory'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Inventario
          </button>
          <button
            onClick={() => setReportType('combined')}
            className={`px-4 py-2 rounded-md ${
              reportType === 'combined'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Combinado
          </button>
        </div>
        
        {(reportType === 'sales' || reportType === 'combined') && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Reporte de Ventas {timeRange === 'day' ? 'Diario' : timeRange === 'week' ? 'Semanal' : 'Mensual'}</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={periodSales}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
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
            
            <div className="mt-8">
              <h3 className="text-md font-semibold mb-4">Resumen de Ventas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(salesByFlavor).map(([flavor, quantity]) => (
                  <div key={flavor} className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">{flavor}</h4>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-200 mt-1">
                      ${(quantity * (flavor === 'Mantequilla' ? 45 : 50)).toFixed(2)}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">{quantity} unidades</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {(reportType === 'inventory' || reportType === 'combined') && (
          <div className={reportType === 'combined' ? 'mt-8' : ''}>
            <h2 className="text-lg font-semibold mb-4">Reporte de Inventario</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nivel Mínimo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => {
                    const isLow = item.quantity <= item.reorder_level;
                    const isCritical = item.quantity <= item.reorder_level / 2;
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">
                          {item.category === 'ingredient' ? 'Ingrediente' : 
                           item.category === 'packaging' ? 'Empaque' : 'Equipo'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.reorder_level} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isCritical ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                              Crítico
                            </span>
                          ) : isLow ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                              Bajo
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {lowStockItems.length > 0 && (
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                <h3 className="text-md font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  Productos con Stock Bajo
                </h3>
                <ul className="space-y-1">
                  {lowStockItems.map((item) => (
                    <li key={item.id} className="text-yellow-700 dark:text-yellow-400">
                      • {item.name}: {item.quantity} {item.unit} (Mínimo: {item.reorder_level} {item.unit})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;