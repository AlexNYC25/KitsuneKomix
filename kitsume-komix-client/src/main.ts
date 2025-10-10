import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { LaHomeSolid, IoLibrarySharp, HiSolidLibrary, MdLibrarybooksSharp, MdMenubookSharp, MdManageaccounts, MdLogout } from "oh-vue-icons/icons";

import { useAuthStore } from './stores/auth'

import App from './App.vue';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue'

const app = createApp(App)

app.use(createPinia())

addIcons(LaHomeSolid, IoLibrarySharp, HiSolidLibrary, MdLibrarybooksSharp, MdMenubookSharp, MdManageaccounts, MdLogout);
app.component("v-icon", OhVueIcon);

app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
 });

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: Home, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/login', component: Login, meta: { requiresAuth: false, layout: 'auth' } },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next()
  }
})



app.use(router)
app.mount('#app')
