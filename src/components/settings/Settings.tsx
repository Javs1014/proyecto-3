import React, { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { Lock, User, Shield, UserPlus, Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'empleado'])
});

const Settings = () => {
  const { profile, users, createUser, updateUser, deleteUser, updatePassword, isAdmin } = useProfile();
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'empleado' as const
  });

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'empleado' as const
  });
  
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    userId: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    email: profile?.email || ''
  });

  const handleSaveProfile = async () => {
    try {
      if (!profile?.id) return;
      await updateUser(profile.id, {
        name: profileForm.name,
        email: profileForm.email
      });
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = userSchema.parse(newUser);
      await createUser(validatedData.email, validatedData.password, validatedData.role, validatedData.name);
      setNewUser({ email: '', password: '', name: '', role: 'empleado' });
      setShowNewUserForm(false);
      toast.success('Usuario creado exitosamente');
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => toast.error(err.message));
      } else {
        console.error('Error creating user:', error);
        toast.error('Error al crear usuario');
      }
    }
  };

  const handleStartEditing = (user: any) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role
    });
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      const validatedData = userSchema.omit({ password: true }).parse(editForm);
      await updateUser(userId, validatedData);
      setEditingUser(null);
      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => toast.error(err.message));
      } else {
        console.error('Error updating user:', error);
        toast.error('Error al actualizar usuario');
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await updatePassword(passwordForm.userId, passwordForm.newPassword);
      setShowPasswordForm(false);
      setPasswordForm({
        userId: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error al actualizar la contraseña');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUser(userId);
        toast.success('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error al eliminar usuario');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            <h2 className="text-xl font-semibold">Perfil</h2>
          </div>
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            Guardar Cambios
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={profile?.role === 'admin' ? 'Administrador' : 'Empleado'}
              disabled
            />
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
            </div>
            <button
              onClick={() => setShowNewUserForm(true)}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </button>
          </div>

          {showNewUserForm && (
            <form onSubmit={handleCreateUser} className="mb-6 p-4 border rounded-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'empleado' })}
                  >
                    <option value="empleado">Empleado</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewUserForm(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Crear Usuario
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <input
                          type="email"
                          className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'empleado' })}
                        >
                          <option value="empleado">Empleado</option>
                          <option value="admin">Administrador</option>
                        </select>
                      ) : (
                        user.role === 'admin' ? 'Administrador' : 'Empleado'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(user.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStartEditing(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPasswordForm({ ...passwordForm, userId: user.id });
                              setShowPasswordForm(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      userId: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;