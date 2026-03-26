import React, { createContext, useContext } from 'react';

const AuthContext = createContext(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // TODO: Implement authentication logic
  const value = {
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
