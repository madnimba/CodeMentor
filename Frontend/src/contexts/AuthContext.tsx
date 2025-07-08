import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthResponse, SignUpRequest, SignInRequest } from '../services/auth';
import { authService } from '../services/auth';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  signIn: (data: SignInRequest) => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  googleSignUp: (idToken: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setUser({ token });
        }
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const signIn = async (data: SignInRequest) => {
    try {
      const response = await authService.signIn(data);
      setUser(response);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (data: SignUpRequest) => {
    try {
      await authService.signUp(data);
      // Do not set user or token, do not navigate here. Let Auth page handle tab switching.
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const googleSignIn = async (idToken: string) => {
    try {
      const response = await authService.googleSignIn(idToken);
      setUser(response);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const googleSignUp = async (idToken: string) => {
    try {
      const response = await authService.googleSignUp(idToken);
      setUser(response);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign up error:', error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, googleSignIn, googleSignUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 