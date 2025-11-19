<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 w-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
        {{ monthName }} {{ currentYear }}
      </h2>
      <div class="flex gap-2">
        <button
          @click="prevMonth"
          class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          ◀
        </button>
        <button
          @click="nextMonth"
          class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          ▶
        </button>
      </div>
    </div>

    <!-- Week Days -->
    <div class="grid grid-cols-7 text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
      <div v-for="day in weekDays" :key="day">{{ day }}</div>
    </div>

    <!-- Dates Grid -->
    <div class="grid grid-cols-7 gap-1 text-center">
      <div
        v-for="(date, index) in calendarDays"
        :key="index"
        class="aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer transition
        hover:bg-blue-100 dark:hover:bg-blue-900"
        :class="{
          'text-slate-400 dark:text-slate-600': date.isOtherMonth,
          'bg-blue-600 text-white': date.isToday,
        }"
      >
        {{ date.day }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value).toLocaleString("es", {
    month: "long",
  })
);

// Generate month grid
const calendarDays = computed(() => {
  const startOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const endOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);

  const daysInMonth = endOfMonth.getDate();
  const startDay = startOfMonth.getDay(); // Sunday = 0

  const days = [];

  // Previous month padding
  const prevMonthEnd = new Date(currentYear.value, currentMonth.value, 0);
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthEnd.getDate() - i,
      isOtherMonth: true,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      i === today.getDate() &&
      currentMonth.value === today.getMonth() &&
      currentYear.value === today.getFullYear();

    days.push({
      day: i,
      isOtherMonth: false,
      isToday,
    });
  }

  // Fill the remaining grid with next month
  while (days.length % 7 !== 0) {
    days.push({
      day: days.length % 7,
      isOtherMonth: true,
    });
  }

  return days;
});

function prevMonth() {
  currentMonth.value--;
  if (currentMonth.value < 0) {
    currentMonth.value = 11;
    currentYear.value--;
  }
}

function nextMonth() {
  currentMonth.value++;
  if (currentMonth.value > 11) {
    currentMonth.value = 0;
    currentYear.value++;
  }
}
</script>

<style scoped>
.aspect-square {
  aspect-ratio: 1/1;
}
</style>
