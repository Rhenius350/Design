import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PiggyBank, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Loans = () => {
  const { token, fetchUserData } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState(12);
  const [pin, setPin] = useState('');

  const fetchLoans = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/loans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLoans(data);
    } catch (err) {}
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return toast.error('Enter a valid 4-digit PIN');
    try {
      const res = await fetch('http://localhost:5000/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), tenure, pin })
      });
      if (res.ok) {
        toast.success('Loan Approved & Disbursed!');
        setAmount('');
        setPin('');
        fetchLoans();
        fetchUserData();
      } else toast.error('Failed to apply');
    } catch (err) { toast.error('Server error'); }
  };

  const handlePayEmi = async (loanId) => {
    const emiPin = window.prompt("Enter 4-Digit Security PIN to authorize EMI Payment:");
    if (!emiPin || emiPin.length !== 4) return toast.error('Valid 4-digit PIN required');
    try {
      const res = await fetch('http://localhost:5000/api/loans/pay-emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ loanId, pin: emiPin })
      });
      if (res.ok) {
        toast.success('EMI Paid Successfully');
        fetchLoans();
        fetchUserData();
      } else {
        const errData = await res.json();
        toast.error(errData.message);
      }
    } catch (err) { toast.error('Error paying EMI'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <PiggyBank className="text-primary" /> Loans
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card h-fit order-2 lg:order-1 lg:col-span-1">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Loan</h3>
          <p className="text-sm text-muted mb-4">Instant approval at 10% flat interest.</p>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Loan Amount (₹)</label>
              <input type="number" className="input" max="500000" min="5000" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Tenure (Months)</label>
              <select className="input" value={tenure} onChange={e => setTenure(Number(e.target.value))}>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
                <option value={24}>24 Months</option>
              </select>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs font-semibold text-gray-300">
              Estimated EMI: ₹{amount ? ((Number(amount) * 1.1) / tenure).toFixed(0) : '0'} /mo
            </div>
            <div>
              <label className="block text-sm text-primary mb-1">4-Digit PIN</label>
              <input type="password" maxLength="4" className="input text-center tracking-widest font-mono font-bold" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required />
            </div>
            <button type="submit" className="btn btn-primary w-full">Apply Now</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
          <h3 className="text-xl font-semibold text-white">Active Loans</h3>
          {loans.length === 0 ? (
            <div className="text-muted p-6 border border-white/10 rounded-xl text-center">No active loans.</div>
          ) : (
            loans.map(loan => (
              <div key={loan._id} className="card p-5 space-y-4 border-l-4 border-l-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-white">Personal Loan</h4>
                    <span className={`text-xs px-2 py-0.5 mt-1 inline-flex rounded-full ${loan.status === 'active' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {loan.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">₹{loan.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted">Total Payable: ₹{loan.totalPayable.toLocaleString()}</div>
                  </div>
                </div>

                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${(loan.amountPaid / loan.totalPayable) * 100}%` }}></div>
                </div>
                
                {loan.status === 'active' && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="text-sm text-gray-300">
                      Next EMI: <span className="font-bold text-white">₹{loan.emiAmount.toFixed(2)}</span>
                    </div>
                    <button onClick={() => handlePayEmi(loan._id)} className="btn bg-primary hover:bg-blue-600 px-4 py-2 text-sm text-white rounded-lg">Pay EMI</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Loans;
