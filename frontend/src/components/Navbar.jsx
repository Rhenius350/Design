import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Wallet, LayoutDashboard, Send, History, LogOut, QrCode, Smartphone, CreditCard, TrendingUp, PiggyBank, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => {
    const active = isActive(to);
    return (
      <Link 
        to={to} 
        className={`relative px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-300 font-medium ${active ? 'text-white' : 'text-muted hover:text-white hover:bg-white/5'}`}
      >
        <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
        <span className="hidden lg:inline">{label}</span>
        {active && (
          <motion.div 
            layoutId="navbar-indicator"
            className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Link>
    );
  };

  return (
    <nav className="bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-[1400px] h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight hidden sm:block">Smart<span className="text-primary">Bank</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto mx-4 scrollbar-hide py-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dash" />
          <NavItem to="/send" icon={Send} label="Transfer" />
          <NavItem to="/scan" icon={QrCode} label="Scan" />
          <NavItem to="/recharge" icon={Smartphone} label="Rec/Bill" />
          <NavItem to="/cards" icon={CreditCard} label="Cards" />
          <NavItem to="/investments" icon={TrendingUp} label="Invest" />
          <NavItem to="/loans" icon={PiggyBank} label="Loans" />
          <NavItem to="/history" icon={History} label="History" />
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/profile" className="hidden md:flex items-center gap-2.5 hover:bg-white/5 p-2 rounded-xl transition-colors">
             <div className="bg-primary/20 p-2 rounded-full"><User className="w-4 h-4 text-primary" /></div>
             <div className="hidden lg:block text-right pr-2">
               <div className="text-sm font-semibold text-text">{user?.name}</div>
             </div>
          </Link>
          <div className="w-px h-8 bg-white/10 hidden md:block"></div>
          <button 
            onClick={logout}
            className="p-2.5 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden flex overflow-x-auto p-3 gap-2 bg-surface/90 backdrop-blur-md border-t border-white/5 pb-safe sticky bottom-0 z-50">
        <Link to="/" className={`flex-shrink-0 min-w-[70px] flex-col justify-center py-2.5 rounded-xl flex items-center gap-1 text-[10px] font-medium transition-colors ${isActive('/') ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'}`}>
          <LayoutDashboard className="w-5 h-5" /> Dash
        </Link>
        <Link to="/send" className={`flex-shrink-0 min-w-[70px] flex-col justify-center py-2.5 rounded-xl flex items-center gap-1 text-[10px] font-medium transition-colors ${isActive('/send') ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'}`}>
          <Send className="w-5 h-5" /> Pay
        </Link>
        <Link to="/scan" className={`flex-shrink-0 min-w-[70px] flex-col justify-center py-2.5 rounded-xl flex items-center gap-1 text-[10px] font-medium transition-colors ${isActive('/scan') ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'}`}>
          <QrCode className="w-5 h-5" /> Scan
        </Link>
        <Link to="/recharge" className={`flex-shrink-0 min-w-[70px] flex-col justify-center py-2.5 rounded-xl flex items-center gap-1 text-[10px] font-medium transition-colors ${isActive('/recharge') ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'}`}>
          <Smartphone className="w-5 h-5" /> Bills
        </Link>
        <Link to="/cards" className={`flex-shrink-0 min-w-[70px] flex-col justify-center py-2.5 rounded-xl flex items-center gap-1 text-[10px] font-medium transition-colors ${isActive('/cards') ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'}`}>
          <CreditCard className="w-5 h-5" /> Cards
        </Link>
        <Link to="/history" className={`flex-shrink-0 min-w-[70px] flex-col justify-center py-2.5 rounded-xl flex items-center gap-1 text-[10px] font-medium transition-colors ${isActive('/history') ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'}`}>
          <History className="w-5 h-5" /> Hist
        </Link>
         <Link to="/profile" className={`flex-shrink-0 min-w-[70px] flex-col justify-center py-2.5 rounded-xl flex items-center gap-1 text-[10px] font-medium transition-colors ${isActive('/profile') ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'}`}>
          <User className="w-5 h-5" /> Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
