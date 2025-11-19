<template>
  <div class="border rounded-lg p-4">
    <h3 class="font-bold mb-2">Vista Día</h3>
    <ul>
      <li v-for="event in events" :key="event.id" :class="eventClass(event)">
        {{ event.start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }} - {{ event.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  events: Array
})

const eventClass = (event) => {
  switch(event.type){
    case 'tareas': return 'bg-yellow-100 border-l-4 border-yellow-400 p-2 my-1 rounded'
    case 'votaciones': return 'bg-purple-100 border-l-4 border-purple-400 p-2 my-1 rounded'
    case 'trips': return 'bg-green-100 border-l-4 border-green-400 p-2 my-1 rounded'
    default: return ''
  }
}
</script>
