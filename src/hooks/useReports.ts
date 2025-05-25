import { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useSales } from './useSales';
import { useInventory } from './useInventory';
import { toast } from 'react-hot-toast';

export function useReports() {
  const { sales, getSalesByPeriod, getTotalSales, getSalesByFlavor, formatTotalAmount } = useSales();
  const { items, getLowStockItems } = useInventory();
  const [generating, setGenerating] = useState(false);

  const generateSalesReport = async (period: 'day' | 'week' | 'month', format: 'pdf' | 'excel') => {
    try {
      setGenerating(true);
      const periodSales = getSalesByPeriod(period);
      const totalSales = getTotalSales(period);
      const salesByFlavor = getSalesByFlavor(period);

      if (format === 'pdf') {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('Reporte de Ventas', 20, 20);
        
        // Period
        doc.setFontSize(12);
        doc.text(`Período: ${period}`, 20, 30);
        doc.text(`Total de Ventas: $${totalSales.toFixed(2)}`, 20, 40);
        
        // Sales by flavor
        doc.text('Ventas por Sabor:', 20, 50);
        let y = 60;
        Object.entries(salesByFlavor).forEach(([flavor, quantity]) => {
          doc.text(`${flavor}: ${quantity} unidades`, 30, y);
          y += 10;
        });
        
        // Recent sales
        doc.text('Ventas Recientes:', 20, y + 10);
        y += 20;
        periodSales.slice(0, 10).forEach((sale) => {
          doc.text(
            `${new Date(sale.created_at).toLocaleDateString()} - ${sale.flavor} - ${sale.quantity} unid. - ${formatTotalAmount(sale)}`,
            30,
            y
          );
          y += 10;
        });
        
        doc.save('reporte-ventas.pdf');
      } else {
        const wb = XLSX.utils.book_new();
        
        // Sales summary
        const summaryData = [
          ['Período', period],
          ['Total de Ventas', totalSales],
          [''],
          ['Ventas por Sabor'],
          ...Object.entries(salesByFlavor).map(([flavor, quantity]) => [flavor, quantity])
        ];
        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWS, 'Resumen');
        
        // Detailed sales
        const salesData = periodSales.map(sale => ({
          Fecha: new Date(sale.created_at).toLocaleDateString(),
          Sabor: sale.flavor,
          Cantidad: sale.quantity,
          Total: formatTotalAmount(sale).replace('$', '')
        }));
        const salesWS = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, salesWS, 'Ventas Detalladas');
        
        // Generate Excel file
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        const buf = new ArrayBuffer(wbout.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
        
        saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'reporte-ventas.xlsx');
      }

      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  const generateInventoryReport = async (format: 'pdf' | 'excel') => {
    try {
      setGenerating(true);
      const lowStockItems = getLowStockItems();

      if (format === 'pdf') {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('Reporte de Inventario', 20, 20);
        
        // Summary
        doc.setFontSize(12);
        doc.text(`Total de Productos: ${items.length}`, 20, 30);
        doc.text(`Productos con Stock Bajo: ${lowStockItems.length}`, 20, 40);
        
        // Inventory list
        doc.text('Inventario:', 20, 50);
        let y = 60;
        items.forEach((item) => {
          const isLow = item.quantity <= item.reorder_level;
          doc.text(
            `${item.name} - ${item.quantity} ${item.unit}${isLow ? ' (BAJO)' : ''}`,
            30,
            y
          );
          y += 10;
        });
        
        doc.save('reporte-inventario.pdf');
      } else {
        const wb = XLSX.utils.book_new();
        
        // Inventory data
        const inventoryData = items.map(item => ({
          Producto: item.name,
          Categoría: item.category === 'ingredient' ? 'Ingrediente' : 
                     item.category === 'packaging' ? 'Empaque' : 'Equipo',
          Cantidad: item.quantity,
          Unidad: item.unit,
          'Nivel Mínimo': item.reorder_level,
          Estado: item.quantity <= item.reorder_level ? 'BAJO' : 'Normal',
          'Última Actualización': new Date(item.last_updated).toLocaleDateString()
        }));
        const inventoryWS = XLSX.utils.json_to_sheet(inventoryData);
        XLSX.utils.book_append_sheet(wb, inventoryWS, 'Inventario');
        
        // Low stock items
        const lowStockData = lowStockItems.map(item => ({
          Producto: item.name,
          Cantidad: item.quantity,
          'Nivel Mínimo': item.reorder_level,
          Unidad: item.unit
        }));
        const lowStockWS = XLSX.utils.json_to_sheet(lowStockData);
        XLSX.utils.book_append_sheet(wb, lowStockWS, 'Stock Bajo');
        
        // Generate Excel file
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        const buf = new ArrayBuffer(wbout.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
        
        saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'reporte-inventario.xlsx');
      }

      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  return {
    generating,
    generateSalesReport,
    generateInventoryReport
  };
}