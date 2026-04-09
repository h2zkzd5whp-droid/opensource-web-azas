// if not login, go to login page 
// ProtectedRoute -> app.jsx App <ProtectedRoute><chlidren></ProtectedRoute>

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute ({children}) {
    const { user, loading} = useAuth();

    if (loading) return <div>loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return children;    // return children URL 
}

