/*
  # Configuración de políticas para perfiles de usuario
  
  1. Seguridad
    - Habilitar RLS en la tabla profiles
    - Permitir a usuarios ver y actualizar su propio perfil
    - Permitir a administradores y javier5@gmail.com gestionar todos los perfiles
*/

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  role = 'admin' OR 
  email = 'javier5@gmail.com'
);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR 
  role = 'admin' OR 
  email = 'javier5@gmail.com'
)
WITH CHECK (
  auth.uid() = id OR 
  role = 'admin' OR 
  email = 'javier5@gmail.com'
);

-- Política para insertar perfil al registrarse
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);