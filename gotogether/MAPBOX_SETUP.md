# 🗺️ Guía de Configuración de Mapbox

## ✨ ¿Por qué Mapbox?

- ✅ **GRATIS** para siempre (hasta 50,000 cargas de mapa/mes)
- ✅ **NO requiere tarjeta de crédito**
- ✅ **Sin límites estrictos** para proyectos pequeños
- ✅ **Más fácil de configurar** que Google Maps
- ✅ **Mejor rendimiento** y personalización
- ✅ **Mapas hermosos** y modernos

---

## 🚀 Configuración Rápida (3 minutos)

### **Paso 1: Crear cuenta en Mapbox** (GRATIS)

1. Ve a [mapbox.com](https://account.mapbox.com/auth/signup/)
2. Crea tu cuenta (puedes usar Google/GitHub)
3. **NO necesitas ingresar tarjeta de crédito** ✅

### **Paso 2: Obtener tu Access Token**

1. Una vez que inicies sesión, serás redirigido a tu dashboard
2. Verás tu **Default Public Token** en la página principal
3. O ve a: [Access Tokens](https://account.mapbox.com/access-tokens/)
4. Copia el token que comienza con `pk.eyJ1...`

### **Paso 3: Configurar en tu Proyecto**

1. Abre el archivo `gotogether/.env`
2. Reemplaza `TU_ACCESS_TOKEN_AQUI` con tu token:

```bash
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibWl1c3VhcmlvIiwiYSI6ImNsxxxxx...
```

### **Paso 4: Reiniciar el Servidor**

```bash
cd gotogether
npm run dev
```

¡Listo! 🎉 Tu mapa debería funcionar ahora.

---

## 🎨 Estilos de Mapa Disponibles

Puedes cambiar el estilo del mapa en `src/config/mapbox.js`:

```javascript
export const MAPBOX_CONFIG = {
  accessToken: '...',
  style: 'mapbox://styles/mapbox/streets-v12', // Cambia esto
  language: 'es'
}
```

### Estilos disponibles:

| Estilo | URL | Descripción |
|--------|-----|-------------|
| **Calles** | `mapbox://styles/mapbox/streets-v12` | Mapa urbano detallado |
| **Outdoors** | `mapbox://styles/mapbox/outdoors-v12` | Ideal para senderismo |
| **Light** | `mapbox://styles/mapbox/light-v11` | Minimalista claro |
| **Dark** | `mapbox://styles/mapbox/dark-v11` | Minimalista oscuro |
| **Satélite** | `mapbox://styles/mapbox/satellite-v9` | Vista satelital |
| **Satélite con calles** | `mapbox://styles/mapbox/satellite-streets-v12` | Híbrido |
| **Navegación Día** | `mapbox://styles/mapbox/navigation-day-v1` | Para navegación |
| **Navegación Noche** | `mapbox://styles/mapbox/navigation-night-v1` | Navegación nocturna |

---

## 💰 Límites Gratuitos

### Tier Gratuito (Sin tarjeta)
- ✅ **50,000 cargas de mapa** por mes
- ✅ **50,000 solicitudes de geocodificación**
- ✅ **Actualizaciones ilimitadas** del mapa
- ✅ **Todos los estilos** incluidos

### Ejemplo de uso:
- **Pequeño negocio:** 100 usuarios/día × 30 días = 3,000 cargas/mes ✅
- **Proyecto universitario:** 500 usuarios/mes = 500 cargas ✅
- **App personal:** Ilimitado para uso propio ✅

---

## 🛠️ Características Implementadas

### ✨ Funcionalidades del Mapa

| Función | Estado | Descripción |
|---------|--------|-------------|
| Mapa interactivo | ✅ | Mapbox totalmente funcional |
| Marcadores personalizados | ✅ | Colores por categoría |
| Popups informativos | ✅ | Info al hacer click |
| Zoom +/- | ✅ | Controles personalizados |
| **Geocoding & Search** | ✅ | **Búsqueda de lugares** |
| **Address Autofill** | ✅ | **Autocompletado de direcciones** |
| **Reverse Geocoding** | ✅ | **Coordenadas → Dirección** |
| Geolocalización | ✅ | Botón "Mi ubicación" |
| Animaciones | ✅ | Transiciones suaves |
| Responsive | ✅ | Móvil y desktop |
| Modo oscuro | ✅ | Soporte completo |
| Sincronización | ✅ | Tiempo real con Firestore |

### 🎨 Marcadores por Categoría

| Categoría | Color |
|-----------|-------|
| Restaurante | 🔴 Rojo |
| Hotel | 🔵 Turquesa |
| Atracción | 💙 Azul claro |
| Transporte | 🟠 Naranja |
| Compras | 🟢 Verde agua |
| Naturaleza | 🌿 Verde |
| Cultura | 💜 Morado |
| General | 🔷 Azul oscuro |

---

## 🐛 Solución de Problemas

### ❌ Error: "Access Token not valid"
**Solución:**
1. Verifica que copiaste el token completo (empieza con `pk.`)
2. Asegúrate de no tener espacios al inicio o final
3. El token debe estar en el archivo `.env`

### ❌ El mapa no se carga
**Solución:**
1. Verifica que el archivo `.env` existe en `gotogether/`
2. Reinicia el servidor completamente (`Ctrl+C` y `npm run dev`)
3. Verifica la consola del navegador para errores

### ❌ Error: "Style is not done loading"
**Solución:**
- Es un warning normal, el mapa funcionará correctamente
- Los marcadores se cargarán cuando el estilo esté listo

### ❌ Marcadores no aparecen
**Solución:**
1. Verifica que tienes puntos guardados en Firestore
2. Revisa la consola para errores
3. Asegúrate de que las coordenadas sean válidas (lat, lng)

---

## 🔒 Seguridad

### ✅ Buenas Prácticas

1. **Access Token en `.env`** (no en el código)
2. **`.env` en `.gitignore`** (no subir a Git)
3. **Token público** (para uso en frontend)

### 🔐 Restricciones Opcionales

Puedes restringir tu token a dominios específicos:

1. Ve a [Access Tokens](https://account.mapbox.com/access-tokens/)
2. Click en tu token
3. En "Token restrictions", agrega:
   - `http://localhost:*` (desarrollo)
   - `https://tudominio.com/*` (producción)

---

## 🌍 Uso del Mapa

### Agregar un Punto
1. Click en "Agregar Punto de Interés"
2. Llena nombre, ubicación, coordenadas
3. Usa "Usar mi ubicación actual" para auto-completar
4. Selecciona una categoría
5. Click en "Guardar Punto"

### Interactuar con el Mapa
- **Click en marcador** → Ver información
- **Click en mapa** → Obtener coordenadas
- **Botón +/-** → Zoom
- **Botón ubicación** → Centrar en ti
- **Seleccionar en lista** → Volar al punto

---

## 📱 Responsive Design

El mapa se adapta perfectamente a:
- 📱 Móviles (iPhone, Android)
- 💻 Tablets (iPad, etc.)
- 🖥️ Desktop (todas las resoluciones)

---

## 🎯 Próximos Pasos

### Mejoras Sugeridas

1. **Agregar búsqueda de lugares**
   - Usa Mapbox Geocoding API
   - Buscar restaurantes, hoteles, etc.

2. **Rutas entre puntos**
   - Mapbox Directions API
   - Mostrar ruta más rápida

3. **Clusterización**
   - Agrupar marcadores cercanos
   - Mejor rendimiento con muchos puntos

4. **Capas personalizadas**
   - Agregar áreas de interés
   - Polígonos, líneas, etc.

---

## 📚 Recursos Útiles

- [Documentación oficial de Mapbox](https://docs.mapbox.com/mapbox-gl-js/)
- [Ejemplos de Mapbox](https://docs.mapbox.com/mapbox-gl-js/example/)
- [Estilos de mapa](https://docs.mapbox.com/api/maps/styles/)
- [Geocoding API](https://docs.mapbox.com/api/search/geocoding/)

---

## 💡 Tips y Trucos

### Cambiar el centro inicial
```javascript
// src/config/mapbox.js
export const DEFAULT_CENTER = {
  lng: -68.15,  // Tu longitud
  lat: -16.5    // Tu latitud
}
```

### Cambiar el zoom inicial
```javascript
// src/config/mapbox.js
export const DEFAULT_ZOOM = 12  // 0-22
```

### Personalizar colores de marcadores
```javascript
// src/components/mapas/MapboxMap.vue
const markerColors = {
  restaurante: '#FF6B6B',  // Cambia estos colores
  hotel: '#4ECDC4',
  // ...
}
```

---

## ✅ Checklist Final

- [ ] Cuenta de Mapbox creada
- [ ] Access Token copiado
- [ ] Archivo `.env` configurado
- [ ] Servidor reiniciado
- [ ] Mapa visible en la app
- [ ] Marcadores funcionando
- [ ] Puntos guardados en Firestore
- [ ] Búsqueda con geocoding funcionando

---

## 🎉 ¡Todo Listo!

Ahora tienes un mapa completamente funcional con:
- 🗺️ Mapbox integrado (GRATIS)
- 📍 Marcadores personalizados
- 💾 Guardado en Firestore
- 🔄 Sincronización en tiempo real
- 📱 Diseño responsive
- 🎨 Modo oscuro
- 🔍 Búsqueda y geocoding
- 📝 Autocompletado de direcciones

---

## 📖 Documentación Adicional

- **Geocoding y Búsqueda:** Ver `MAPBOX_GEOCODING.md` para guía completa de uso
- **API de Mapbox:** [docs.mapbox.com](https://docs.mapbox.com/)
- **Geocoding API:** [docs.mapbox.com/api/search/geocoding](https://docs.mapbox.com/api/search/geocoding/)

**¡Disfruta tu mapa!** 🚀
