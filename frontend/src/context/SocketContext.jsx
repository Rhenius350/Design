import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { TransactionContext } from './TransactionContext';
import toast from 'react-hot-toast';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, updateBalance } = useContext(AuthContext);
  const { addTransaction } = useContext(TransactionContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      
      newSocket.on('connect', () => {
        newSocket.emit('register_user', user._id);
      });

      newSocket.on('receive_money', (data) => {
        const { transaction, newBalance } = data;
        updateBalance(newBalance);
        addTransaction(transaction);
        
        toast.success(`You received $${transaction.amount.toLocaleString()} from ${transaction.sender.name}!`, {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#0f172a',
            color: '#10b981',
            border: '1px solid #059669'
          }
        });

        setNotifications(prev => [
          {
            id: transaction._id,
            message: `You received $${transaction.amount} from ${transaction.sender.name}`,
            timestamp: new Date()
          },
          ...prev
        ]);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, removeNotification }}>
      {children}
    </SocketContext.Provider>
  );
};
