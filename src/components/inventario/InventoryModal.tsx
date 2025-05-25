import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { InventoryItem } from '../../lib/supabase';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'last_updated' | 'updated_by'>) => void;
  item?: InventoryItem | null;
}

const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'ingredient',
    quantity: 0,
    unit: '',
    reorder_level: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        reorder_level: item.reorder_level
      });
    } else {
      setFormData({
        name: '',
        category: 'ingredient',
        quantity: 0,
        unit: '',
        reorder_level: 0
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {item ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryItem['category'] })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value="ingredient">Ingrediente</option>
              <option value="packaging">Empaque</option>
              <option value="equipment">Equipo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cantidad</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unidad</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              required
              placeholder="kg, unidades, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nivel Mínimo</label>
            <input
              type="number"
              value={formData.reorder_level}
              onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            >
              {item ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;