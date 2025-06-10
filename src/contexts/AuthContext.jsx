import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { authService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        // Sanitizar datos del usuario antes de guardarlos
        if (user) {
          const sanitizedUser = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            // No incluir información sensible
          };
          setUser(sanitizedUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error en auth state:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const register = async (email, password) => {
    try {
      // Validar entrada
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      
      const result = await authService.register(email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
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
      await authService.logout();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    clearError
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

import { useAuth } from '../contexts/AuthContext';

function LoginComponent() {
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirigir o mostrar mensaje de éxito
    } catch (error) {
      // Manejar error
    }
  };
}