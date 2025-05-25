import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ChefHat, ArrowLeft, Printer, Star } from 'lucide-react';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock recipe data - in a real app, this would come from a database
  const recipes = {
    '1': {
      id: 1,
      name: 'Palomitas de Chocolate',
      description: 'Deliciosas palomitas cubiertas con chocolate derretido y un toque de canela. Perfectas para una noche de películas o como postre especial.',
      image: 'https://images.pexels.com/photos/1028711/pexels-photo-1028711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      difficulty: 'Fácil',
      prepTime: '20 minutos',
      servings: '4 porciones',
      ingredients: [
        '8 tazas de palomitas recién hechas (sin sal ni mantequilla)',
        '200g de chocolate semi-amargo',
        '2 cucharadas de mantequilla sin sal',
        '1/2 cucharadita de canela en polvo',
        '1/4 cucharadita de sal',
        '2 cucharadas de azúcar glass (opcional)'
      ],
      steps: [
        'Prepara las palomitas según las instrucciones del fabricante y colócalas en un tazón grande.',
        'En un recipiente apto para microondas, combina el chocolate y la mantequilla.',
        'Calienta en el microondas a potencia media por intervalos de 30 segundos, revolviendo entre cada intervalo, hasta que esté completamente derretido y suave.',
        'Agrega la canela y la sal al chocolate derretido y mezcla bien.',
        'Vierte el chocolate sobre las palomitas y revuelve suavemente con una espátula de silicona hasta que estén completamente cubiertas.',
        'Extiende las palomitas en una bandeja forrada con papel pergamino y deja enfriar por 30 minutos.',
        'Espolvorea con azúcar glass si lo deseas y sirve.'
      ],
      tips: [
        'Para un sabor más intenso, puedes usar chocolate amargo en lugar de semi-amargo.',
        'Añade un poco de extracto de vainilla al chocolate para un aroma extra.',
        'Si prefieres un toque crujiente, puedes mezclar almendras picadas o trozos de galleta con las palomitas.'
      ]
    },
    '2': {
      id: 2,
      name: 'Palomitas de Mantequilla',
      description: 'La receta clásica de palomitas con mantequilla derretida y sal. Un clásico que nunca falla para disfrutar en cualquier ocasión.',
      image: 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      difficulty: 'Muy fácil',
      prepTime: '10 minutos',
      servings: '4 porciones',
      ingredients: [
        '1/2 taza de granos de maíz para palomitas',
        '3 cucharadas de aceite vegetal',
        '4 cucharadas de mantequilla sin sal',
        'Sal al gusto'
      ],
      steps: [
        'En una olla grande con tapa, calienta el aceite a fuego medio-alto.',
        'Añade 3-4 granos de maíz y espera a que revienten, esto indica que el aceite está a la temperatura correcta.',
        'Agrega el resto de los granos de maíz y cubre la olla.',
        'Agita la olla ocasionalmente para evitar que se quemen.',
        'Cuando los estallidos se reduzcan a uno cada 2-3 segundos, retira del fuego.',
        'Mientras tanto, derrite la mantequilla en el microondas o en una pequeña cacerola.',
        'Transfiere las palomitas a un tazón grande, vierte la mantequilla derretida y espolvorea con sal al gusto.',
        'Mezcla bien para asegurar que todas las palomitas estén cubiertas con mantequilla y sal.'
      ],
      tips: [
        'Para un sabor más intenso, puedes usar mantequilla clarificada.',
        'Si prefieres palomitas menos grasosas, reduce la cantidad de mantequilla.',
        'Añade hierbas secas como romero o tomillo para un toque gourmet.',
        'Mantén la tapa ligeramente abierta para permitir que escape el vapor y obtener palomitas más crujientes.'
      ]
    },
    '3': {
      id: 3,
      name: 'Palomitas de Chicle',
      description: 'Palomitas dulces con colorante azul y sabor a chicle, perfectas para fiestas infantiles o para sorprender con un postre diferente y divertido.',
      image: 'https://images.pexels.com/photos/6312964/pexels-photo-6312964.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      difficulty: 'Media',
      prepTime: '25 minutos',
      servings: '6 porciones',
      ingredients: [
        '10 tazas de palomitas recién hechas (sin sal ni mantequilla)',
        '1 taza de azúcar',
        '1/2 taza de agua',
        '1/4 taza de jarabe de maíz',
        '1/4 cucharadita de sal',
        '2 cucharadas de mantequilla',
        '1/2 cucharadita de extracto de vainilla',
        '1/2 cucharadita de saborizante de chicle',
        'Colorante alimentario azul'
      ],
      steps: [
        'Prepara las palomitas según las instrucciones del fabricante y colócalas en un tazón grande.',
        'En una cacerola mediana, combina el azúcar, el agua, el jarabe de maíz y la sal.',
        'Cocina a fuego medio, revolviendo hasta que el azúcar se disuelva.',
        'Deja de revolver y cocina hasta que la mezcla alcance 140°C (usa un termómetro de caramelo).',
        'Retira del fuego y agrega la mantequilla, el extracto de vainilla, el saborizante de chicle y unas gotas de colorante azul.',
        'Mezcla bien hasta que la mantequilla se derrita y el color sea uniforme.',
        'Vierte inmediatamente sobre las palomitas y revuelve rápidamente con una espátula de silicona hasta que estén completamente cubiertas.',
        'Extiende las palomitas en una bandeja forrada con papel pergamino y deja enfriar completamente antes de servir.'
      ],
      tips: [
        'Trabaja rápidamente al cubrir las palomitas, ya que el caramelo se endurece rápido.',
        'Para un color más intenso, añade más colorante, pero hazlo gradualmente.',
        'Si no encuentras saborizante de chicle, puedes usar extracto de frutas como fresa o cereza.',
        'Puedes decorar con sprinkles de colores antes de que se enfríen para un aspecto más festivo.'
      ]
    },
    '4': {
      id: 4,
      name: 'Palomitas Picantes',
      description: 'Palomitas con un toque de chile en polvo y limón para los amantes del picante. Una opción salada con un kick de sabor que sorprenderá a tus invitados.',
      image: 'https://images.pexels.com/photos/5506161/pexels-photo-5506161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      difficulty: 'Media',
      prepTime: '15 minutos',
      servings: '4 porciones',
      ingredients: [
        '8 tazas de palomitas recién hechas',
        '3 cucharadas de mantequilla derretida',
        '2 cucharaditas de chile en polvo',
        '1 cucharadita de pimentón ahumado',
        '1/2 cucharadita de ajo en polvo',
        '1/2 cucharadita de cebolla en polvo',
        '1/4 cucharadita de cayena (ajustar según nivel de picante deseado)',
        '1 cucharadita de sal',
        'Jugo de 1 limón',
        'Ralladura de 1 limón (opcional)'
      ],
      steps: [
        'Prepara las palomitas según las instrucciones del fabricante y colócalas en un tazón grande.',
        'En un tazón pequeño, mezcla el chile en polvo, el pimentón, el ajo en polvo, la cebolla en polvo, la cayena y la sal.',
        'Vierte la mantequilla derretida sobre las palomitas y mezcla bien.',
        'Espolvorea la mezcla de especias sobre las palomitas calientes y revuelve para distribuir uniformemente.',
        'Rocía con el jugo de limón y mezcla nuevamente.',
        'Si lo deseas, añade la ralladura de limón para un sabor cítrico más intenso.',
        'Sirve inmediatamente para disfrutar del máximo sabor y textura.'
      ],
      tips: [
        'Ajusta la cantidad de cayena según tu tolerancia al picante.',
        'Para un sabor más intenso, tuesta ligeramente las especias en una sartén seca antes de mezclarlas.',
        'Puedes añadir un poco de queso parmesano rallado para un toque extra de sabor.',
        'Si prefieres un sabor más dulce y picante, añade una cucharada de azúcar moreno a la mezcla de especias.'
      ]
    }
  };
  
  const recipe = recipes[id as keyof typeof recipes];
  
  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold">Receta no encontrada</h2>
        <Link to="/recetas" className="mt-4 text-amber-500 hover:text-amber-600">
          Volver a recetas
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link 
          to="/recetas" 
          className="flex items-center text-amber-500 hover:text-amber-600"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Volver a recetas</span>
        </Link>
        
        <div className="flex space-x-2">
          <button className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            <Printer size={18} />
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="h-64 sm:h-80 md:h-96 overflow-hidden">
          <img 
            src={recipe.image} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold">{recipe.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {recipe.description}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center">
              <Clock size={18} className="text-amber-500 mr-2" />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center">
              <ChefHat size={18} className="text-amber-500 mr-2" />
              <span>{recipe.difficulty}</span>
            </div>
            <div className="flex items-center">
              <Star size={18} className="text-amber-500 mr-2" />
              <span>{recipe.servings}</span>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Ingredientes</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mt-1.5 mr-2"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Preparación</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3">Consejos del Chef</h2>
            <ul className="space-y-2">
              {recipe.tips.map((tip, index) => (
                <li key={index} className="flex items-start text-amber-700 dark:text-amber-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;