<template>
  <div class="font-display bg-background-light dark:bg-background-dark min-h-screen flex">
    <div class="relative hidden lg:flex w-1/2 items-center justify-center bg-gray-900">
      <div
        class="absolute inset-0 bg-cover bg-center"
        style="background-image: url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff');"
      ></div>
      <div class="absolute inset-0 bg-primary opacity-60"></div>
      <div class="relative z-10 text-center text-white px-12">
        <h1 class="text-5xl font-bold mb-4">Crea tu cuenta y únete a la aventura</h1>
        <p class="text-xl">Regístrate para planificar viajes colaborativos y divertidos.</p>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-text-light dark:text-text-dark">
            Crear una cuenta
          </h1>
          <p class="text-subtle-light dark:text-subtle-dark mt-2">
            Únete a GoTogether y comienza a planificar tu próximo viaje
          </p>
        </div>

        <form class="space-y-6" @submit.prevent="handleSignup">
          <div>
            <label for="email" class="block text-sm font-medium text-text-light dark:text-text-dark">
              Correo Electrónico
            </label>
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
            <label for="password" class="block text-sm font-medium text-text-light dark:text-text-dark">
              Contraseña
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                type="password"
                required
                placeholder="Mínimo 8 caracteres"
                class="form-input block w-full rounded-lg border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-text-light dark:text-text-dark">
              Confirmar Contraseña
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                placeholder="Repite tu contraseña"
                class="form-input block w-full rounded-lg border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {{ isLoading ? 'Registrando...' : 'Registrarse' }}
            </button>
          </div>
        </form>

        <p v-if="error" class="text-red-500 text-center mt-4 text-sm">{{ error }}</p>
        <p v-if="successMessage" class="text-green-500 text-center mt-4 text-sm">{{ successMessage }}</p>

        <p class="mt-8 text-center text-sm text-subtle-light dark:text-subtle-dark">
          ¿Ya tienes una cuenta?
          <router-link to="/login" class="font-medium text-primary hover:text-primary/80">Inicia sesión</router-link>
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
const confirmPassword = ref('')
const error = ref('') // Local error for password mismatc
const successMessage = ref('')
const router = useRouter()
const { signup, isLoading, authError } = useAuth()

const handleSignup = async () => {
  error.value = '' // Clear local error
  successMessage.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  if (password.value.length < 8) {
     error.value = 'La contraseña debe tener al menos 8 caracteres.'
     return
  }

  try {
    await signup(email.value, password.value) // Llama a la función de registro
    successMessage.value = '¡Cuenta creada con éxito! Redirigiendo...'
    // 3. Redirige desde aquí después del éxito
    setTimeout(() => router.push('/welcome'), 1500)
  } catch (e) {
    // El error de Firebase ya está en `authError`, lo mostramos
    error.value = authError.value || 'Ocurrió un error inesperado.'
  }
}
</script>

<style scoped>
.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>