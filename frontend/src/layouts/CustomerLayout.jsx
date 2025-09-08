import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function CustomerLayout() {
  const { isAuthenticated, user, isAuthLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to admin dashboard if user is an admin
  if (isAuthenticated && user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
