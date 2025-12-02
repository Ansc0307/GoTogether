<!-- views/trips/MembersView.vue -->
<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6">Integrantes del Viaje</h1>
    
    <!-- Lista de integrantes actuales -->
    <MembersList :trip-id="tripId" />
    
    <!-- Agregar nuevos integrantes -->
    <AddMembersForm 
      :trip-id="tripId"
      :current-members="existingMembers"
      @members-added="refreshList"
    />
    
    <!-- Botón volver -->
    <div class="mt-8">
      <button 
        @click="$router.push(`/trips/${tripId}/edicion-viaje`)"
        class="btn-outline"
      >
        Volver a edición
      </button>
    </div>
  </div>
</template>