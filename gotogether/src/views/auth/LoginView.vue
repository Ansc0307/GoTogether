<template>
  <div class="font-display bg-background-light dark:bg-background-dark min-h-screen flex">
    <div class="relative hidden lg:flex w-1/2 items-center justify-center bg-gray-900">
      <div
        class="absolute inset-0 bg-cover bg-center"
        style="background-image: url('https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1365');"
      ></div>
      <div class="absolute inset-0 bg-primary opacity-60"></div>
      <div class="relative z-10 text-center text-white px-12">
        <h1 class="text-5xl font-bold mb-4">Planifica tu próxima aventura</h1>
        <p class="text-xl">Colabora, explora y crea recuerdos inolvidables con tus amigos.</p>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
           <div class="inline-flex items-center justify-center w-16 h-16 mb-4">
              <svg class="text-primary h-12 w-12" fill="none" viewBox="0 0 49 48" xmlns="http://www.w3.org/2000/svg"><path d="M4.00015 4.6001C4.00015 4.6001 10.3637 14.6963 5.26886 24.6001C-0.42436 35.6665 4.23075 44.6001 4.23075 44.6001H45.0002C45.0002 44.6001 38.6366 34.5039 43.7315 24.6001C49.4247 13.5337 44.7694 4.6001 44.7694 4.6001H4.00015Z" fill="#D20000"></path><path d="M4.00015 4.6001H14.5807L9.63661 14.6393C7.58789 18.7303 6.27513 22.4287 5.26886 24.6001C-0.42436 35.6665 4.23075 44.6001 4.23075 44.6001H14.5807L12.5694 40.528L24.8902 24.6001L14.5807 4.6001H4.00015Z" fill="#F79E1B"></path><path d="M14.5807 4.6001H24.8902L24.8902 24.6001L12.5694 40.528L14.5807 44.6001H24.8902L24.8902 24.6001L14.5807 4.6001Z" fill="#FFEF00"></path><path d="M24.8902 4.6001H34.7246L24.8902 24.6001V44.6001H24.8902L24.8902 4.6001Z" fill="#007934"></path><path d="M34.7246 4.6001H44.7694V24.6001C49.4247 13.5337 44.7694 4.6001 44.7694 4.6001H34.7246Z" fill="#0052A5"></path><path d="M44.7694 24.6001V44.6001H34.7246L36.7359 40.528L24.8902 24.6001H44.7694Z" fill="#6C247A"></path></svg>
           </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-text-light dark:text-text-dark">
            Bienvenido de Nuevo
          </h1>
          <p class="text-subtle-light dark:text-subtle-dark mt-2">Inicia sesión para continuar tu aventura</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-text-light dark:text-text-dark">Correo Electrónico</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="tu@email.com"
                class="form-input block w-full rounded-lg border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-text-light dark:text-text-dark">Contraseña</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="form-input block w-full rounded-lg border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
              />
            </div>
          </div>

          <div class="flex items-center justify-end">
             <router-link to="/reset-password" class="font-medium text-primary hover:text-primary/80 text-sm">
                ¿Olvidaste tu contraseña?
             </router-link>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {{ isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
            </button>
          </div>
        </form>

        <div class="mt-6">
           <button
             @click="handleGoogleLogin"
             :disabled="isLoading"
             class="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
           >
             <img class="w-5 h-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo">
             <span>Iniciar Sesión con Google</span>
           </button>
         </div>

        <p v-if="authError" class="text-red-500 text-center mt-4 text-sm">{{ authError }}</p>

        <p class="mt-8 text-center text-sm text-subtle-light dark:text-subtle-dark">
          ¿No tienes una cuenta?
          <router-link to="/register" class="font-medium text-primary hover:text-primary/80">Regístrate</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth' // Asegúrate que la ruta sea correcta

const email = ref('')
const password = ref('')
const { login, loginWithGoogle, isLoading, authError } = useAuth()
const router = useRouter()

const handleLogin = async () => {
 try {
    await login(email.value, password.value)
    // Redirige al dashboard o a votaciones después del éxito
    router.push('/voting')
  } catch (error) {
    // El error se mostrará automáticamente porque `authError` es reactivo
  }
}

const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle()
    // Redirige a la página que deseas después del éxito
    router.push('/voting')
  } catch (error) {
    // El error se mostrará automáticamente
  }
}
</script>

<style scoped>
.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
/* Agrega cualquier estilo adicional si es necesario */
</style>