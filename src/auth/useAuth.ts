import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
            // Clear the session if refresh token is invalid
            await supabase.auth.signOut();
            if (mounted) {
              setUser(null);
            }
            toast.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
          } else {
            console.error('Auth error:', error);
          }
        } else if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        // Session was successfully refreshed
        if (mounted) {
          setUser(session?.user ?? null);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
        }
      } else {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getErrorMessage = (error: AuthError) => {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'El correo electrónico o la contraseña son incorrectos';
      case 'Email not confirmed':
        return 'Por favor, confirma tu correo electrónico';
      case 'Rate limit exceeded':
        return 'Demasiados intentos. Por favor, espera unos minutos';
      case 'Invalid Refresh Token':
      case 'Refresh Token Not Found':
        return 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
      default:
        return 'Error al iniciar sesión. Por favor, inténtalo de nuevo';
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }
      
      toast.success('¡Bienvenido!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Sesión cerrada');
    } catch (error) {
      toast.error('Error al cerrar sesión');
      console.error('Error:', error);
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
}