import React from 'react';
import { Menu, Sun, Moon, User, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { User as SupabaseUser } from '@supabase/supabase-js';

type HeaderProps = {
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
  user: SupabaseUser | null;
  onSignOut: () => void;
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar, toggleDarkMode, darkMode, user, onSignOut }) => {
  return (
    <header className={clsx(
      'h-16 flex items-center justify-between px-4 border-b',
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    )}>
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className={clsx(
            'p-2 rounded-md',
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          )}
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold hidden md:block">Tienda de Palomitas</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleDarkMode}
          className={clsx(
            'p-2 rounded-full',
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          )}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="flex items-center space-x-2">
          <div className={clsx(
            'flex items-center p-2 rounded-full',
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          )}>
            <User size={20} />
            <span className="ml-2 hidden md:block">{user?.email}</span>
          </div>
          <button
            onClick={onSignOut}
            className={clsx(
              'p-2 rounded-full',
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            )}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;