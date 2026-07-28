import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

const formatUserData = (userData) => {
  if (!userData) return null;
  return {
    id: userData._id || userData.id,
    username: userData.username,
    email: userData.email,
    college: userData.college || '',
    degree: userData.degree || '',
    gradYear: userData.gradYear || userData.grad_year || '',
    grad_year: userData.grad_year || userData.gradYear || '',
    targetRole: userData.targetRole || userData.target_role || '',
    target_role: userData.target_role || userData.targetRole || '',
    linkedin: userData.linkedin || '',
    github: userData.github || '',
    profilePic: userData.profilePic || userData.profile_pic || '',
    profile_pic: userData.profile_pic || userData.profilePic || '',
    created_at: userData.created_at
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const res = await API.get('/auth/me');
      const formatted = formatUserData(res.data);
      setUser(formatted);
      return formatted;
    } catch (err) {
      console.error("Failed to refresh user profile", err);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await refreshUser();
        } catch (err) {
          console.error("Session verification failed, logging out", err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    setError(null);
    try {
      const res = await API.post('/auth/login', {
        username_or_email: usernameOrEmail,
        password: password,
      });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      const updatedUser = await refreshUser();
      return updatedUser;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (username, email, password) => {
    setError(null);
    try {
      // Create user account
      await API.post('/auth/signup', {
        username,
        email,
        password,
      });
      // Auto login on successful register
      return await login(email, password);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updateData) => {
    setError(null);
    try {
      const res = await API.put('/auth/profile', updateData);
      const formatted = formatUserData(res.data);
      setUser(formatted);
      return formatted;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update profile.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    setError(null);
    try {
      const res = await API.put('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to change password.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteAccount = async () => {
    setError(null);
    try {
      await API.delete('/auth/account');
      logout();
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete account.';
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
        changePassword,
        deleteAccount,
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
