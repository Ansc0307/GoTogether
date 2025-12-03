<!-- components/trips/AddMemberModal.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-800">Agregar integrante</h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
      </div>

      <div class="p-6">
        <div class="space-y-4">
          <div>
            <label class="label">Correo *</label>
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label class="label">Alias (opcional)</label>
            <input
              v-model="alias"
              type="text"
              class="input"
              placeholder="Nombre"
            />
          </div>

          <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <input
              v-model="sendEmail"
              type="checkbox"
              class="rounded"
            />
            <label class="text-sm text-blue-800">
              Enviar invitación por correo
            </label>
          </div>

          <div class="flex gap-3 pt-4">
            <button @click="close" class="btn-outline flex-1">
              Cancelar
            </button>
            <button @click="addMember" class="btn-primary flex-1">
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTrips } from '@/composables/useTrips'

const props = defineProps({
  tripId: String
})

const emit = defineEmits(['members-added', 'close'])

const { addTripMember } = useTrips()

const email = ref('')
const alias = ref('')
const sendEmail = ref(true)

// Cerrar modal
const close = () => {
  emit('close')
}

// Agregar miembro
const addMember = async () => {
  const emailValue = email.value.trim().toLowerCase()

  if (!emailValue) {
    alert('Ingresa un correo')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailValue)) {
    alert('Correo inválido')
    return
  }

  try {
    const result = await addTripMember(props.tripId, emailValue, alias.value.trim(), sendEmail.value)
    
    if (result.success) {
      alert('Integrante agregado')
      email.value = ''
      alias.value = ''
      emit('members-added')
    } else {
      alert('Error: ' + result.error)
    }
  } catch (err) {
    alert('Error al agregar')
    console.error(err)
  }
}
</script>