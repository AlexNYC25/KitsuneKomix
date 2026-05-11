import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import Tooltip from 'primevue/tooltip';

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { LaHomeSolid, IoLibrarySharp, HiSolidLibrary, MdLibrarybooksSharp, MdManageaccounts, MdLogout, IoArrowBack, IoGridOutline, IoList, IoPlayBack, IoPlayForward, IoPlaySkipBack, IoPlaySkipForward, IoCaretBackCircle, IoCaretForwardCircle, IoCaretDownCircle, BiArrowsExpand, BiArrowsCollapse, IoClose, IoSettingsSharp, IoDocument, IoBook, MdMenubookSharp, MdLocallibrary, IoPerson, IoLockClosed, IoPencilSharp, IoAddCircle, IoTrash, MdListRound } from "oh-vue-icons/icons";

import { useAuthStore } from '@/stores/auth'

import App from '@/App.vue';
import Home from '@/pages/HomePage.vue';
import Login from '@/pages/LoginPage.vue'
import ComicSeries from '@/pages/ComicSeriesPage.vue';
import ComicBook from '@/pages/ComicBookPage.vue';
import Settings from '@/pages/SettingsPage.vue';

const app = createApp(App)

app.use(createPinia())

addIcons(LaHomeSolid, IoLibrarySharp, HiSolidLibrary, MdLibrarybooksSharp, MdManageaccounts, MdLogout, IoArrowBack, IoGridOutline, IoList, IoPlayBack, IoPlayForward, IoPlaySkipBack, IoPlaySkipForward, IoCaretBackCircle, IoCaretForwardCircle, IoCaretDownCircle, BiArrowsExpand, BiArrowsCollapse, IoClose, IoSettingsSharp, IoDocument, IoBook, MdMenubookSharp, MdLocallibrary, IoPerson, IoLockClosed, IoPencilSharp, IoAddCircle, IoTrash, MdListRound);
app.component("v-icon", OhVueIcon);

app.directive('tooltip', Tooltip);

const KitsunePreset = definePreset(Aura, {
  primitive: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    }
  },
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}'
    }
  }
});

app.use(PrimeVue, {
  theme: {
    preset: KitsunePreset,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false
    }
  }
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/login', component: Login, meta: { requiresAuth: false, layout: 'auth' } },
    { path: '/comic-series/:id', component: ComicSeries, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/comic-book/:id', component: ComicBook, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/settings', component: Settings, meta: { requiresAuth: true, layout: 'default' } }
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
