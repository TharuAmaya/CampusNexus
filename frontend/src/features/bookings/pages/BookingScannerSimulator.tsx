import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle2, XCircle, Camera, ShieldCheck, Zap } from 'lucide-react';
import { verifyQrToken } from '../services/api';

export function BookingScannerSimulator() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (status !== 'scanning') return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
      /* verbose= */ false
    );

    scanner.render(
      async (decodedText) => {
        setScanResult(decodedText);
        setStatus('verifying');
        scanner.clear();

        try {
          const response = await verifyQrToken({ qrToken: decodedText });
          if (response.status === 'SUCCESS') {
            setStatus('success');
          } else {
            setStatus('error');
            setErrorMsg(response.failureReason || 'Verification Failed');
          }
        } catch (err) {
          setStatus('error');
          setErrorMsg('API Integration Error - Trace Backend Logs');
        }
        
        setTimeout(() => {
          setStatus('idle');
          setScanResult(null);
        }, 6000);
      },
      () => {
        // Continuous scan logging suppressed
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [status]);

  return (
    <div className="max-w-2xl mx-auto pt-16">
      <div className={`transition-all duration-700 rounded-[2.5rem] p-12 border backdrop-blur-3xl relative overflow-hidden ${
        status === 'idle' || status === 'scanning' ? 'bg-white/5 border-white/10' :
        status === 'verifying' ? 'bg-blue-500/10 border-blue-500/30' :
        status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_80px_rgba(52,211,153,0.1)]' :
        'bg-rose-500/10 border-rose-500/30 shadow-[0_0_80px_rgba(244,63,94,0.1)]'
      }`}>
        
        {/* Animated Background Pulse */}
        <div className={`absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-1000 ${status === 'verifying' ? 'opacity-40' : ''}`}>
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] ${
             status === 'success' ? 'bg-emerald-500' : 
             status === 'error' ? 'bg-rose-500' : 
             status === 'verifying' ? 'bg-blue-500 animate-pulse' :
             'bg-indigo-500'
           }`}></div>
        </div>

        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-blue-400 mb-6">
            <ShieldCheck className="w-3 h-3" /> CampusNexus Secure Entry
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            {status === 'idle' ? 'Ready to Scan' :
             status === 'scanning' ? 'Awaiting QR...' :
             status === 'verifying' ? 'Cryptographic Check...' :
             status === 'success' ? 'Access Granted' : 
             'Access Denied'}
          </h2>

          <div className="h-12 flex items-center justify-center">
            {status === 'idle' && (
              <button 
                onClick={() => setStatus('scanning')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 group"
              >
                <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Initialize Camera
              </button>
            )}

            {status === 'verifying' && (
              <div className="flex items-center gap-3 text-blue-400 font-bold animate-pulse uppercase tracking-widest text-sm">
                <Zap className="w-5 h-5" /> Ingesting Token...
              </div>
            )}

            {(status === 'success' || status === 'error') && (
              <p className={`text-lg font-medium ${status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {status === 'success' ? 'Welcome to the facility.' : errorMsg}
              </p>
            )}
          </div>
        </div>

        {status === 'scanning' && (
          <div className="relative z-10 bg-slate-900/40 rounded-[2rem] overflow-hidden border border-white/10 p-6 backdrop-blur-md">
            <div id="reader" className="w-full text-blue-500 bg-transparent rounded-xl overflow-hidden shadow-inner"></div>
            <p className="mt-6 text-center text-slate-500 text-xs font-medium tracking-wide">Secure Hardware Bridge Active</p>
          </div>
        )}

        {status === 'success' && (
           <div className="flex flex-col items-center justify-center py-8 relative z-10">
              <div className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
              </div>
              <p className="mt-6 font-mono text-emerald-500/60 text-xs">{scanResult}</p>
           </div>
        )}

        {status === 'error' && (
           <div className="flex flex-col items-center justify-center py-8 relative z-10">
              <div className="w-32 h-32 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30 animate-in shake duration-500">
                <XCircle className="w-16 h-16 text-rose-400" />
              </div>
              <p className="mt-6 font-mono text-rose-500/60 text-xs">Invalid Signature</p>
           </div>
        )}
      </div>
      
      <p className="mt-8 text-center text-slate-600 text-[10px] uppercase tracking-[0.3em] font-bold">
        Proprietary Access Control Framework v4.0.1
      </p>
    </div>
  );
}
