import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Tooltip from 'primevue/tooltip';

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { LaHomeSolid, IoLibrarySharp, HiSolidLibrary, MdLibrarybooksSharp, MdManageaccounts, MdLogout, IoArrowBack, IoGridOutline, IoList, IoPlayBack, IoPlayForward, IoPlaySkipBack, IoPlaySkipForward, IoCaretBackCircle, IoCaretForwardCircle, IoCaretDownCircle, BiArrowsExpand, BiArrowsCollapse, IoClose, IoSettingsSharp, IoDocument, IoBook, MdMenubookSharp, MdLocallibrary, IoPerson, IoLockClosed, IoPencilSharp, IoAddCircle, IoTrash, MdListRound } from "oh-vue-icons/icons";

import { useAuthStore } from './stores/auth'

import App from './App.vue';
import Home from './pages/HomePage.vue';
import Login from './pages/LoginPage.vue'
import ComicSeries from './pages/ComicSeriesPage.vue';
import ComicBook from './pages/ComicBookPage.vue';
import Settings from './pages/SettingsPage.vue';

const app = createApp(App)

app.use(createPinia())

addIcons(LaHomeSolid, IoLibrarySharp, HiSolidLibrary, MdLibrarybooksSharp, MdManageaccounts, MdLogout, IoArrowBack, IoGridOutline, IoList, IoPlayBack, IoPlayForward, IoPlaySkipBack, IoPlaySkipForward, IoCaretBackCircle, IoCaretForwardCircle, IoCaretDownCircle, BiArrowsExpand, BiArrowsCollapse, IoClose, IoSettingsSharp, IoDocument, IoBook, MdMenubookSharp, MdLocallibrary, IoPerson, IoLockClosed, IoPencilSharp, IoAddCircle, IoTrash, MdListRound);
app.component("v-icon", OhVueIcon);

app.directive('tooltip', Tooltip);

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
