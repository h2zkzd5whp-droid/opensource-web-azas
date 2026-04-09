import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>loading</div>;
  if (user) return <Navigate to="/dashboard" />;    // when login user try to go "/login" or "/register", navigate to "/dashboard" 

  return children;
}