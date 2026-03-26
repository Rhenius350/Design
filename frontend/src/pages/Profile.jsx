import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Settings, Bell, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from "react-qr-code";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const saveSettings = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <User className="text-primary" /> Profile & Settings
      </h2>

      <div className="card text-center py-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4 border-2 border-primary/50">
          <User size={48} className="text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-white">{user?.name}</h3>
        <p className="text-muted">{user?.email}</p>
        {user?.mobile && <p className="text-muted text-sm mt-1">Mobile: {user.mobile}</p>}
        <div className="mt-4 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          Verified User
        </div>
      </div>

      <div className="card text-center py-8 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-white mb-2">My Receive QR Code</h3>
        <p className="text-sm text-muted mb-6">Let others scan this to send you money instantly.</p>
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-white/10">
           {user?.mobile ? (
             <QRCode value={JSON.stringify({ mobile: user.mobile, name: user.name })} size={180} />
           ) : (
             <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-400 text-sm p-4 text-center rounded-xl border border-dashed border-gray-300">
               Update Mobile Number in settings to get a QR code
             </div>
           )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Settings size={20} className="text-primary" /> Preferences
        </h3>
        
        <form onSubmit={saveSettings} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 text-white">
              <Globe className="text-muted" size={20} />
              <div>
                <div className="font-semibold">Language</div>
                <div className="text-xs text-muted">Choose your preferred language</div>
              </div>
            </div>
            <select className="input w-32 border-none bg-surface" defaultValue="en">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 text-white">
              <Bell className="text-muted" size={20} />
              <div>
                <div className="font-semibold">Push Notifications</div>
                <div className="text-xs text-muted">Receive alerts for transactions</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
