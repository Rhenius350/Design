import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { TransactionContext } from '../context/TransactionContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { notifications } = useContext(SocketContext);
  const { transactions, loadingTransactions: loading } = useContext(TransactionContext);

  const chartData = [...transactions].reverse().map(t => ({
    name: new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    balance: user.balance 
  }));

  if (chartData.length === 0) {
    chartData.push({ name: 'Start', balance: user?.balance || 1000 });
  }

  const recentTransactions = transactions.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-muted">Welcome back, <span className="text-text font-medium">{user?.name}</span></p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <motion.div variants={itemVariants} className="card col-span-1 border-primary/20 group from-primary/10 to-transparent bg-gradient-to-br">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-muted font-medium">Total Balance</h3>
                <div className="w-10 h-10 rounded-full bg-surface/50 flex items-center justify-center border border-white/5">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-5xl font-bold text-white tracking-tight mb-2">
                ${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center text-sm font-medium text-secondary">
                <ArrowUpRight className="w-4 h-4 mr-1" /> Available to transfer
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 flex gap-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary/50 w-3/4 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart Card */}
        <motion.div variants={itemVariants} className="card col-span-1 lg:col-span-2 h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-text font-medium">Activity Overview</h3>
            <span className="text-xs text-muted font-medium px-2.5 py-1 rounded-full bg-surface/80 border border-white/5">Last 30 days</span>
          </div>
          <div className="flex-1 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="card !p-0 col-span-1 lg:col-span-2 flex flex-col h-full">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-text font-medium">Recent Transactions</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted">Loading transactions...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted flex flex-col items-center">
                <Activity className="w-8 h-8 opacity-20 mb-3" />
                No recent activity.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentTransactions.map(tx => {
                  const isReceived = tx.type === 'deposit' || (tx.receiver && tx.receiver._id === user._id);
                  const partyName = tx.type === 'transfer' ? (isReceived ? tx.sender?.name || 'Unknown' : tx.receiver?.name || tx.billerName || 'Unknown') : (tx.billerName || tx.type);
                  return (
                    <motion.div whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} key={tx._id} className="p-5 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isReceived ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-500'}`}>
                          {isReceived ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-text capitalize">
                            {partyName.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-bold tracking-tight ${isReceived ? 'text-secondary' : 'text-text'}`}>
                        {isReceived ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Notifications / Side Panel */}
        <motion.div variants={itemVariants} className="card col-span-1 relative overflow-hidden">
           <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
           <h3 className="text-text font-medium mb-6 flex items-center gap-2">
             <Bell className="w-4 h-4 text-muted" /> Live Updates
           </h3>
           {notifications.length > 0 ? (
             <ul className="space-y-4 relative z-10">
               {notifications.map((n, i) => (
                 <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="text-sm bg-surface/50 border border-white/5 p-4 rounded-xl flex items-start gap-3">
                   <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                   <span className="text-text leading-relaxed">{n.message}</span>
                 </motion.li>
               ))}
             </ul>
           ) : (
             <div className="text-muted text-sm text-center py-12 flex flex-col items-center">
                <Bell className="w-8 h-8 opacity-20 mb-3" />
                You're fully caught up!
             </div>
           )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
