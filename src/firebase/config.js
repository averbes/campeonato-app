import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXRqLCT5U09iuCz_Honm7xmcXFWdnepeo",
  authDomain: "veterano-f8e7f.firebaseapp.com",
  projectId: "veterano-f8e7f",
  storageBucket: "veterano-f8e7f.firebasestorage.app",
  messagingSenderId: "573102466051",
  appId: "1:573102466051:web:fdf5638ab9d052f5919a36"
};

console.log('Inicializando Firebase...');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase App inicializado');

// Inicializar Auth
export const auth = getAuth(app);
console.log('Firebase Auth inicializado');

// Inicializar Firestore
export const db = getFirestore(app);
console.log('Firebase Firestore inicializado');

// Verificar conexión
auth.onAuthStateChanged((user) => {
  console.log('Estado de autenticación:', user ? 'Usuario autenticado' : 'No hay usuario');
});

// Configuración para desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Modo desarrollo activado');
  // Habilitar persistencia offline
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia fallida: múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
      console.warn('El navegador no soporta persistencia');
    }
  });
}