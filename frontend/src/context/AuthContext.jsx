import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchUserData = async () => {
    try {
      if (token) {
        const res = await api.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      }
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const sendOtp = async (mobile, isRegister) => {
    return await api.post('/auth/send-otp', { mobile, isRegister });
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
  };

  const register = async (name, email, password, mobile, pin) => {
    const res = await api.post('/auth/register', { name, email, password, mobile, pin });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Function to locally update balance
  const updateBalance = (newBalance) => {
    setUser(prev => ({ ...prev, balance: newBalance }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, sendOtp, login, register, logout, updateBalance, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
