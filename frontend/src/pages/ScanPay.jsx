import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { QrCode, XCircle, Send } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ScanPay = () => {
  const { token, fetchUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [receiverMobile, setReceiverMobile] = useState('');
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let scanner;
    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScanning(false);
          toast.success("QR Scanned successfully!");
          
          // Assume the QR text is a mobile number or JSON with a mobile field
          let extractedMobile = decodedText;
          try {
            const data = JSON.parse(decodedText);
            extractedMobile = data.mobile || decodedText;
          } catch (e) {
            // It's just a string, keep it
          }
          
          setReceiverMobile(extractedMobile);
          verifyScannedUser(extractedMobile);
        },
        (error) => { /* Ignore frequent empty scan errors */ }
      );
    }
    
    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [scanning]);

  const verifyScannedUser = async (mobileNum) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/user/mobile/${mobileNum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReceiverInfo(data);
        if (data.registered === false) {
           toast.success("Unregistered Mobile Detected");
           navigate(`/send?receiverMobile=${mobileNum}`);
        } else {
           toast.success(`Found User: ${data.name}`);
           navigate(`/send?receiverMobile=${data.mobile}`);
        }
      } else {
        toast.error("User not found from QR");
        setReceiverInfo(null);
      }
    } catch (err) {
      toast.error("Error verifying receiver");
    } finally {
      setLoading(false);
    }
  };

  const manualVerifyUser = async () => {
    if (!receiverMobile) return toast.error("Enter mobile number to verify");
    verifyScannedUser(receiverMobile);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in relative pt-10">
      <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-8">
        <QrCode className="text-primary" /> Scan & Pay
      </h2>

      {scanning ? (
        <div className="card flex flex-col items-center justify-center border-2 border-primary border-dashed relative overflow-hidden bg-black/50 p-4">
           {/* html5-qrcode mounts here */}
           <div id="reader" className="w-full h-full bg-white rounded-lg overflow-hidden text-black font-sans"></div>
           
           <button onClick={() => setScanning(false)} className="mt-6 text-sm text-muted hover:text-white underline">
             Switch to Manual Entry
           </button>
        </div>
      ) : (
        <div className="card space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Manual Enter</h3>
            <button onClick={() => { setScanning(true); setReceiverInfo(null); setReceiverMobile(''); }} className="text-muted hover:text-white">
              <XCircle size={20}/>
            </button>
          </div>

          {!receiverInfo && (
            <div className="space-y-4">
              <label className="block text-sm text-muted">Enter Receiver Mobile</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input flex-1" 
                  placeholder="e.g. 9876543210" 
                  value={receiverMobile} 
                  onChange={e => setReceiverMobile(e.target.value)} 
                />
                <button onClick={manualVerifyUser} className="btn btn-secondary px-6" disabled={loading}>
                  {loading ? '...' : 'Verify & Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanPay;
