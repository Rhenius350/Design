import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, PlusCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Cards = () => {
  const { token } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCards(data);
    } catch (err) { toast.error('Failed to load cards'); }
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  const issueCard = async (type) => {
    try {
      const res = await fetch('http://localhost:5000/api/cards/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        toast.success(`${type} card issued successfully!`);
        fetchCards();
      } else toast.error('Failed to issue card');
    } catch (err) { toast.error('Error'); }
  };

  if (loading) return <div className="text-center text-white p-10">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <CreditCard className="text-primary" /> My Cards
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(card => (
          <div key={card._id} className={`p-6 rounded-2xl text-white shadow-xl relative overflow-hidden ${card.type === 'credit' ? 'bg-gradient-to-br from-indigo-900 to-purple-800' : 'bg-gradient-to-br from-blue-900 to-cyan-800'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-50"><ShieldCheck size={48} /></div>
            <div className="flex justify-between items-start mb-8 text-xl font-bold">
              <span>SmartBank</span>
              <span className="capitalize">{card.type} Card</span>
            </div>
            <div className="font-mono text-2xl tracking-widest mb-4">
              **** **** **** {card.cardNumber.slice(-4)}
            </div>
            <div className="flex justify-between text-sm opacity-80">
              <span>Expiry: {card.expiry}</span>
              <span>CVV: ***</span>
            </div>
            {card.type === 'credit' && (
              <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                Limit: ₹{card.limit.toLocaleString()} | Used: ₹{card.usedLimit.toLocaleString()}
              </div>
            )}
          </div>
        ))}
        {cards.length === 0 && (
          <div className="p-8 border border-dashed border-white/20 rounded-2xl flex items-center justify-center text-muted">
            No cards issued yet.
          </div>
        )}
      </div>

      <div className="card text-center space-y-4">
        <h3 className="text-xl font-semibold text-white">Need a Card?</h3>
        <p className="text-muted text-sm">Get an instant virtual card.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => issueCard('debit')} className="btn btn-secondary"><PlusCircle size={18}/> Issue Debit Card</button>
          <button onClick={() => issueCard('credit')} className="btn btn-primary"><PlusCircle size={18}/> Issue Credit Card</button>
        </div>
      </div>
    </div>
  );
};

export default Cards;
