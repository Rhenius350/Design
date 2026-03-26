import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Smartphone, Tv, Zap, Droplets, Wifi, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Recharge = () => {
  const { user, token, fetchUserData } = useContext(AuthContext);
  const [billerType, setBillerType] = useState('mobile');
  const [provider, setProvider] = useState('');
  const [billerName, setBillerName] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [cards, setCards] = useState([]);
  const [paymentSource, setPaymentSource] = useState('account');

  React.useEffect(() => {
    if(!token) return;
    const fetchCards = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/cards', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
           const data = await res.json();
           setCards(data);
        }
      } catch (err) { }
    };
    fetchCards();
  }, [token]);

  const billers = [
    { id: 'mobile', icon: Smartphone, label: 'Mobile Recharge', type: 'recharge' },
    { id: 'dth', icon: Tv, label: 'DTH Recharge', type: 'recharge' },
    { id: 'electricity', icon: Zap, label: 'Electricity Bill', type: 'bill_payment' },
    { id: 'water', icon: Droplets, label: 'Water Bill', type: 'bill_payment' },
    { id: 'internet', icon: Wifi, label: 'Broadband', type: 'bill_payment' },
  ];

  const telecomPlans = {
    Jio: [
      { id: 'j1', desc: '1.5GB/Day - 28 Days', amount: 239 },
      { id: 'j2', desc: '2GB/Day - 84 Days', amount: 719 },
      { id: 'j3', desc: '3GB/Day - 28 Days', amount: 419 },
    ],
    Airtel: [
      { id: 'a1', desc: '1.5GB/Day - 28 Days', amount: 299 },
      { id: 'a2', desc: '1.5GB/Day - 84 Days', amount: 719 },
      { id: 'a3', desc: 'Unlimited Calls - 28 Days', amount: 179 },
    ],
    Vi: [
      { id: 'v1', desc: '1.5GB/Day - 28 Days', amount: 299 },
      { id: 'v2', desc: '2GB/Day - 28 Days', amount: 359 },
    ],
    BSNL: [
      { id: 'b1', desc: '1GB/Day - 28 Days', amount: 153 },
      { id: 'b2', desc: '2GB/Day - 56 Days', amount: 347 },
    ]
  };

  const clearForm = () => {
    setBillerName(''); setAmount(''); setPin(''); setProvider('');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (billerType === 'mobile' && !/^\d{10}$/.test(billerName)) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }
    if (pin.length !== 4) return toast.error("Enter 4-digit PIN");

    const typeObj = billers.find(b => b.id === billerType);
    const identifier = billerType === 'mobile' ? `${provider} Mobile: ${billerName}` : `${typeObj.label}: ${billerName}`;
    
    try {
      const res = await fetch('http://localhost:5000/api/transaction/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: Number(amount),
          billerName: identifier,
          type: typeObj.type,
          method: 'system',
          pin,
          paymentSource
        })
      });
      
      if (res.ok) {
        toast.success(`Payment successful!`);
        clearForm();
        fetchUserData(); // match dashboard balance
      } else {
        const error = await res.json();
        toast.error(error.message);
      }
    } catch (err) { toast.error('Payment failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
        <Smartphone className="text-primary" /> Recharges & Bill Payments
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {billers.map(b => (
          <div 
            key={b.id} 
            onClick={() => { setBillerType(b.id); clearForm(); }}
            className={`card flex flex-col items-center justify-center p-6 cursor-pointer transition-all ${billerType === b.id ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'hover:bg-white/5'}`}
          >
            <b.icon className={`w-10 h-10 mb-3 ${billerType === b.id ? 'text-primary' : 'text-muted'}`} />
            <span className={`text-sm font-semibold text-center ${billerType === b.id ? 'text-white' : 'text-muted'}`}>{b.label}</span>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-8">
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
               {React.createElement(billers.find(b => b.id === billerType).icon, { className: 'text-primary' })}
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wide">{billers.find(b => b.id === billerType).label}</h3>
          </div>

          {billerType === 'mobile' && (
            <div>
               <label className="block text-sm font-medium text-muted mb-2">Select Operator</label>
               <div className="grid grid-cols-4 gap-3">
                 {['Jio', 'Airtel', 'Vi', 'BSNL'].map(op => (
                   <button 
                     type="button" 
                     key={op} 
                     onClick={() => { setProvider(op); setAmount(''); }} 
                     className={`p-3 rounded-lg border text-sm font-bold ${provider === op ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-surface border-white/10 text-muted hover:border-white/30'}`}
                   >
                     {op}
                   </button>
                 ))}
               </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              {billerType === 'mobile' ? 'Mobile Number' : 'Biller ID / Reference Number'}
            </label>
            <input 
              type="text" 
              className="input text-lg py-4" 
              placeholder={billerType === 'mobile' ? "10-digit number" : "Account ID"} 
              value={billerName} 
              onChange={e => setBillerName(e.target.value)} 
              required 
            />
          </div>

          {billerType === 'mobile' && provider && (
            <div className="bg-surface border border-white/5 rounded-xl p-4">
              <label className="block text-sm font-medium text-muted mb-3">Available Plans for {provider}</label>
              <div className="space-y-2">
                {telecomPlans[provider].map(plan => (
                   <div 
                     key={plan.id} 
                     onClick={() => setAmount(plan.amount)}
                     className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center ${amount === plan.amount ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/20'}`}
                   >
                     <div className="text-white font-medium">{plan.desc}</div>
                     <div className="text-primary font-bold bg-primary/20 px-3 py-1 rounded-md">₹{plan.amount}</div>
                   </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Payment Method</label>
            <select className="input text-lg tracking-wide rounded-xl font-medium mb-4" value={paymentSource} onChange={(e) => setPaymentSource(e.target.value)}>
              <option value="account">Account Balance (₹{user?.balance})</option>
              {cards.map(c => (
                <option key={c._id} value={c._id}>
                  {c.type === 'credit' ? 'Credit Card' : 'Debit Card'} ending in {c.cardNumber.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Amount to Pay (₹)</label>
            <input 
              type="number" 
              className="input text-3xl font-bold mb-2 py-4 text-primary" 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required 
            />
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between mt-4">
             <div className="flex items-center gap-3 text-white">
               <ShieldCheck className="text-primary" size={24} />
               <div className="text-sm font-medium tracking-wide">Enter 4-Digit Security PIN to Proceed</div>
             </div>
             <input type="password" maxLength="4" placeholder="****" className="input w-24 text-center tracking-widest font-mono font-bold" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required />
          </div>

          <button type="submit" disabled={!amount} className="btn btn-primary w-full py-4 text-lg">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Recharge;
