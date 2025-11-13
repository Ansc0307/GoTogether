// src/composables/useAuth.js
import { ref, onUnmounted, readonly } from 'vue';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
// Ya no importamos useRouter aquí

const user = ref(null);
const authError = ref(null);
const isLoading = ref(true); // Inicia en true hasta que sepamos el estado de auth
const auth = getAuth();

// Listener que actualiza el estado del usuario en tiempo real
const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser;
  isLoading.value = false;
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const signup = async (email, password) => {
  isLoading.value = true;
  authError.value = null;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    user.value = userCredential.user;
    // Quitamos el router.push('/') de aquí
  } catch (error) {
    // ... (el resto del manejo de errores se queda igual)
    let message = 'Error al crear la cuenta.';
    if (error.code === 'auth/email-already-in-use') message = 'Este correo ya está registrado.';
    if (error.code === 'auth/weak-password') message = 'La contraseña debe tener al menos 6 caracteres.';
    authError.value = message;
    // Re-lanzamos el error para que el componente sepa que falló
    throw error;
  } finally {
    isLoading.value = false;
  }
};

const login = async (email, password) => {
  isLoading.value = true;
  authError.value = null;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    user.value = userCredential.user;
    // Quitamos el router.push('/') de aquí
  } catch (error) {
    authError.value = "Correo o contraseña incorrectos.";
    throw error;
  } finally {
    isLoading.value = false;
  }
};

const loginWithGoogle = async () => {
  isLoading.value = true;
  authError.value = null;
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    user.value = result.user;
    // Quitamos el router.push('/voting') de aquí
  } catch (error) {
    authError.value = "No se pudo iniciar sesión con Google.";
    throw error;
  } finally {
    isLoading.value = false;
  }
};

const logout = async () => {
    isLoading.value = true;
    authError.value = null;
    try {
        await signOut(auth);
        user.value = null;
        // La redirección la manejará el router guard
    } catch (error) {
        authError.value = "Error al cerrar sesión.";
        throw error;
    } finally {
        isLoading.value = false;
    }
};

const resetPassword = async (email) => {
    // ... (esta función ya estaba bien, la dejamos como está)
    isLoading.value = true;
    authError.value = null;
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Se ha enviado un enlace de recuperación a tu correo.' };
    } catch (error) {
      // ... (manejo de errores)
      let userMessage = 'Error al enviar el correo.';
      if (error.code === 'auth/user-not-found') userMessage = 'No existe cuenta con ese correo.';
      authError.value = userMessage;
      return { success: false, message: userMessage };
    } finally {
      isLoading.value = false;
    }
};

export function useAuth() {
  return {
    user: readonly(user),
    authError: readonly(authError),
    isLoading: readonly(isLoading),
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  };
}