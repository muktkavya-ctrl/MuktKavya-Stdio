import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mukt_kavya_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load user on token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success) {
          setUser(res.user);
          // Fetch notifications for poet/user
          fetchNotifications();
        } else {
          localStorage.removeItem('mukt_kavya_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.warn('Notifications fetch note:', err.message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.markNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const toggleFollowPoet = async (poetId) => {
    try {
      const res = await api.toggleFollow(poetId);
      if (res.success) {
        setUser((prev) => {
          if (!prev) return prev;
          const prevFollowing = prev.following || [];
          const isNowFollowing = res.isFollowing;
          const updatedFollowing = isNowFollowing
            ? [...prevFollowing, poetId]
            : prevFollowing.filter((id) => id.toString() !== poetId.toString());
          return {
            ...prev,
            following: updatedFollowing,
          };
        });
      }
      return res;
    } catch (err) {
      console.error('Follow error:', err);
      return { success: false };
    }
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('mukt_kavya_token', res.token);
      setToken(res.token);
      setUser(res.user);
      fetchNotifications();
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('mukt_kavya_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('mukt_kavya_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const forgotPassword = async (email) => {
    return await api.forgotPassword(email);
  };

  const resetPassword = async (payload) => {
    const res = await api.resetPassword(payload);
    if (res.success && res.token) {
      localStorage.setItem('mukt_kavya_token', res.token);
      setToken(res.token);
      setUser(res.user);
      fetchNotifications();
    }
    return res;
  };

  // Quick 1-Click Role Switcher for seamless demo & testing
  const quickLoginAs = async (email) => {
    const pwd = email === 'praveen.pr105@gmail.com' ? 'praveen@2020' : 'password';
    return await login(email, pwd);
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  // Super Admin has ALL ACCESS: platform governance, heritage vault, studio creation, and personal diwan
  const isWriter = user?.role === 'writer' || user?.role === 'admin' || isSuperAdmin;
  const isReader = user?.role === 'reader' || !user;
  const canPublish = !user?.isRestricted && !user?.isBlocked;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notifications,
        unreadCount,
        fetchNotifications,
        markAllNotificationsAsRead,
        toggleFollowPoet,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        quickLoginAs,
        isSuperAdmin,
        isAdmin,
        isWriter,
        isReader,
        canPublish,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
