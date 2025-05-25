import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Trash, Edit } from 'lucide-react';
import { useRecipes } from '../../hooks/useRecipes';
import RecipeModal from './RecipeModal';
import { toast } from 'react-hot-toast';

const Recipes: React.FC = () => {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe, isAdmin } = useRecipes();
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta receta?')) {
      try {
        await deleteRecipe(id);
      } catch (error) {
        console.error('Error deleting recipe:', error);
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
        <h1 className="text-2xl font-bold">Recetas</h1>
        
        {isAdmin && (
          <button
            onClick={() => {
              setEditingRecipe(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md mt-2 sm:mt-0"
          >
            <Plus size={18} />
            <span>Nueva Receta</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-8">
        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">🍫</span> 1. Palomitas con Chocolate
            </h2>
            <div className="mt-2 space-y-4">
              <p className="flex items-center">
                <span className="mr-2">⏱️</span> Tiempo estimado: 15 minutos
              </p>
              <p className="flex items-center">
                <span className="mr-2">🍽️</span> Porciones: 2 personas
              </p>
              
              <div>
                <h3 className="font-semibold mb-2">Ingredientes:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>1 taza de palomitas naturales (ya reventadas)</li>
                  <li>100 g de chocolate (puede ser de leche o amargo)</li>
                  <li>1 cucharada de mantequilla</li>
                  <li>Opcional: chispas de colores, nueces o almendras picadas</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Preparación:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Derrite el chocolate con la mantequilla a baño María o en microondas (en intervalos de 15 segundos, removiendo cada vez).</li>
                  <li>Vierte el chocolate sobre las palomitas y mezcla bien para cubrirlas.</li>
                  <li>Extiende en una bandeja con papel encerado y deja enfriar (puedes meterlas al refri 15 minutos).</li>
                  <li>Añade los toppings opcionales antes de que el chocolate endurezca.</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">🧈</span> 2. Palomitas con Mantequilla
            </h2>
            <div className="mt-2 space-y-4">
              <p className="flex items-center">
                <span className="mr-2">⏱️</span> Tiempo estimado: 5 minutos
              </p>
              <p className="flex items-center">
                <span className="mr-2">🍽️</span> Porciones: 2 personas
              </p>
              
              <div>
                <h3 className="font-semibold mb-2">Ingredientes:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>1 taza de palomitas naturales</li>
                  <li>2 a 3 cucharadas de mantequilla sin sal</li>
                  <li>Sal al gusto</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Preparación:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Derrite la mantequilla en una olla pequeña o microondas.</li>
                  <li>Vierte la mantequilla sobre las palomitas y revuelve para que todas se impregnen.</li>
                  <li>Agrega sal al gusto y mezcla bien.</li>
                </ol>
              </div>
              
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Consejo:</strong> si quieres que queden como las del cine, puedes usar un poco de mantequilla clarificada (ghee) para un sabor más intenso y textura crujiente.
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">🍬</span> 3. Palomitas sabor Chicle
            </h2>
            <div className="mt-2 space-y-4">
              <p className="flex items-center">
                <span className="mr-2">⏱️</span> Tiempo estimado: 15 minutos
              </p>
              <p className="flex items-center">
                <span className="mr-2">🍽️</span> Porciones: 2 personas
              </p>
              
              <div>
                <h3 className="font-semibold mb-2">Ingredientes:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>1 taza de palomitas naturales</li>
                  <li>½ taza de azúcar</li>
                  <li>2 cucharadas de mantequilla</li>
                  <li>2 cucharadas de agua</li>
                  <li>1 cucharadita de esencia de chicle</li>
                  <li>Colorante rosa o azul (opcional)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Preparación:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>En una olla pequeña, hierve el azúcar, la mantequilla y el agua hasta que se forme un jarabe espeso.</li>
                  <li>Retira del fuego y añade la esencia de chicle y el colorante.</li>
                  <li>Vierte sobre las palomitas y mezcla bien hasta que se cubran.</li>
                  <li>Deja enfriar antes de comer. ¡Saben y huelen como chicle de feria!</li>
                </ol>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">🌶️</span> 4. Palomitas Picantes
            </h2>
            <div className="mt-2 space-y-4">
              <p className="flex items-center">
                <span className="mr-2">⏱️</span> Tiempo estimado: 10 minutos
              </p>
              <p className="flex items-center">
                <span className="mr-2">🍽️</span> Porciones: 2 personas
              </p>
              
              <div>
                <h3 className="font-semibold mb-2">Ingredientes:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>1 taza de palomitas naturales</li>
                  <li>Jugo de ½ limón</li>
                  <li>1 cucharadita de chile en polvo tipo Tajín o Miguelito</li>
                  <li>1 cucharadita de chamoy líquido (opcional)</li>
                  <li>Sal al gusto</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Preparación:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Rocía el jugo de limón y el chamoy sobre las palomitas.</li>
                  <li>Espolvorea el chile en polvo y la sal.</li>
                  <li>Mezcla bien para que todas las palomitas se cubran uniformemente.</li>
                  <li>Si las quieres más secas y crujientes, mételas al horno 5 minutos a 180 °C.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecipeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRecipe(null);
        }}
        onSave={async (recipeData) => {
          try {
            if (editingRecipe) {
              await updateRecipe(editingRecipe.id, recipeData);
            } else {
              await addRecipe(recipeData);
            }
          } catch (error) {
            console.error('Error saving recipe:', error);
            toast.error('Error al guardar la receta');
          }
        }}
        recipe={editingRecipe}
      />
    </div>
  );
};

export default Recipes;