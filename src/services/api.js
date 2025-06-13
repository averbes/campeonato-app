import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc,
  query,
  orderBy,
  getDoc,
  setDoc,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Mapeo de errores de Firebase a mensajes en español
const errorMessages = {
  'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
  'auth/invalid-email': 'El correo electrónico no es válido',
  'auth/operation-not-allowed': 'Operación no permitida',
  'auth/weak-password': 'La contraseña es demasiado débil',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
  'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Intente más tarde',
  'auth/network-request-failed': 'Error de conexión. Verifique su conexión a internet',
  'auth/popup-closed-by-user': 'La ventana de inicio de sesión fue cerrada',
  'auth/cancelled-popup-request': 'La ventana de inicio de sesión fue cancelada',
  'auth/popup-blocked': 'La ventana de inicio de sesión fue bloqueada por el navegador'
};

// Función auxiliar para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función auxiliar para validar contraseña
const isValidPassword = (password) => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

export const authService = {
  // Registro de usuario
  register: async (email, password, userData) => {
    try {
      // Validaciones
      if (!email || !password || !userData) {
        throw new Error('Todos los campos son requeridos');
      }

      if (!isValidEmail(email)) {
        throw new Error('El correo electrónico no es válido');
      }

      if (!isValidPassword(password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
      }

      if (!userData.nombre || userData.nombre.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      if (!userData.tipoUsuario || !['ADMIN', 'PUBLICO'].includes(userData.tipoUsuario)) {
        throw new Error('Tipo de usuario no válido');
      }

      // Verificar si el email ya está registrado
      const usersRef = collection(db, 'usuarios');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Este correo electrónico ya está registrado');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar perfil del usuario
      await updateProfile(user, {
        displayName: userData.nombre
      });

      // Enviar email de verificación
      await sendEmailVerification(user);

      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: user.email,
        nombre: userData.nombre,
        tipoUsuario: userData.tipoUsuario,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return user;
    } catch (error) {
      console.error('Error en registro:', error);
      throw new Error(errorMessages[error.code] || error.message || 'Error al registrar usuario');
    }
  },

  // Login de usuario
  login: async (email, password) => {
    try {
      console.log('Intentando login con:', email, password);
      // Validaciones
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      if (!isValidEmail(email)) {
        throw new Error('El correo electrónico no es válido');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario autenticado:', user);

      // Verificar si el email está verificado
      // if (!user.emailVerified) {
      //   await sendEmailVerification(user);
      //   throw new Error('Por favor, verifica tu correo electrónico antes de iniciar sesión');
      // }

      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      console.log('Documento Firestore:', userDoc);

      if (!userDoc.exists()) {
        console.log('No existe el usuario en Firestore');
        throw new Error('Usuario no encontrado en la base de datos');
      }

      const userData = userDoc.data();
      console.log('Datos Firestore:', userData);

      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        ...userData
      };
    } catch (error) {
      console.error('Error en login (servicio):', error);
      throw new Error(errorMessages[error.code] || error.message || 'Error al iniciar sesión');
    }
  },

  // Login con Google
  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      
      if (!userDoc.exists()) {
        // Si es nuevo usuario, guardar en Firestore
        await setDoc(doc(db, 'usuarios', user.uid), {
          email: user.email,
          nombre: user.displayName,
          tipoUsuario: 'PUBLICO',
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return user;
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw new Error(errorMessages[error.code] || error.message || 'Error al iniciar sesión con Google');
    }
  },

  // Recuperar contraseña
  resetPassword: async (email) => {
    try {
      if (!email || !isValidEmail(email)) {
        throw new Error('El correo electrónico no es válido');
      }

      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      throw new Error(errorMessages[error.code] || error.message || 'Error al enviar email de recuperación');
    }
  },

  // Logout de usuario
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw new Error('Error al cerrar sesión');
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      const userData = userDoc.data();

      return {
        ...user,
        ...userData
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      throw new Error(error.message || 'Error al obtener datos del usuario');
    }
  }
};

export const partidosService = {
  // Obtener lista de equipos
  getEquipos: async () => {
    try {
      const equiposRef = collection(db, 'equipos');
      const q = query(equiposRef, orderBy('nombre'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      throw new Error('No se pudieron cargar los equipos. Por favor, intente más tarde.');
    }
  },

  // Obtener resultados de partidos
  getResultados: async () => {
    try {
      const partidosRef = collection(db, 'partidos');
      const q = query(partidosRef, orderBy('fecha', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      throw new Error('No se pudieron cargar los resultados. Por favor, intente más tarde.');
    }
  },

  // Guardar nuevo resultado
  guardarResultado: async (resultado) => {
    if (!auth.currentUser) {
      throw new Error('Debe iniciar sesión para realizar esta acción');
    }

    try {
      const partidosRef = collection(db, 'partidos');
      const docRef = await addDoc(partidosRef, {
        ...resultado,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid
      });
      return {
        id: docRef.id,
        ...resultado
      };
    } catch (error) {
      console.error('Error al guardar resultado:', error);
      throw new Error('No se pudo guardar el resultado. Por favor, intente más tarde.');
    }
  },

  // Actualizar resultado
  actualizarResultado: async (id, resultado) => {
    if (!auth.currentUser) {
      throw new Error('Debe iniciar sesión para realizar esta acción');
    }

    try {
      const partidoRef = doc(db, 'partidos', id);
      await updateDoc(partidoRef, {
        ...resultado,
        updatedAt: new Date(),
        updatedBy: auth.currentUser.uid
      });
      return {
        id,
        ...resultado
      };
    } catch (error) {
      console.error('Error al actualizar resultado:', error);
      throw new Error('No se pudo actualizar el resultado. Por favor, intente más tarde.');
    }
  }
};