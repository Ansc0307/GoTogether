# 🎒 GoTogether

Aplicación web colaborativa para planificación de viajes en grupo.

## 🚀 Comandos

```bash
npm install        # Instalar dependencias
npm run dev        # Iniciar servidor (http://localhost:5173)
```

## 📂 Arquitectura

```
src/
├── components/        # Componentes pequeños y reutilizables
│   ├── AppNavbar.vue      # Navbar global (compartido)
│   ├── auth/              # Componentes de autenticación
│   ├── chat/              # Componentes de chat
│   ├── voting/            # Componentes de votaciones
│   ├── budget/            # Componentes de presupuesto
│   ├── tasks/             # Componentes de tareas
│   └── trips/             # Componentes de viajes
│
├── views/             # Páginas completas (una por URL)
│   ├── Home.vue           # Página de inicio
│   ├── auth/              # Páginas de login/registro
│   ├── chat/              # Páginas de chat
│   ├── voting/            # Páginas de votaciones
│   ├── budget/            # Páginas de presupuesto
│   ├── tasks/             # Páginas de tareas
│   └── trips/             # Páginas de viajes
│
├── router/            # Rutas de navegación (URLs)
├── firebase/          # Configuración de Firebase
├── composables/       # Lógica reutilizable (useAuth, useVoting, etc.)
└── utils/             # Funciones auxiliares (formatear fechas, validaciones)
```

### � ¿Qué va en cada carpeta?

- **`components/`**: Piezas pequeñas de UI (botones, cards, formularios)
- **`views/`**: Páginas completas que se muestran en una URL
- **`router/`**: Define qué página se muestra en cada URL
- **`firebase/`**: Conexión con la base de datos
- **`composables/`**: Lógica que se puede reutilizar (obtener datos, guardar, etc.)
- **`utils/`**: Funciones auxiliares generales

## 👥 Equipo

| Persona | Módulo |
|---------|--------|
| **Ayana Siegle** | Chat Grupal |
| **Daniela Guzmán** | Presupuesto |
| **Josué Nisthaus** | Votaciones |
| **Gabriela Barrios** | Tareas |
| **Andrea Fernández** | Autenticación |
| **Ezequiel Gómez** | Viajes |

Cada persona trabaja en su carpeta: `components/{su-modulo}/` y `views/{su-modulo}/`

## �💡 Tips

- ✅ Usa `AppNavbar.vue` (no crees navbars nuevos)
- ✅ Haz commits frecuentes
- ✅ Prueba tu código antes de hacer push
- ✅ Usa las carpetas que te corresponden

## 📦 Tecnologías

- Vue 3 + Vite
- Firebase (Base de datos)
- Tailwind CSS
- Vue Router

---

**Equipo GoTogether** | Octubre 2025
