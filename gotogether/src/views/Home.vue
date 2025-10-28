<template>
  <div class="home-page">
    <header class="hero">
      <div class="container">
        <h1 class="hero-title">Organiza viajes inolvidables con <span>GoTogether</span></h1>
        <p class="hero-description">
          La plataforma colaborativa que simplifica la planificación de viajes en grupo. 
          Gestiona tareas, presupuestos, votaciones y mucho más, todo en un solo lugar.
        </p>
        <div class="hero-actions">
          <button class="cta-primary" @click="handleSignup">Regístrate</button>
          <button class="cta-secondary" @click="handleLogin">Iniciar Sesión</button>
        </div>
      </div>
    </header>

    <main class="home-content">
      <!-- Sección: Problema y Solución -->
      <section class="section about">
        <div class="container">
          <h2>La forma inteligente de planificar en grupo</h2>
          <p>
            Organizar un viaje con amigos o familia puede ser un desafío: presupuestos desordenados, 
            tareas sin asignar, decisiones que nunca se concretan… 
            <strong>GoTogether</strong> centraliza todo el proceso en una única plataforma 
            colaborativa para que planificar sea tan divertido como viajar.
          </p>
        </div>
      </section>

      <!-- Sección: Funcionalidades -->
      <section class="section features">
        <div class="container">
          <h2>Todo lo que necesitas para coordinar tu viaje</h2>
          <div class="features-grid">
            <div class="feature">
              <img src="https://cdn-icons-png.flaticon.com/512/3400/3400783.png" alt="Gestión de tareas" />
              <h3>Gestión de tareas</h3>
              <p>Asigna responsabilidades, marca avances y mantén todo bajo control.</p>
            </div>
            <div class="feature">
              <img src="https://cdn-icons-png.flaticon.com/512/781/781760.png" alt="Presupuesto colaborativo" />
              <h3>Presupuesto colaborativo</h3>
              <p>Registra gastos, controla saldos y mantén la transparencia financiera.</p>
            </div>
            <div class="feature">
              <img src="https://cdn-icons-png.flaticon.com/512/9802/9802872.png" alt="Votaciones democráticas" />
              <h3>Votaciones democráticas</h3>
              <p>Decidan juntos actividades, fechas y lugares con un sistema de votación integrado.</p>
            </div>
            <div class="feature">
              <img src="https://cdn-icons-png.flaticon.com/512/16450/16450753.png" alt="Mapa interactivo" />
              <h3>Mapa interactivo</h3>
              <p>Descubre y organiza puntos de interés para crear itinerarios perfectos.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección: Roles de usuario -->
      <section class="section roles">
        <div class="container">
          <h2>Diseñado para todos los tipos de viajeros</h2>
          <div class="roles-grid">
            <div class="role-card">
              <h3>Propietario / Organizador</h3>
              <p>Gestiona viajes, presupuestos y votaciones. Coordina el grupo de manera efectiva.</p>
            </div>
            <div class="role-card">
              <h3>Colaborador</h3>
              <p>Participa activamente: propone ideas, completa tareas y vota en decisiones del grupo.</p>
            </div>
            <div class="role-card">
              <h3>Usuario general</h3>
              <p>Crea viajes, invita amigos y comienza la aventura con las herramientas de GoTogether.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA final -->
      <section class="section final-cta">
        <div class="container">
          <h2>Convierte la planificación en parte de la aventura</h2>
          <p>Únete a GoTogether y haz que tu próximo viaje sea organizado, divertido y colaborativo.</p>
          <button class="cta-primary" @click="handleSignup">Comenzar ahora</button>
        </div>
      </section>

      <!-- Enlaces de desarrollo -->
      <div class="dev-links">
        <p class="dev-note">Modo desarrollador</p>
        <router-link to="/voting" class="dev-link">Ver Sistema de Votaciones</router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = () => {
  router.push('/login')
}

const handleSignup = () => {
  router.push('/register')
}
</script>

<style scoped>
/* === Estilos base === */
.home-page {
  font-family: 'Inter', sans-serif;
  color: #333;
  overflow-x: hidden;
}

/* === Hero === */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6rem 1rem;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.hero-title span {
  color: #ffe082;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-inline: auto;
  opacity: 0.95;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-primary,
.cta-secondary {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.cta-primary {
  background: white;
  color: #5a4ee3;
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
  color: #5a4ee3;
}

/* === Secciones === */
.section {
  padding: 5rem 1rem;
}

.section h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #333;
}

.section p {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem;
  color: #555;
  line-height: 1.7;
}

/* === Features === */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature {
  text-align: center;
  background: #f9f9ff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature img {
  width: 60px;
  margin-bottom: 1rem;
}

/* === Roles === */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.role-card {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.role-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #5a4ee3;
}

/* === CTA final === */
.final-cta {
  background: linear-gradient(135deg, #764ba2, #667eea);
  color: white;
  text-align: center;
  padding: 6rem 1rem;
}

.final-cta h2 {
  color: white;
}

.final-cta p {
  color: rgba(255,255,255,0.9);
  max-width: 700px;
  margin-inline: auto;
  margin-bottom: 2rem;
}

/* === Dev links === */
.dev-links {
  text-align: center;
  padding: 2rem;
  background: rgba(240,240,255,0.5);
  border-top: 1px solid rgba(0,0,0,0.05);
}

.dev-note {
  font-size: 0.9rem;
  color: #666;
}

.dev-link {
  color: #5a4ee3;
  text-decoration: none;
  font-weight: 500;
}

.dev-link:hover {
  text-decoration: underline;
}

/* === Responsive === */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-description {
    font-size: 1.1rem;
  }
}
</style>
