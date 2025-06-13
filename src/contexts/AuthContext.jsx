import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { authService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        if (user) {
          try {
            // Obtener datos adicionales del usuario desde Firestore
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            const userData = userDoc.data();

            const sanitizedUser = {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              ...userData
            };
            setUser(sanitizedUser);
          } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            setError('Error al cargar datos del usuario');
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error en auth state:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const register = async (email, password, userData) => {
    try {
      setError(null); // Limpiar errores anteriores
      
      // Validar entrada
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      
      // Registrar usuario en Firebase Auth
      const result = await authService.register(email, password, userData);
      
      // Guardar datos adicionales en Firestore
      if (result.user) {
        await setDoc(doc(db, 'usuarios', result.user.uid), {
          email: result.user.email,
          nombre: userData.nombre,
          tipoUsuario: userData.tipoUsuario,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null); // Limpiar errores anteriores
      // Validar entrada
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      // Limitar intentos de login
      const maxAttempts = 5;
      const attemptKey = `login_attempts_${email}`;
      const attempts = parseInt(localStorage.getItem(attemptKey) || '0');
      if (attempts >= maxAttempts) {
        throw new Error('Demasiados intentos. Intente más tarde.');
      }
      const result = await authService.login(email, password);
      console.log('Login desde contexto:', result);
      // Resetear intentos después de login exitoso
      localStorage.setItem(attemptKey, '0');
      return result;
    } catch (error) {
      // Incrementar contador de intentos fallidos
      const attemptKey = `login_attempts_${email}`;
      const attempts = parseInt(localStorage.getItem(attemptKey) || '0');
      localStorage.setItem(attemptKey, (attempts + 1).toString());
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null); // Limpiar errores anteriores
      await authService.logout();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};