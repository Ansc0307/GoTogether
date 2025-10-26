<!-- /components/trips/TripList.vue -->
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import TripCard from "./TripCard.vue";

const trips = ref([]);

onMounted(() => {
  onSnapshot(collection(db, "trips"), (snapshot) => {
    trips.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
});
</script>
