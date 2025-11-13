import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'material-symbols';  //no olvidar poner: npm install material-symbols

const app = createApp(App)
app.use(router)
app.mount('#app')
