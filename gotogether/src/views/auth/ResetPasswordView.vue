<template>
  <div class="font-display bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
      <h1 class="text-3xl font-bold text-center text-text-light dark:text-text-dark mb-6">
        Recuperar Contraseña
      </h1>
      <p class="text-center text-subtle-light dark:text-subtle-dark mb-6 text-sm">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form @submit.prevent="handleResetPassword" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-text-light dark:text-text-dark">
            Correo Electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="tu@email.com"
            class="mt-1 form-input block w-full rounded-lg border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {{ isLoading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
        </button>
      </form>

      <p v-if="message" class="text-green-500 text-center mt-4 text-sm">{{ message }}</p>
      <p v-if="authError" class="text-red-500 text-center mt-4 text-sm">{{ authError }}</p>

      <div class="text-center mt-8">
        <router-link to="/login" class="font-medium text-primary hover:text-primary/80 text-sm">
          ← Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth' // Asegúrate que la ruta sea correcta

const email = ref('')
const message = ref('') // Local message for success
const { resetPassword, isLoading, authError } = useAuth()

const handleResetPassword = async () => {
  message.value = '' // Clear local message
  const result = await resetPassword(email.value)
  if (result.success) {
    message.value = result.message
  }
  // Error message is handled reactively by authError from the composable
}
</script>

<style scoped>
.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>