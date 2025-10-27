<template>
  <div class="font-display bg-background-light dark:bg-background-dark min-h-screen flex">
    <!-- Imagen lateral -->
    <div class="relative hidden lg:flex w-1/2 items-center justify-center bg-gray-900">
      <div
        class="absolute inset-0 bg-cover bg-center"
        style="background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e');"
      ></div>
      <div class="absolute inset-0 bg-primary opacity-60"></div>
      <div class="relative z-10 text-center text-white px-12">
        <h1 class="text-5xl font-bold mb-4">Recupera tu cuenta</h1>
        <p class="text-xl">Te enviaremos un enlace para restablecer tu contraseña.</p>
      </div>
    </div>

```
<!-- Formulario -->
<div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
  <div class="w-full max-w-md">
    <div class="text-center mb-10">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-text-light dark:text-text-dark">
        Recuperar Contraseña
      </h1>
      <p class="text-subtle-light dark:text-subtle-dark mt-2">
        Ingresa tu correo para recibir un enlace de recuperación
      </p>
    </div>

    <form class="space-y-6" @submit.prevent="resetPassword">
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
          class="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <button
        type="submit"
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Enviar enlace de recuperación
      </button>
    </form>

    <p v-if="message" class="text-green-500 text-center mt-4 text-sm">{{ message }}</p>
    <p v-if="error" class="text-red-500 text-center mt-4 text-sm">{{ error }}</p>

    <p class="mt-8 text-center text-sm text-subtle-light dark:text-subtle-dark">
      <router-link to="/login" class="font-medium text-primary hover:text-primary/80">Volver al inicio de sesión</router-link>
    </p>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'

const email = ref('')
const error = ref('')
const message = ref('')

const resetPassword = async () => {
  error.value = ''
  message.value = ''
  try {
    const auth = getAuth()
    await sendPasswordResetEmail(auth, email.value)
    message.value = 'Se ha enviado un enlace de recuperación a tu correo.'
  } catch (e) {
    error.value = 'Error al enviar el correo. Verifica tu dirección.'
  }
}
</script>
