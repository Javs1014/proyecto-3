import React, { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import type { Recipe } from '../../lib/supabase';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => void;
  recipe?: Recipe | null;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recipe = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: [''],
    steps: [''],
    tips: [''],
    image_url: ''
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        steps: Array.isArray(recipe.steps) ? recipe.steps : [],
        tips: Array.isArray(recipe.tips) ? recipe.tips : [],
        image_url: recipe.image_url || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        ingredients: [''],
        steps: [''],
        tips: [''],
        image_url: ''
      });
    }
  }, [recipe]);

  const handleArrayChange = (
    field: 'ingredients' | 'steps' | 'tips',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }));
  };

  const handleAddItem = (field: 'ingredients' | 'steps' | 'tips') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveItem = (field: 'ingredients' | 'steps' | 'tips', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ingredients: formData.ingredients.filter(Boolean),
      steps: formData.steps.filter(Boolean),
      tips: formData.tips.filter(Boolean)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {recipe ? 'Editar Receta' : 'Nueva Receta'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL de la Imagen</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Ingredientes</label>
              <button
                type="button"
                onClick={() => handleAddItem('ingredients')}
                className="text-amber-500 hover:text-amber-600"
              >
                <Plus size={20} />
              </button>
            </div>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="Ingrediente y cantidad"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('ingredients', index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash size={20} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Pasos</label>
              <button
                type="button"
                onClick={() => handleAddItem('steps')}
                className="text-amber-500 hover:text-amber-600"
              >
                <Plus size={20} />
              </button>
            </div>
            {formData.steps.map((step, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleArrayChange('steps', index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder={`Paso ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('steps', index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash size={20} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Consejos</label>
              <button
                type="button"
                onClick={() => handleAddItem('tips')}
                className="text-amber-500 hover:text-amber-600"
              >
                <Plus size={20} />
              </button>
            </div>
            {formData.tips.map((tip, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tip}
                  onChange={(e) => handleArrayChange('tips', index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="Consejo útil"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('tips', index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash size={20} />
                </button>
              </div>
            ))}
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
              {recipe ? 'Guardar Cambios' : 'Crear Receta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeModal;