import { createRouter, createWebHistory } from 'vue-router'

import ComicSeriesGallery from '@/components/ComicSeriesGallery.vue'
import ComicBook from '@/pages/ComicBookPage.vue'
import ComicSeries from '@/pages/ComicSeriesPage.vue'
import Home from '@/pages/HomePage.vue'
import Login from '@/pages/LoginPage.vue'
import NotFound from '@/pages/NotFoundPage.vue'
import Settings from '@/pages/SettingsPage.vue'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    layout?: 'default' | 'auth'
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/login', component: Login, meta: { requiresAuth: false, layout: 'auth' } },
    { path: '/comic-series/latest', component: ComicSeriesGallery, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/comic-series/updated', component: ComicSeriesGallery, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/comic-series/:id', component: ComicSeries, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/comic-book/:id', component: ComicBook, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/settings', component: Settings, meta: { requiresAuth: true, layout: 'default' } },
    { path: '/:pathMatch(.*)*', component: NotFound, meta: { requiresAuth: false, layout: 'default' } },
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

export default router
