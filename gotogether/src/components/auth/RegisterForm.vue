<template>
  <div class="font-display bg-background-light dark:bg-background-dark min-h-screen flex">
    <!-- Imagen lateral -->
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

```
<!-- Formulario -->
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

    <form class="space-y-6" @submit.prevent="registerUser">
      <div>
        <label for="email" class="block text-sm font-medium text-text-light dark:text-text-dark">Correo Electrónico</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="tu@email.com"
          class="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-text-light dark:text-text-dark">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="••••••••"
          class="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-text-light dark:text-text-dark">Confirmar Contraseña</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          placeholder="••••••••"
          class="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <button
        type="submit"
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Registrarse
      </button>
    </form>

    <p v-if="error" class="text-red-500 text-center mt-4 text-sm">{{ error }}</p>
    <p v-if="success" class="text-green-500 text-center mt-4 text-sm">{{ success }}</p>

    <p class="mt-8 text-center text-sm text-subtle-light dark:text-subtle-dark">
      ¿Ya tienes una cuenta?
      <router-link to="/login" class="font-medium text-primary hover:text-primary/80">Inicia sesión</router-link>
    </p>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()

const registerUser = async () => {
  error.value = ''
  success.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  try {
    const auth = getAuth()
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    success.value = 'Cuenta creada con éxito.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    error.value = 'Error al crear la cuenta. Verifica los datos o intenta nuevamente.'
  }
}
</script>
