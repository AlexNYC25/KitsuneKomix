import { computed } from 'vue';

import { authClient } from '../utilities/auth-client';

export const useAuth = () => {
  const session = authClient.useSession();

  return {
    session,
    user: computed(() => session.value.data?.user),
    isAuthenticated: computed(() => !!session.value.data?.user),
    isPending: computed(() => session.value.isPending),
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    error: computed(() => session.value.error),
  }
}
