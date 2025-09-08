import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  const checkOrRefresh = async () => {
      setIsAuthLoading(true);
      const token = localStorage.getItem('token');
      const isValid = (t) => {
        try {
          const decoded = jwtDecode(t);
          return decoded?.exp && decoded.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      };

      if (token && isValid(token)) {
        setIsAuthenticated(true);
        try {
          const decoded = jwtDecode(token);
          setUserId(decoded?.id);
        } catch {}
        return;
      }

      try {
        const { data } = await axios.post(
          'http://localhost:5001/api/auth/refresh-token',
          {},
          { withCredentials: true }
        );
        if (data?.token && isValid(data.token)) {
          localStorage.setItem('token', data.token);
          setIsAuthenticated(true);
          try {
            const decoded = jwtDecode(data.token);
            setUserId(decoded?.id);
          } catch {}
          return;
        }
      } catch {
        // ignore
      }

  localStorage.removeItem('token');
  setIsAuthenticated(false);
  setUserId(null);
  setIsAuthLoading(false);
  };

  useEffect(() => {
    checkOrRefresh();

    const handler = () => checkOrRefresh();
    window.addEventListener('auth-changed', handler);
    return () => window.removeEventListener('auth-changed', handler);
  }, []);

  const fetchUser = async () => {
    if (!userId) return;
    setUserLoading(true);
    setUserError(null);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `http://localhost:5001/api/auth/searchUser/${userId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {}, withCredentials: true }
      );
      setUser(data);
    } catch (err) {
      setUserError(err);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated, userId]);

  const logout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5001/api/auth/logout',
        {},
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUserId(null);
      setUser(null);

      window.dispatchEvent(new Event('auth-changed'));
    }
  };

  useEffect(() => {
    // When tokens are valid and we set auth, mark loading false
    if (isAuthenticated || (!isAuthenticated && userId === null)) {
      setIsAuthLoading(false);
    }
  }, [isAuthenticated, userId]);
  
  // Function to get auth headers for API requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return { 
    isAuthenticated, 
    isAuthLoading, 
    userId, 
    user, 
    userLoading, 
    userError, 
    refetchUser: fetchUser, 
    logout,
    getAuthHeaders 
  };
}
