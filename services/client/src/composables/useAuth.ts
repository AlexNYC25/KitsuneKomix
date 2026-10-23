import { authClient } from '../utilities/auth-client';

export const useAuth = () => {
  const session = authClient.useSession();

  return {
    session,
  }
}
