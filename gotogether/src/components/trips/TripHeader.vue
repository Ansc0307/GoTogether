<!-- /components/trips/TripHeader.vue -->
<!-- /components/trips/TripHeader.vue -->
<template>
  <div class="relative bg-gray-900 text-white rounded-xl overflow-hidden shadow-md">
    <img
      src="../../assets/default_trip_image1.jpg"
      alt="Imagen del viaje"
      class="w-full h-56 object-cover opacity-70"
    />
    <div class="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
      <h1 class="text-3xl font-bold">{{ trip.name }}</h1>
      <p class="text-gray-200 text-sm mt-1">
        {{ formatDate(trip.startDate) }} – {{ formatDate(trip.endDate) }}
      </p>

      <!-- Miembros -->
      <div class="flex items-center mt-3">
        <div class="flex -space-x-2">
          <img
            v-for="member in trip.members"
            :key="member.id"
            src="https://simulacionymedicina.es/wp-content/uploads/2015/11/default-avatar-300x300-1.jpg"
            :alt="member.name"
            class="w-9 h-9 rounded-full border-2 border-white bg-white object-cover"
          />
        </div>
        <span class="ml-3 text-sm text-gray-300" v-if="trip.members.length > 1">
          +{{ trip.members.length - 1 }} más
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
});

const tripImage = "../../assets/default_trip_image1.jpg";

const formatDate = (date) => {
  if (!date) return "—";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
</script>

