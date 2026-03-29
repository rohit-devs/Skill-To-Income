import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { getApiErrorMessage } from '../utils/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'skillearn_user';

const normalizeUser = (user, fallbackToken) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'student',
    city: user.city || '',
    college: user.college || '',
    skills: Array.isArray(user.skills) ? user.skills : [],
    businessName: user.businessName || '',
    isSenior: Boolean(user.isSenior),
    isVerified: Boolean(user.isVerified),
    tasksCompleted: user.tasksCompleted || 0,
    tasksPosted: user.tasksPosted || 0,
    totalEarned: user.totalEarned || 0,
    totalSpent: user.totalSpent || 0,
    rating: user.rating || 0,
    ratingCount: user.ratingCount || 0,
    verifiedSkills: Array.isArray(user.verifiedSkills) ? user.verifiedSkills : [],
    token: user.token || fallbackToken || '',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return normalizeUser(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      if (!user?.token) {
        if (active) setAuthReady(true);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (!active) return;

        const normalized = normalizeUser(data, user.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        setUser(normalized);
      } catch {
        if (!active) return;
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        if (active) setAuthReady(true);
      }
    };

    setAuthReady(false);
    hydrateSession();

    return () => {
      active = false;
    };
  }, [user?.token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const normalized = normalizeUser(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setUser(normalized);
      return normalized;
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Login failed');
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', formData);
      const normalized = normalizeUser(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setUser(normalized);
      return normalized;
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Registration failed');
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setError('');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((current) => {
      const updated = normalizeUser({ ...current, ...updates }, current?.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, authReady, loading, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
