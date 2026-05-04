import { configureAuth } from 'centaurea-ui-shared';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, apiUrl }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const authManagerRef = useRef(null);

  useEffect(() => {
    const manager = configureAuth(apiUrl);
    authManagerRef.current = manager;

    manager.onUserChange = (updatedUser, updatedToken) => {
      setUser(updatedUser);
      setToken(updatedToken);
      setIsLoading(false);
    };

    const storedUser = manager.getUser();
    const storedToken = manager.getToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
    setIsLoading(false);

    return () => { manager.onUserChange = undefined; };
  }, [apiUrl]);

  const register = (name, email, password) => authManagerRef.current?.register(name, email, password);
  const login = (email, password) => authManagerRef.current?.login(email, password);
  const logout = () => authManagerRef.current?.logout();

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user && !!token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
