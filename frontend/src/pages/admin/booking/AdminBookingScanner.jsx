import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import DashboardLayout from '../../../components/DashboardLayout';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaUserCheck } from 'react-icons/fa';

const AdminBookingScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [scannerActive, setScannerActive] = useState(true);

    useEffect(() => {
        if (!scannerActive) return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        const onScanSuccess = async (decodedText) => {
            // Decoded text expected format: "CHECKIN_TOKEN:xxxx-xxxx-xxxx"
            scanner.clear();
            setScannerActive(false);
            setVerifying(true);
            
            let tokenToVerify = decodedText;
            if (decodedText.startsWith("CHECKIN_TOKEN:")) {
                tokenToVerify = decodedText.split("CHECKIN_TOKEN:")[1];
            }

            try {
                const authToken = localStorage.getItem('token');
                // Admin user ID context
                const verifiedByAdmin = "SystemAdmin";
                
                const response = await fetch('http://localhost:8081/api/admin/bookings/verify-qr', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ qrToken: tokenToVerify, scannedByAdminId: verifiedByAdmin })
                });

                const data = await response.json();
                setScanResult(data);
            } catch (err) {
                setScanResult({
                    successful: false,
                    message: "Network error occurred during verification."
                });
            } finally {
                setVerifying(false);
            }
        };

        const onScanFailure = (error) => {
            // Ignore ongoing frame scanning errors
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
    }, [scannerActive]);

    const resetScanner = () => {
        setScanResult(null);
        setScannerActive(true);
    };

    return (
        <DashboardLayout title="Access Scanner" hideHeader hideSidebar noPadding>
            <div className="min-h-screen bg-[#0a0f1c] py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-900/20 blur-3xl mix-blend-screen pointer-events-none"></div>
                
                <div className="max-w-3xl mx-auto relative z-10">
                    <Link to="/admin/booking" className="inline-flex items-center gap-2 text-emerald-400 hover:text-white font-bold text-xs uppercase tracking-widest mb-8 transition-colors">
                        <FaArrowLeft /> Back to Log
                    </Link>

                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 flex justify-center items-center gap-4">
                            <FaUserCheck className="text-emerald-500" /> Identity Scanner
                        </h1>
                        <p className="text-gray-400 text-lg">Scan student QR codes to verify approval and check them into the facility.</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                        
                        {scannerActive && (
                            <div className="rounded-xl overflow-hidden bg-black/50 border-2 border-dashed border-white/20">
                                <div id="reader" className="w-full"></div>
                                <style>
                                    {`
                                        /* Customizing the html5-qrcode standard UI */
                                        #reader { border: none !important; }
                                        #reader__dashboard_section_csr button {
                                            background-color: #059669 !important;
                                            color: white !important;
                                            border: none !important;
                                            padding: 8px 16px !important;
                                            border-radius: 8px !important;
                                            font-weight: bold !important;
                                            text-transform: uppercase !important;
                                            letter-spacing: 1px !important;
                                        }
                                        #reader__dashboard_section_swaplink { color: #34d399 !important; }
                                    `}
                                </style>
                            </div>
                        )}

                        {verifying && (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-emerald-400 mb-6"></div>
                                <p className="text-xl font-bold text-white uppercase tracking-widest animate-pulse">Authenticating Token...</p>
                            </div>
                        )}

                        {scanResult && (
                            <div className="py-10 flex flex-col items-center justify-center text-center">
                                {scanResult.successful ? (
                                    <>
                                        <div className="text-7xl text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                            <FaCheckCircle />
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Access Granted</h2>
                                        <p className="text-emerald-200 font-mono text-lg mb-8">{scanResult.message}</p>
                                        
                                        {scanResult.bookingDetails && (
                                            <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-6 w-full max-w-md mx-auto text-left mb-8">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Booking ID</p>
                                                <p className="text-lg font-mono text-white mb-4">{scanResult.bookingDetails.bookingCode}</p>
                                                
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Resource</p>
                                                <p className="text-lg text-emerald-300 font-bold mb-4">{scanResult.bookingDetails.resourceId}</p>

                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Student ID</p>
                                                <p className="text-lg text-white font-mono">{scanResult.bookingDetails.userId}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="text-7xl text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                                            <FaTimesCircle />
                                        </div>
                                        <h2 className="text-3xl font-black text-rose-400 uppercase tracking-wider mb-2">Access Denied</h2>
                                        <p className="text-rose-200 mt-2 text-lg">{scanResult.message}</p>
                                    </>
                                )}

                                <button 
                                    onClick={resetScanner}
                                    className="mt-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg backdrop-blur-md"
                                >
                                    Scan Another
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminBookingScanner;
