import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, Search, FileText, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const { user, token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/transaction/history?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">History</h1>
          <p className="text-muted text-sm">Review your past activities mapped with types and statuses.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-surface/50 p-2 rounded-xl flex items-center gap-2 border border-white/5 w-full md:w-auto overflow-x-auto">
             <Filter size={16} className="text-muted ml-2" />
             <select className="input border-none bg-transparent py-2 pl-2 md:w-48 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
               <option value="all">All Transactions</option>
               <option value="credit">Money Received</option>
               <option value="debit">Money Sent</option>
               <option value="recharge">Recharges</option>
               <option value="bill_payment">Bill Payments</option>
               <option value="investment">Investments</option>
             </select>
          </div>
        </div>
      </div>

      <div className="card !p-0">
        {loading ? (
          <div className="p-12 text-center text-muted">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center text-muted">No transactions found for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/30 border-b border-white/5 text-muted text-xs uppercase tracking-wider">
                  <th className="p-5 font-medium">Type</th>
                  <th className="p-5 font-medium">Description</th>
                  <th className="p-5 font-medium whitespace-nowrap">Amount (₹)</th>
                  <th className="p-5 font-medium whitespace-nowrap">Date & Time</th>
                  <th className="p-5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {transactions.map((tx, idx) => {
                    const isReceived = tx.type === 'deposit' || (tx.receiver && tx.receiver._id === user._id);
                    const partyName = tx.type === 'transfer' ? (isReceived ? tx.sender?.name || 'Unknown' : tx.receiver?.name || tx.billerName || 'Unknown') : (tx.billerName || tx.type.replace('_',' '));

                    return (
                      <motion.tr key={tx._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isReceived ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-500'}`}>
                            {isReceived ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="font-semibold text-white capitalize">{partyName.replace('_', ' ')}</div>
                          <div className="text-xs text-muted mt-1 uppercase tracking-wide">{tx.type.replace('_', ' ')} • {tx.method}</div>
                        </td>
                        <td className={`p-5 font-bold text-lg ${isReceived ? 'text-secondary' : 'text-text'}`}>
                          {isReceived ? '+' : '-'}{tx.amount.toLocaleString()}
                        </td>
                        <td className="p-5 text-muted text-sm whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-5 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20">
                            {tx.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default History;
