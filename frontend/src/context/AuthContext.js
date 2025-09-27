import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// API functions
const apiCall = async (url, options = {}) => {
  const baseURL = 'http://localhost:5000/api';
  try {
    const response = await fetch(`${baseURL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tutorconnect_token');
    const userData = localStorage.getItem('tutorconnect_user');
    const savedRole = localStorage.getItem('tutorconnect_role');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setRole(parsedUser.role || savedRole);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('tutorconnect_token');
        localStorage.removeItem('tutorconnect_user');
        localStorage.removeItem('tutorconnect_role');
      }
    }
    setLoading(false);
  }, []);

  const selectRole = (r) => {
    setRole(r);
    localStorage.setItem('tutorconnect_role', r);
  };

  const login = async ({ email, password }) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          role: role || 'student' 
        })
      });
      
      const { token, user: userData } = data;
      
      localStorage.setItem('tutorconnect_token', token);
      localStorage.setItem('tutorconnect_user', JSON.stringify(userData));
      localStorage.setItem('tutorconnect_role', userData.role);
      
      setUser(userData);
      setRole(userData.role);
      
      return { ok: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        ok: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  const register = async ({ name, email, password, phone, location }) => {
    try {
      if (!role) {
        return { ok: false, message: 'Please select a role first' };
      }

      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          phone: phone || '',
          location: location || ''
        })
      });
      
      return { ok: true, message: data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        ok: false, 
        message: error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('tutorconnect_token');
    localStorage.removeItem('tutorconnect_user');
    localStorage.removeItem('tutorconnect_role');
    setUser(null);
    setRole(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, selectRole, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
