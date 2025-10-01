import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PrimeVue from 'primevue/config';

import { useAuthStore } from './stores/auth'

import App from './App.vue';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue'

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue)

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: Home, meta: { requiresAuth: true } },
    { path: '/login', component: Login, meta: { requiresAuth: false } },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

app.use(router)
app.mount('#app')
