import React, { createContext, useContext } from 'react';

/**
 * Auth Context
 * TODO: Implement with OAuth when authentication module is ready
 * This will handle user authentication state and operations
 */

interface User {
  id: string;
  email?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // TODO: Implement authentication logic
  const value: AuthContextType = {
    user: null,
    isLoading: false,
    login: async () => {},
    logout: () => {},
    isAuthenticated: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
