import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const authService = {
  // Registro de usuario
  register: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  // Login de usuario
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Logout de usuario
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }
};

export const partidosService = {
  // Obtener lista de equipos
  getEquipos: async () => {
    try {
      const equiposRef = collection(db, 'equipos');
      const snapshot = await getDocs(equiposRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Obtener resultados de partidos
  getResultados: async () => {
    try {
      const partidosRef = collection(db, 'partidos');
      const snapshot = await getDocs(partidosRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Guardar nuevo resultado
  guardarResultado: async (resultado) => {
    try {
      const partidosRef = collection(db, 'partidos');
      const docRef = await addDoc(partidosRef, resultado);
      return {
        id: docRef.id,
        ...resultado
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Actualizar resultado
  actualizarResultado: async (id, resultado) => {
    try {
      const partidoRef = doc(db, 'partidos', id);
      await updateDoc(partidoRef, resultado);
      return {
        id,
        ...resultado
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};