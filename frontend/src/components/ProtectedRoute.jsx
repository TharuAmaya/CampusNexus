import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; // Token එකDecode කරන්න

// මේ Component එකට Prop එකක් දෙනවා 'allowedRoles' කියලා (මේ පිටුව බලන්න අවසර තියෙන Roles)
const ProtectedRoute = ({ children, allowedRoles }) => {
    
    // 1. LocalStorage එකේ Token එක තියෙනවද බලනවා
    const token = localStorage.getItem('token');
    
    // Token එකක් නැත්නම් කෙළින්ම Login Page එකට Redirect කරනවා
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    try {
        // 2. Token එක Decode කරලා Role එක ගන්නවා
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role; // අපේ Backend එකෙන් දාපු Role එක
        
        // 3. User ගේ Role එක, මේ පිටුවට අවසර තියෙන Roles (allowedRoles) එක්ක සසඳලා බලනවා
        const isAuthorized = allowedRoles.includes(userRole);
        
        if (isAuthorized) {
            // අවසර තියෙනවා නම්, ඇත්තම Component (Dashboard page) එක පෙන්නනවා
            return children;
        } else {
            // අවසර නැත්නම් (Student කෙනෙක් Admin page එකකට යන්න හැදුවොත්), Unauthorized පිටුවකට යවනවා (දැනට Home)
            return <Navigate to="/unauthorized" replace />;
        }
    } catch (error) {
        console.error("Invalid Token detected:", error);
        // Token එක Invalid නම් ලොග් අවුට් කරලා Login Page එකට යවනවා
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;