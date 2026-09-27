import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('freshmart_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('freshmart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getProfile();
        if (res.success && res.user) {
          setUser(res.user);
          if (res.user.wishlist) {
            setWishlist(res.user.wishlist);
            localStorage.setItem('freshmart_wishlist', JSON.stringify(res.user.wishlist));
          }
        }
      } catch (err) {
        console.error('Session expired or invalid token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login({ email, password });
    if (res.success && res.token && res.user) {
      localStorage.setItem('freshmart_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.wishlist) {
        setWishlist(res.user.wishlist);
        localStorage.setItem('freshmart_wishlist', JSON.stringify(res.user.wishlist));
      }
      return res.user;
    }
    throw new Error('Login failed');
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.register(data);
    if (res.success && res.token && res.user) {
      localStorage.setItem('freshmart_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('freshmart_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!token || !user) {
      // Offline / guest wishlist fallback
      let updated: string[];
      if (wishlist.includes(productId)) {
        updated = wishlist.filter((id) => id !== productId);
      } else {
        updated = [...wishlist, productId];
      }
      setWishlist(updated);
      localStorage.setItem('freshmart_wishlist', JSON.stringify(updated));
      return;
    }

    try {
      const res = await api.toggleWishlist(productId);
      if (res.success && res.wishlist) {
        setWishlist(res.wishlist);
        localStorage.setItem('freshmart_wishlist', JSON.stringify(res.wishlist));
        if (user) {
          setUser({ ...user, wishlist: res.wishlist });
        }
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        wishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
