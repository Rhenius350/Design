import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';

// We will create these pages next
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import History from './pages/History';
import Navbar from './components/Navbar';

import ScanPay from './pages/ScanPay';
import Recharge from './pages/Recharge';
import Cards from './pages/Cards';
import Investments from './pages/Investments';
import Loans from './pages/Loans';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex text-white items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 lg:p-8 max-w-6xl">
        {children}
      </div>
    </>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex text-white items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <>
      <Toaster 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155'
          }
        }} 
      />
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><ScanPay /></ProtectedRoute>} />
        <Route path="/recharge" element={<ProtectedRoute><Recharge /></ProtectedRoute>} />
        <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
        <Route path="/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
