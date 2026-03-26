import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (pin.length !== 4) throw new Error('Transaction PIN must be exactly 4 digits');
      await register(name, email, password, mobile, pin);
      navigate('/');
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to the backend server. Please ensure Node.js and MongoDB are running.');
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-secondary/20 p-3 rounded-full inline-block mb-4">
            <UserPlus className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 text-transparent bg-clip-text">Create Account</h2>
          <p className="text-muted mt-2">Join SmartBank today</p>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input 
              type="text" 
              className="input" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input 
              type="email" 
              className="input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number</label>
            <input 
              type="text" 
              className="input" 
              value={mobile} 
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit number"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">4-Digit Transaction PIN</label>
            <input 
              type="password" 
              maxLength="4"
              className="input text-center tracking-widest text-xl font-bold font-mono" 
              value={pin} 
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="****"
              required 
            />
            <p className="text-xs text-muted mt-1">This PIN will be required for every payment.</p>
          </div>
          <button type="submit" disabled={loading} className="btn btn-secondary w-full shadow-secondary/30 shadow-lg mt-6">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-slate-400 text-sm">
          Already have an account? <Link to="/login" className="text-secondary hover:underline transition-all">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
