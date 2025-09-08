import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminNavbar } from '../components/AdminNavbar';

export default function AdminLayout() {
  const { isAuthenticated, user, isAuthLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated or not an admin
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <Outlet />
      </div>
    </div>
  );
}
