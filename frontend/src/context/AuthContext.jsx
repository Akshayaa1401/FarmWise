import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('farmwise_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('farmwise_user');
      return null;
    }
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('farmwise_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('farmwise_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.success) {
      const authData = response.data.data;
      setToken(authData.token);
      const userData = { id: authData.id, name: authData.name, email: authData.email };
      setUser(userData);
      localStorage.setItem('farmwise_token', authData.token);
      localStorage.setItem('farmwise_user', JSON.stringify(userData));
      return { success: true, message: response.data.message };
    }
    return { success: false, message: response.data ? response.data.message : 'Login failed' };
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data && response.data.success) {
      // Registration creates the account only; authentication happens after explicit sign-in.
      setToken(null);
      setUser(null);
      localStorage.removeItem('farmwise_token');
      localStorage.removeItem('farmwise_user');
      return { success: true, message: response.data.message };
    }
    return { success: false, message: response.data ? response.data.message : 'Registration failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('farmwise_token');
    localStorage.removeItem('farmwise_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
