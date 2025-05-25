import React, { useState } from 'react';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { toast } from 'react-hot-toast';
import type { InventoryItem } from '../../lib/supabase';
import InventoryModal from './InventoryModal';

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'ingredients' | 'packaging' | 'equipment'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { items, loading, addItem, updateItem, deleteItem } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const filteredItems = items
    .filter(item => {
      if (activeTab === 'all') return true;
      const categoryMap = {
        'ingredients': 'ingredient',
        'packaging': 'packaging',
        'equipment': 'equipment'
      };
      return item.category === categoryMap[activeTab];
    })
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const lowStockItems = items.filter(item => item.quantity <= item.reorder_level);
  
  const handleSaveItem = async (itemData: Omit<InventoryItem, 'id' | 'last_updated' | 'updated_by'>) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, itemData);
      } else {
        await addItem(itemData);
      }
      setShowAddModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Inventario</h1>
        
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            />
          </div>
          
          <button 
            onClick={() => {
              setEditingItem(null);
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
          >
            <Plus size={18} />
            <span>Nuevo</span>
          </button>
        </div>
      </div>
      
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md flex items-start space-x-3">
          <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Alerta de Inventario</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {lowStockItems.length} productos están por debajo del nivel mínimo recomendado.
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-amber-500 text-amber-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'ingredients'
                  ? 'border-b-2 border-amber-500 text-amber-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Ingredientes
            </button>
            <button
              onClick={() => setActiveTab('packaging')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'packaging'
                  ? 'border-b-2 border-amber-500 text-amber-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Empaques
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'equipment'
                  ? 'border-b-2 border-amber-500 text-amber-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Equipos
            </button>
          </nav>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nivel Mínimo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.reorder_level;
                const isCritical = item.quantity <= item.reorder_level / 2;
                
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {item.category === 'ingredient' ? 'Ingrediente' : 
                       item.category === 'packaging' ? 'Empaque' : 'Equipo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.reorder_level}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setShowAddModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
      />
    </div>
  );
};

export default Inventory;