import { useCallback } from 'react';

/**
 * Custom hook for authentication state and operations
 * TODO: Integrate with actual auth provider when OAuth is implemented
 */
export const useAuth = () => {
  const getUser = useCallback(() => {
    // Placeholder until OAuth is implemented
    return { id: 'USER_001', role: 'USER' };
  }, []);

  const isAdmin = useCallback(() => {
    const user = getUser();
    return user.role === 'ADMIN';
  }, [getUser]);

  return {
    user: getUser(),
    isAdmin,
    getUser,
  };
};
