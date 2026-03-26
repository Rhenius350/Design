import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoadingTransactions(false);
      return;
    }
    
    try {
      setLoadingTransactions(true);
      const res = await api.get('/transaction/history');
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev]);
  };

  return (
    <TransactionContext.Provider value={{ transactions, loadingTransactions, fetchTransactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
