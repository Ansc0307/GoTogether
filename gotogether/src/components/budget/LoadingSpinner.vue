<!--/components/budget/LoadingSpinner.vue-->
<template>
  <div class="flex justify-center items-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <span class="ml-3 text-lg text-foreground-light dark:text-foreground-dark">{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Cargando...'
    }
  }
};
</script>