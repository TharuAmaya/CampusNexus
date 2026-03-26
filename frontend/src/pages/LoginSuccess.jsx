import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; // අලුතින් ගත්ත tool එක

const LoginSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            // 1. Token එක Local Storage එකේ සේව් කරනවා
            localStorage.setItem('token', token);
            
            try {
                // 2. Token එක දිගහැරලා (Decode කරලා) විස්තර ගන්නවා
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken.role; // අපේ Backend එකෙන් දාපු Role එක
                
                // 3. Role එක අනුව අදාළ පිටුවට යවනවා
                if (userRole === 'ROLE_ADMIN') {
                    navigate('/admin-dashboard');
                } else if (userRole === 'ROLE_TECHNICIAN') {
                    navigate('/technician-dashboard');
                } else {
                    // අනිත් ඔක්කොම (ROLE_STUDENT) යන්නේ මෙතනට
                    navigate('/student-dashboard'); 
                }

                // (ඔයාට ඕනේ නම් තත්පරයකට පස්සේ Home Page එක reload කරන්නත් පුළුවන් Navbar එක update වෙන්න)
                setTimeout(() => {
                    window.location.reload();
                }, 100);

            } catch (error) {
                console.error("Token එක කියවන්න බැරි වුණා:", error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <h2>Verifying your account... Please wait. ⏳</h2>
        </div>
    );
};

export default LoginSuccess;