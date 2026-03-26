import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { TrendingUp, PieChart, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const Investments = () => {
  const { token, fetchUserData } = useContext(AuthContext);
  const [portfolio, setPortfolio] = useState([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('mutual_fund');
  const [assetName, setAssetName] = useState('Growth Fund X');
  const [pin, setPin] = useState('');

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/investments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPortfolio(data);
    } catch (err) { console.error('Error fetching investments'); }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const handleInvest = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error('Enter valid amount');

    if (!pin || pin.length !== 4) return toast.error('Enter a valid 4-digit PIN');

    try {
      const res = await fetch('http://localhost:5000/api/investments/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, assetName, amount: Number(amount), pin })
      });
      
      if (res.ok) {
        toast.success('Investment successful!');
        setAmount('');
        setPin('');
        fetchPortfolio();
        fetchUserData(); // Update bank balance
      } else {
        const error = await res.json();
        toast.error(error.message);
      }
    } catch (err) { toast.error('Server error'); }
  };

  const totalInvested = portfolio.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const totalValue = portfolio.reduce((acc, curr) => acc + curr.currentValue, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <TrendingUp className="text-primary" /> Investments
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-r from-emerald-900/50 to-teal-900/50">
           <div className="text-muted text-sm mb-1 uppercase tracking-wider">Total Value</div>
           <div className="text-3xl font-bold text-white">₹{totalValue.toLocaleString()}</div>
           <div className="text-emerald-400 text-sm mt-2 font-medium">
             +₹{(totalValue - totalInvested).toLocaleString()} Returns
           </div>
        </div>
        <div className="card">
           <div className="text-muted text-sm mb-1 uppercase tracking-wider">Invested Amount</div>
           <div className="text-3xl font-bold text-white">₹{totalInvested.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-white">Portfolio</h3>
          {portfolio.length === 0 ? (
            <div className="text-muted p-4 border border-white/10 rounded-xl text-center">No investments found.</div>
          ) : (
            portfolio.map(inv => (
              <div key={inv._id} className="card flex items-center justify-between p-4 bg-white/5 border-none">
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-primary/20 p-3 rounded-xl"><PieChart size={24} className="text-primary"/></div>
                  <div>
                    <h4 className="font-semibold">{inv.assetName}</h4>
                    <span className="text-xs text-muted capitalize mt-1">{inv.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">₹{inv.currentValue.toLocaleString()}</div>
                  <div className="text-xs text-emerald-400 mt-1">Invested: {inv.investedAmount}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card h-fit">
          <h3 className="text-xl font-semibold text-white mb-4">New Investment</h3>
          <form onSubmit={handleInvest} className="space-y-4">
             <div>
              <label className="block text-sm text-muted mb-1">Asset Class</label>
              <select className="input" value={type} onChange={e => setType(e.target.value)}>
                <option value="mutual_fund">Mutual Fund</option>
                <option value="stock">Stock</option>
                <option value="fixed_deposit">Fixed Deposit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Asset Name</label>
              <input type="text" className="input" placeholder="E.g., Tech Growth Fund" value={assetName} onChange={e => setAssetName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Amount (₹)</label>
              <input type="number" className="input" min="100" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-primary mb-1">4-Digit PIN</label>
              <input type="password" maxLength="4" className="input text-center tracking-widest font-mono font-bold" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required />
            </div>
            <button type="submit" className="btn btn-primary w-full"><Activity size={18} /> Invest Now</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Investments;
