import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/ui/Sidebar';
import Header from './components/ui/Header';
import Dashboard from './components/dashboard/Dashboard';
import Sales from './components/ventas/Sales';
import Inventory from './components/inventario/Inventory';
import Reports from './components/reportes/Reports';
import Recipes from './components/recetas/Recipes';
import RecipeDetail from './components/recetas/RecipeDetail';
import Settings from './components/settings/Settings';
import Login from './pages/Login';
import ProtectedRoute from './pages/ProtectedRoute';
import { useAuth } from './auth/useAuth';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
                  <Toaster position="top-right" />
                  <Sidebar open={sidebarOpen} darkMode={darkMode} />
                  <div className="flex-1 flex flex-col overflow-hidden">
                  <Header 
                    toggleSidebar={toggleSidebar} 
                    toggleDarkMode={toggleDarkMode} 
                    darkMode={darkMode}
                    user={user}
                    onSignOut={signOut}
                  />
                  <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/ventas" element={<Sales />} />
                      <Route path="/inventario" element={<Inventory />} />
                      <Route path="/reportes" element={<Reports />} />
                      <Route path="/recetas" element={<Recipes />} />
                      <Route path="/recetas/:id" element={<RecipeDetail />} />
                      <Route path="/ajustes" element={<Settings />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;