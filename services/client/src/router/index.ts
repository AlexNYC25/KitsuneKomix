import { createMemoryHistory, createRouter } from 'vue-router';

import { useAuth } from "../composables/useAuth";
import { routes } from './routes';

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

router.beforeEach( async (to) => {
  
  if (to.meta.requiresAuth === false) {
    return true;
  }

  const { error, session, isAuthenticated } = useAuth();
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      name: "login",
    }
  }

  if ( error || !session ) {
    return {
      name: "login",
      query: { redirect: to.fullPath }
    }
  }

  return true;

})