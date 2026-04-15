import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { account } from '../lib/appwrite.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account.get()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    await account.createEmailPasswordSession({ email, password });
    const currentUser = await account.get();
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    await account.deleteSession({ sessionId: 'current' });
    setUser(null);
  }, []);

  const isAdmin = useMemo(() => user?.labels?.includes('admin') ?? false, [user]);
  const isAuthenticated = user !== null;

  const value = useMemo(
    () => ({ user, loading, login, logout, isAdmin, isAuthenticated }),
    [user, loading, login, logout, isAdmin, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
