<!-- /components/trips/TripCard.vue -->
<template>
  <div
    class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-200"
  >
    <img
      src="../../assets/default_trip_image1.jpg"
      alt="Foto del viaje"
      class="h-48 w-full object-cover"
    />
    <div class="p-4">
      <h3 class="font-bold text-lg text-gray-900">{{ trip.name }}</h3>
      <p class="text-gray-600 text-sm">{{ trip.destination }}</p>
      <p class="text-gray-500 text-xs mt-1">
        {{ trip.startDate }} – {{ trip.endDate }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  trip: Object,
});
</script>
