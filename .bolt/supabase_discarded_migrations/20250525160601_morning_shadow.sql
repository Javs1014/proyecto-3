/*
  # Actualizar políticas RLS para gestión de usuarios
  
  1. Cambios
    - Eliminar políticas anteriores
    - Crear nuevas políticas más específicas para la gestión de usuarios
    - Mantener la seguridad permitiendo solo a admins y javier5@gmail.com gestionar usuarios
*/

-- Eliminar políticas anteriores
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Política para ver perfiles
CREATE POLICY "View profiles policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Los usuarios pueden ver su propio perfil
  auth.uid() = id
  -- Los admins y javier5 pueden ver todos los perfiles
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'javier5@gmail.com'
);

-- Política para actualizar perfiles
CREATE POLICY "Update profiles policy"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Los usuarios pueden actualizar su propio perfil
  auth.uid() = id
  -- Los admins y javier5 pueden actualizar cualquier perfil
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'javier5@gmail.com'
)
WITH CHECK (
  -- Los usuarios pueden actualizar su propio perfil
  auth.uid() = id
  -- Los admins y javier5 pueden actualizar cualquier perfil
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'javier5@gmail.com'
);

-- Política para insertar perfiles
CREATE POLICY "Insert profiles policy"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Los usuarios solo pueden insertar su propio perfil
  auth.uid() = id
  -- Los admins y javier5 pueden insertar cualquier perfil
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'javier5@gmail.com'
);

-- Política para eliminar perfiles
CREATE POLICY "Delete profiles policy"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  -- Solo los admins y javier5 pueden eliminar perfiles
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'javier5@gmail.com'
);