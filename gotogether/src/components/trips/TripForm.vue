<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm overflow-y-auto py-8">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn my-auto">
      <!-- Botón cerrar -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10">
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>
      <!-- Encabezado -->
      <div class="sticky top-0 bg-white pt-2 pb-4 -mx-8 px-8 border-b">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-1">
          Organiza un nuevo viaje
        </h2>
        <p class="text-center text-gray-500 text-sm">
          Planifica tu próxima aventura
        </p>
      </div>

      <!-- 🔹 Spinner -->
      <LoadingSpinner v-if="cargando" message="Guardando tu viaje..." />

      <!-- Indicadores -->
      <div v-if="sendingEmails" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span class="text-blue-700 text-sm">Enviando {{ miembros.length }} invitación(es)...</span>
        </div>
      </div>

      <div v-if="miembros.length > 0 && !enviarInvitaciones" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-center">
          <span class="text-yellow-700 text-sm">⚠️ Se agregarán {{ miembros.length }} colaborador(es) sin enviar invitaciones por email.</span>
        </div>
      </div>

      <!-- Formulario -->
      <form v-if="!cargando" @submit.prevent="crearViaje" class="space-y-4 mt-4">
        <!-- Nombre del viaje -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Nombre del viaje *</label>
          <input v-model="nuevoViaje.nombre" type="text" placeholder="Ej. Aventura en los Andes" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" required />
        </div>

        <!-- Destino -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Destino específico</label>
          <input v-model="nuevoViaje.destinoEspecifico" type="text" placeholder="Ej. Salar de Uyuni, Lago Titicaca" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"/>
        </div>

        <!-- Fechas - EN DOS COLUMNAS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-gray-700 font-medium mb-1">Fecha inicio *</label>
            <input
              v-model="nuevoViaje.fechaInicio"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-1">Fecha fin *</label>
            <input
              v-model="nuevoViaje.fechaFin"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>

        <!-- Presupuesto -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Presupuesto base (opcional)</label>
          <div class="flex items-center border border-gray-300 rounded-lg px-3 py-2">
            <span class="text-gray-500 mr-2">Bs.</span>
            <input
              v-model="nuevoViaje.presupuesto"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="flex-1 outline-none border-none bg-transparent"
            />
          </div>
        </div>

        <!-- Alias propio -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Tu alias (opcional)</label>
          <input
            v-model="selfAlias"
            type="text"
            placeholder="Cómo quieres que te vean (ej. Ana)"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <!-- Separador -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">👥 Invitar colaboradores</h3>
          
          <!-- Agregar miembro - EN DOS COLUMNAS -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label class="block text-gray-700 text-sm mb-1">Correo electrónico</label>
              <input
                v-model="correoMiembro"
                type="email"
                placeholder="correo@ejemplo.com"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-gray-700 text-sm mb-1">Alias (opcional)</label>
              <div class="flex gap-2">
                <input
                  v-model="aliasMiembro"
                  type="text"
                  placeholder="Nombre para mostrar"
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  type="button"
                  @click="agregarMiembro"
                  class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm whitespace-nowrap"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Lista de miembros agregados - MEJOR DISEÑO -->
          <div v-if="miembros.length > 0" class="mt-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-700 text-sm font-medium">
                {{ miembros.length }} colaborador(es) agregado(s)
              </span>
              <button
                type="button"
                @click="limpiarMiembros"
                class="text-red-500 hover:text-red-700 text-sm"
              >
                Limpiar todos
              </button>
            </div>
            
            <!-- Grid de 2 columnas para miembros -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              <div
                v-for="(correo, index) in miembros"
                :key="correo"
                class="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-center"
              >
                <div class="truncate">
                  <div class="font-medium text-gray-800 text-sm">
                    {{ aliasMap[correo] || 'Sin alias' }}
                  </div>
                  <div class="text-gray-500 text-xs truncate">
                    {{ correo }}
                  </div>
                </div>
                <button
                  type="button"
                  @click="eliminarMiembro(index)"
                  class="text-gray-400 hover:text-red-500 text-lg ml-2 flex-shrink-0"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Checkbox para enviar emails -->
            <div class="mt-4 pt-4 border-t">
              <label class="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="enviarInvitaciones"
                  class="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span class="text-gray-700 font-medium">
                    📧 Enviar invitaciones por correo
                  </span>
                  <p class="text-gray-500 text-xs mt-1">
                    Cada colaborador recibirá un email con el enlace para unirse al viaje.
                    <span class="text-yellow-600 font-medium">
                      Desmarca esta opción si estás usando emails de prueba.
                    </span>
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="pt-4 border-t">
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="cargando || sendingEmails"
              class="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="cargando" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              <span v-else class="material-symbols-outlined text-base">explore</span>
              {{ cargando ? 'Creando viaje...' : 'Crear Viaje' }}
            </button>
          </div>
          
          <!-- Info adicional -->
          <p class="text-gray-500 text-xs text-center mt-3">
            * Campos obligatorios. Las invitaciones por email usan EmailJS (200 emails/mes gratis).
          </p>
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

  // 🔍 DEBUG DETALLADO - MOSTRAR TODOS LOS DATOS
  console.log('🔍 === DEBUG COMPLETO TripForm.vue ===');
  console.log('📋 DATOS DEL FORMULARIO:');
  console.log('- Nombre viaje:', nuevoViaje.value.nombre);
  console.log('- Destino específico:', nuevoViaje.value.destinoEspecifico);
  console.log('- Fecha inicio:', nuevoViaje.value.fechaInicio, '(tipo:', typeof nuevoViaje.value.fechaInicio + ')');
  console.log('- Fecha fin:', nuevoViaje.value.fechaFin, '(tipo:', typeof nuevoViaje.value.fechaFin + ')');
  console.log('- Presupuesto:', nuevoViaje.value.presupuesto, '(tipo:', typeof nuevoViaje.value.presupuesto + ')');
  console.log('');
  
  console.log('👤 DATOS DEL USUARIO:');
  console.log('- Self alias:', selfAlias.value);
  console.log('');
  
  console.log('👥 DATOS DE INVITADOS:');
  console.log('- Miembros totales:', miembros.value);
  console.log('- Miembros para invitación:', miembrosParaInvitacion);
  console.log('- Alias map:', JSON.parse(JSON.stringify(aliasMap.value))); // Convertir Proxy a objeto
  console.log('- Enviar emails?', enviarInvitaciones.value);
  console.log('');
  
  console.log('📦 ESTRUCTURA COMPLETA DEL OBJETO:');
  console.log('nuevoViaje.value =', JSON.parse(JSON.stringify(nuevoViaje.value)));
  console.log('aliasMap.value =', JSON.parse(JSON.stringify(aliasMap.value)));
  console.log('selfAlias.value =', selfAlias.value);
  console.log('🔍 === FIN DEBUG ===');

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
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>