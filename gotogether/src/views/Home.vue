<template>
  <div class="home-page">
    <main class="home-content">
      <div class="hero-section">
        <div class="container">
          <h1 class="hero-title">Organiza viajes increíbles con GoTogether</h1>
          <p class="hero-description">
            La plataforma colaborativa para planificar viajes en grupo. 
            Gestiona tareas, presupuestos, votaciones y más.
          </p>
          
          <div class="hero-actions">
            <button class="cta-primary" @click="handleSignup">
              Comenzar Gratis
            </button>
            <button class="cta-secondary" @click="handleLogin">
              Iniciar Sesión
            </button>
          </div>
          
          <!-- Link temporal para ver las votaciones -->
          <div class="dev-links">
<<<<<<< HEAD
            <p class="dev-note">Para iniciar sesión simulado</p>
=======
            <p class="dev-note">🚧 Enlaces de desarrollo:</p>
>>>>>>> f285d93 (feat(voting): Implementar sistema de votaciones con navbar centralizado)
            <router-link to="/voting" class="dev-link">
              Ver Sistema de Votaciones
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = () => {
  console.log('Login clicked')
  // Aquí irá la lógica de login
}

const handleSignup = () => {
  console.log('Signup clicked')
  // Aquí irá la lógica de registro
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-content {
  display: flex;
  align-items: center;
  min-height: calc(100vh - 4rem);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.hero-section {
  padding: 4rem 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.hero-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.cta-primary,
.cta-secondary {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.cta-primary {
  background: white;
  color: #1313ec;
  border: 2px solid white;
}

.cta-primary:hover {
  background: transparent;
  color: white;
}

.cta-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-secondary:hover {
  background: white;
  color: #1313ec;
}

/* Enlaces de desarrollo temporal */
.dev-links {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 2rem;
  backdrop-filter: blur(10px);
}

.dev-note {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.dev-link {
  display: inline-block;
  color: white;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.dev-link:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1.125rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-primary,
  .cta-secondary {
    width: 100%;
    max-width: 300px;
  }
  
  .container {
    padding: 0 1rem;
  }
}
</style>