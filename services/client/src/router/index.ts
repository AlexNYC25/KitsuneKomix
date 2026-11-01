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

  const { error, session } = useAuth();

  if ( error || !session ) {
    return {
      name: "login",
      query: { redirect: to.fullPath }
    }
  }

  return true;

})