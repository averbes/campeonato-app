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
    console.log('Configurando listener de autenticación...');
    const unsubscribe = auth.onAuthStateChanged(
      async (firebaseUser) => {
        console.log('Cambio en estado de autenticación:', firebaseUser ? 'Usuario presente' : 'Sin usuario');
        
        if (firebaseUser) {
          try {
            // Obtener datos adicionales del usuario desde Firestore
            const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
            console.log('Documento de usuario en Firestore:', userDoc.exists() ? 'Existe' : 'No existe');
            
            if (!userDoc.exists()) {
              console.error('Usuario no encontrado en Firestore');
              setUser(null);
              setError('Usuario no encontrado en la base de datos');
              return;
            }

            const userData = userDoc.data();
            console.log('Datos del usuario en Firestore:', userData);

            const sanitizedUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              ...userData
            };
            
            console.log('Usuario completo:', sanitizedUser);
            setUser(sanitizedUser);
            setError(null);
          } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            setError('Error al cargar datos del usuario');
            setUser(null);
          }
        } else {
          console.log('Limpiando estado de usuario');
          setUser(null);
          setError(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error en auth state:', error);
        setError(error.message);
        setUser(null);
        setLoading(false);
      }
    );

    return () => {
      console.log('Limpiando listener de autenticación');
      unsubscribe();
    };
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
      setError(null);
      console.log('AuthContext: Iniciando login...');
      
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Intentar login con Firebase
      const result = await authService.login(email, password);
      
      if (!result || !result.uid) {
        // Si el login falla, asegurarse de que el usuario esté deslogueado
        await auth.signOut();
        throw new Error('Error en la autenticación');
      }

      // Verificar que el usuario existe en Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', result.uid));
      if (!userDoc.exists()) {
        await auth.signOut();
        throw new Error('Usuario no encontrado en la base de datos');
      }

      return result;
      
    } catch (error) {
      console.error('AuthContext: Error en login:', error);
      // Asegurarse de que el usuario esté deslogueado en caso de error
      await auth.signOut();
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
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