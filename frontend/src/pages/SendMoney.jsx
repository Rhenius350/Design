import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Send, User, Wallet, Smartphone, Landmark, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SendMoney = () => {
  const { user, updateBalance } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const initialMobile = searchParams.get('receiverMobile') || '';

  const [method, setMethod] = useState(initialMobile ? 'mobile' : 'mobile');
  const [mobile, setMobile] = useState(initialMobile);
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [paymentSource, setPaymentSource] = useState('account');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get('/cards');
        setCards(res.data);
      } catch (err) { }
    };
    fetchCards();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return toast.error('Enter a valid amount.');
    if (pin.length !== 4) return toast.error('Enter 4-digit PIN to confirm');

    setLoading(true);
    const toastId = toast.loading('Processing transaction securely...');
    
    try {
      let bodyData = { amount: Number(amount), type: 'transfer', pin, paymentSource };
      
      if (method === 'mobile') {
        if (!mobile) throw new Error('Enter mobile number');
        bodyData.receiverMobile = mobile;
        bodyData.method = 'mobile';
      } else {
        if (!account || !ifsc) throw new Error('Enter account and IFSC');
        bodyData.billerName = `Bank A/c: ${account} (${ifsc})`;
        bodyData.method = 'account';
      }

      const res = await api.post(method === 'mobile' ? '/transaction/send' : '/transaction/recharge', bodyData);
      
      updateBalance(res.data.newBalance);
      toast.success('Transfer successful!', { id: toastId });
      setAmount(''); setMobile(''); setAccount(''); setIfsc(''); setPin('');
      setTimeout(() => navigate('/history'), 1500);
      
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Transaction failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto mt-8">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <Send className="w-8 h-8 text-primary ml-1" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Fund Transfer</h1>
        <p className="text-muted">Send money instantly using your 4-Digit PIN.</p>
      </div>

      <div className="card p-8">
        <div className="flex rounded-xl bg-background/50 p-1 mb-8 overflow-hidden border border-white/5">
           <button onClick={() => setMethod('mobile')} className={`flex-1 flex gap-2 justify-center items-center py-2.5 rounded-lg text-sm font-semibold transition-all ${method === 'mobile' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-white'}`}>
             <Smartphone size={16}/> Mobile Number
           </button>
           <button onClick={() => setMethod('account')} className={`flex-1 flex gap-2 justify-center items-center py-2.5 rounded-lg text-sm font-semibold transition-all ${method === 'account' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-white'}`}>
             <Landmark size={16}/> Bank & IFSC
           </button>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          {method === 'mobile' ? (
             <div>
              <label className="block text-sm font-medium text-text mb-2">Recipient Mobile</label>
              <input type="text" className="input text-lg tracking-wide" placeholder="Enter 10 digit number" value={mobile} onChange={e => setMobile(e.target.value)} required />
              {initialMobile && <p className="text-xs text-emerald-400 mt-2">Mobile pre-filled securely from Scan code.</p>}
            </div>
          ) : (
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-text mb-2">Account Number</label>
                  <input type="text" className="input text-lg tracking-wide" placeholder="00000000000" value={account} onChange={e => setAccount(e.target.value)} required />
               </div>
               <div>
                  <label className="block text-sm font-medium text-text mb-2">IFSC Code</label>
                  <input type="text" className="input uppercase text-lg tracking-wide" placeholder="SBIN0001234" value={ifsc} onChange={e => setIfsc(e.target.value)} required />
               </div>
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-2 mt-6">Payment Method</label>
            <select className="input text-lg tracking-wide rounded-xl mb-4" value={paymentSource} onChange={(e) => setPaymentSource(e.target.value)}>
              <option value="account">Account Balance (₹{user?.balance})</option>
              {cards.map(c => (
                <option key={c._id} value={c._id}>
                  {c.type === 'credit' ? 'Credit Card' : 'Debit Card'} ending in {c.cardNumber.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Amount to Send (₹)</label>
            <input type="number" className="input text-4xl font-bold py-6 text-primary tracking-widest bg-background/50" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
             <div className="flex items-center gap-3 text-white">
               <Lock className="text-primary" size={20} />
               <div className="text-sm font-medium">Verify via PIN</div>
             </div>
             <input type="password" maxLength="4" placeholder="****" className="input w-24 text-center tracking-widest font-mono font-bold" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 text-lg">
            {loading ? 'Processing...' : 'Secure Transfer Now'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default SendMoney;
