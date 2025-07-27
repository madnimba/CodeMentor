import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthService } from '@/services/adminAuth';

interface AdminAuthResponse {
  token: string;
}

interface AdminSignInRequest {
  username: string;
  password: string;
}

interface AdminAuthContextType {
  admin: AdminAuthResponse | null;
  loading: boolean;
  signIn: (data: AdminSignInRequest) => Promise<void>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminAuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          setAdmin({ token });
        }
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const signIn = async (data: AdminSignInRequest) => {
    try {
      const response = await adminAuthService.signIn(data);
      setAdmin(response);
      localStorage.setItem('adminToken', response.token);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin sign in error:', error);
      throw error;
    }
  };

  const signOut = () => {
    setAdmin(null);
    localStorage.removeItem('adminToken');
    navigate('/admin/auth');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}; 