

<template>
  <div id="app" class="min-h-screen w-full flex flex-col bg-background-light dark:bg-background-dark text-black dark:text-white font-display">
    <header class="flex items-center justify-between border-b border-primary/20 dark:border-primary/30 px-8 md:px-10 py-4 md:py-6">
      <div class="flex items-center gap-4">
        <div class="size-8 md:size-10">
          <!-- Logo SVG -->
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="#ff4d4d"/>
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" stroke="#000000" stroke-linejoin="round" stroke-width="2"/>
            <path d="M36.1992 4H12.8992" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <path d="M24.5 4V44" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </div>
        <h2 class="text-lg md:text-xl font-bold tracking-[-0.015em]">GoTogether</h2>
      </div>
      <nav class="flex flex-1 justify-end gap-6 md:gap-8">
        <router-link class="text-sm font-medium hover:text-primary transition" to="/test-firebase">Test Firebase</router-link>
        <router-link class="text-sm font-medium hover:text-primary transition" to="/presupuesto">Presupuesto</router-link>
      </nav>
    </header>
    <main class="flex-1 px-4 md:px-10 py-6 md:py-10 flex justify-center items-start">
      <div class="w-full max-w-[1200px]">
        <router-view />
      </div>
    </main>
  </div>
</template>


<script setup>
// No imports necesarios, router-view gestiona los componentes
</script>


<!-- Todo el estilo viene de Tailwind -->
