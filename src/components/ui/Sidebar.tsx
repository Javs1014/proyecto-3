import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Utensils, 
  Settings,
  Popcorn
} from 'lucide-react';
import clsx from 'clsx';

type SidebarProps = {
  open: boolean;
  darkMode: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ open, darkMode }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Ventas', path: '/ventas', icon: <ShoppingCart size={20} /> },
    { name: 'Inventario', path: '/inventario', icon: <Package size={20} /> },
    { name: 'Reportes', path: '/reportes', icon: <FileText size={20} /> },
    { name: 'Recetas', path: '/recetas', icon: <Utensils size={20} /> },
    { name: 'Ajustes', path: '/ajustes', icon: <Settings size={20} /> },
  ];

  return (
    <aside 
      className={clsx(
        'transition-all duration-300 ease-in-out',
        open ? 'w-64' : 'w-20',
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
        'border-r border-gray-200 dark:border-gray-700 flex flex-col'
      )}
    >
      <div className="p-4 flex items-center justify-center">
        <div className={clsx(
          'flex items-center',
          open ? 'justify-start' : 'justify-center'
        )}>
          <Popcorn size={32} className="text-amber-500" />
          {open && (
            <span className="ml-2 text-xl font-bold">PopMaster</span>
          )}
        </div>
      </div>
      
      <nav className="flex-1 pt-5">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => clsx(
                  'flex items-center px-4 py-3 transition-colors',
                  open ? 'justify-start' : 'justify-center',
                  isActive 
                    ? 'bg-amber-500 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {open && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={clsx(
        'p-4 border-t border-gray-200 dark:border-gray-700',
        'text-sm text-gray-500 dark:text-gray-400',
        open ? 'block' : 'hidden'
      )}>
        <p>PopMaster v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;