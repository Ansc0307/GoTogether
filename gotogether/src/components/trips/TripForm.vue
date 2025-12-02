<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center overflow-y-auto py-8"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 relative animate-fadeIn">
      <!-- Botón Cerrar -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
      >
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>

      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Organiza un nuevo viaje</h2>
        <p class="text-gray-500 text-sm">Planifica tu próxima aventura</p>
      </div>

      <LoadingSpinner v-if="cargando" message="Guardando tu viaje..." />

      <!-- FORM -->
      <form
        v-if="!cargando"
        @submit.prevent="crearViaje"
        class="grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        <!-- SECCIÓN 1: Detalles del viaje -->
        <section class="space-y-4">
          <h3 class="section-title">Detalles del viaje</h3>
          <!-- Nombre -->
          <div>
            <label class="label">Nombre del viaje *</label>
            <input
              v-model="nuevoViaje.nombre"
              type="text"
              placeholder="Ej. Aventura en los Andes"
              class="input"
              required
            />
          </div>

          <!-- Destino -->
          <div>
            <label class="label">Destino específico</label>
            <input
              v-model="nuevoViaje.destinoEspecifico"
              type="text"
              placeholder="Ej. Salar de Uyuni, Lago Titicaca"
              class="input"
            />
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="label">Fecha inicio *</label>
              <input v-model="nuevoViaje.fechaInicio" type="date" class="input" required />
            </div>
            <div>
              <label class="label">Fecha fin *</label>
              <input v-model="nuevoViaje.fechaFin" type="date" class="input" required />
            </div>
          </div>

          <!-- Presupuesto -->
          <div>
            <label class="label">Presupuesto base (opcional)</label>
            <div class="input flex items-center">
              <span class="text-gray-500 mr-2">Bs.</span>
              <input
                v-model="nuevoViaje.presupuesto"
                type="number"
                min="0"
                step="0.01"
                class="flex-1 bg-transparent border-none outline-none"
              />
            </div>
          </div>
        </section>

        <!-- SECCIÓN 2: Alias + Colaboradores -->
        <section class="space-y-4">
          <!-- Alias propio movido aquí -->
          <h3 class="section-title">Detalles de los integrantes</h3>
          <div>
            <label class="label">Tu alias (opcional)</label>
            <input
              v-model="selfAlias"
              type="text"
              placeholder="Cómo quieres que te vean"
              class="input"
            />
          </div>

          <!-- Colaboradores -->
          <h3 class="section-title">Invitar colaboradores</h3>

          <!-- Agregar -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="label">Correo electrónico</label>
              <input
                v-model="correoMiembro"
                type="email"
                placeholder="correo@ejemplo.com"
                class="input"
              />
            </div>

            <div>
              <label class="label">Alias (opcional)</label>
              <div class="flex gap-2">
                <input
                  v-model="aliasMiembro"
                  type="text"
                  placeholder="Nombre a mostrar"
                  class="input"
                />
                <button
                  type="button"
                  @click="agregarMiembro"
                  class="btn-primary whitespace-nowrap"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Lista -->
          <div v-if="miembros.length > 0" class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">
                {{ miembros.length }} colaborador(es)
              </span>
              <button @click="limpiarMiembros" type="button" class="text-red-500 text-sm">
                Limpiar todos
              </button>
            </div>

            <!-- Lista scrollable -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="(correo, index) in miembros"
                :key="correo"
                class="member-item"
              >
                <div class="truncate">
                  <div class="font-medium text-sm">
                    {{ aliasMap[correo] || 'Sin alias' }}
                  </div>
                  <div class="text-xs text-gray-500 truncate">{{ correo }}</div>
                </div>
                <button
                  class="text-gray-400 hover:text-red-500"
                  @click="eliminarMiembro(index)"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Checkbox enviar emails -->
            <label class="flex items-start gap-3 border-t cursor-pointer">
              <input type="checkbox" v-model="enviarInvitaciones" class="mt-1" />
              <div>
                <span class="font-medium text-gray-700">📧 Enviar invitaciones</span>
              </div>
            </label>
          </div>
        </section>

        <!-- Botones -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-outline"
          >
            Cancelar
          </button>

          <button
            type="submit"
            :disabled="cargando || sendingEmails"
            class="btn-primary flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-base">explore</span>
            Crear Viaje
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTrips } from "@/composables/useTrips";
import LoadingSpinner from "../budget/LoadingSpinner.vue";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["close"]);

// Estado del formulario
const nuevoViaje = ref({
  nombre: "",
  destinoEspecifico: "",
  fechaInicio: "",
  fechaFin: "",
  presupuesto: "",
});

const aliasMap = ref({});
const correoMiembro = ref("");
const aliasMiembro = ref("");
const selfAlias = ref("");
const miembros = ref([]);
const enviarInvitaciones = ref(true); // Por defecto SÍ envía emails

// Composable para la lógica
const { 
  isLoading: cargando, 
  isSendingInvites: sendingEmails, 
  createTripWithInvitations,
  reset 
} = useTrips();

// Manejo de miembros
const agregarMiembro = () => {
  const correo = correoMiembro.value.trim().toLowerCase();
  const alias = aliasMiembro.value.trim();
  
  if (!correo) {
    alert("Por favor, ingresa un correo electrónico");
    return;
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    alert("Por favor, ingresa un correo electrónico válido");
    return;
  }
  
  if (!miembros.value.includes(correo)) {
    miembros.value.push(correo);
  }
  
  if (alias) {
    aliasMap.value[correo] = alias;
  }
  
  // Limpiar inputs
  correoMiembro.value = "";
  aliasMiembro.value = "";
  
  // Hacer focus en el input de email
  setTimeout(() => {
    document.querySelector('input[type="email"]')?.focus();
  }, 10);
};

const eliminarMiembro = (index) => {
  const correo = miembros.value[index];
  if (correo && aliasMap.value[correo]) {
    delete aliasMap.value[correo];
  }
  miembros.value.splice(index, 1);
};

const limpiarMiembros = () => {
  if (miembros.value.length > 0) {
    if (confirm(`¿Eliminar todos los ${miembros.value.length} colaboradores?`)) {
      miembros.value = [];
      aliasMap.value = {};
    }
  }
};

// Crear viaje
const crearViaje = async () => {
  // Validaciones
  if (!nuevoViaje.value.nombre.trim()) {
    alert("Por favor, ingresa el nombre del viaje.");
    return;
  }
  
  if (!nuevoViaje.value.fechaInicio || !nuevoViaje.value.fechaFin) {
    alert("Por favor, ingresa las fechas de inicio y fin.");
    return;
  }
  
  if (nuevoViaje.value.fechaInicio > nuevoViaje.value.fechaFin) {
    alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
    return;
  }
  
  // Determinar miembros para invitación
  const miembrosParaInvitacion = enviarInvitaciones.value ? miembros.value : [];

  try {
    const result = await createTripWithInvitations(
      nuevoViaje.value,
      miembrosParaInvitacion, // Solo envía emails si el checkbox está activado
      aliasMap.value,
      selfAlias.value,
      enviarInvitaciones.value // Pasar si debe enviar emails
    );

    if (result.success) {
      let message = "¡Viaje creado exitosamente!";
      
      if (miembros.value.length > 0) {
        if (enviarInvitaciones.value) {
          message += `\n✅ Se enviaron invitaciones a ${miembros.value.length} persona(s).`;
          message += `\n📧 Revisa la carpeta de spam si no ves los emails.`;
        } else {
          message += `\n👥 Se agregaron ${miembros.value.length} colaborador(es) (sin enviar invitaciones).`;
        }
      }
      
      // Mostrar alerta con mejor formato
      alert(message);
      
      // Log adicional para depuración
      console.log('🎉 Viaje creado exitosamente:', result.trip);
      
      resetForm();
      emit("close");
    } else {
      console.error('❌ Error en createTripWithInvitations:', result.error);
      alert("❌ Error al crear el viaje: " + result.error);
    }
  } catch (error) {
    console.error('💥 Error inesperado en crearViaje:', error);
    alert("💥 Ocurrió un error inesperado: " + error.message);
  }
};

// Resetear formulario
const resetForm = () => {
  nuevoViaje.value = {
    nombre: "",
    destinoEspecifico: "",
    fechaInicio: "",
    fechaFin: "",
    presupuesto: "",
  };
  aliasMap.value = {};
  miembros.value = [];
  correoMiembro.value = "";
  aliasMiembro.value = "";
  selfAlias.value = "";
  enviarInvitaciones.value = true;
  reset();
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Scrollbar personalizado */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #aaa; }

.section-title {
  @apply text-lg font-semibold text-gray-800;
}

.label {
  @apply block text-gray-700 font-medium mb-1;
}

.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
         focus:ring-primary focus:outline-none;
}

.btn-primary {
  @apply bg-primary text-white font-semibold px-4 py-2 rounded-lg 
         hover:bg-primary/90 transition;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 font-medium px-4 py-2 
         rounded-lg hover:bg-gray-50 transition;
}

.alert-blue {
  @apply flex items-center p-3 bg-blue-50 border border-blue-200 
         rounded-lg text-blue-700 text-sm;
}

.alert-yellow {
  @apply p-3 bg-yellow-50 border border-yellow-200 rounded-lg 
         text-yellow-700 text-sm;
}

.member-item {
  @apply bg-gray-50 border border-gray-200 rounded-lg p-3 flex 
         justify-between items-center;
}
</style>