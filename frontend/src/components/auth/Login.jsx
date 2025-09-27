import React, { useState } from "react";
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  Alert, Container, InputAdornment, IconButton 
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function Login() {
  const { login, role } = useAuth();
  const nav = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    const result = await login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    });

    setLoading(false);

    if (result.ok) {
      // Navigate based on user role
      const userRole = role || 'student';
      nav(userRole === 'student' ? '/student' : '/tutor');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  const demoCredentials = role === 'student' 
    ? { email: 'sarah@example.com', password: 'password123' }
    : { email: 'mike@example.com', password: 'password123' };

  const fillDemo = () => {
    setFormData(demoCredentials);
    setError('');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <MotionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ boxShadow: 3 }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                Sign in as a {role || 'user'}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Demo Credentials */}
            {(role === 'student' || role === 'tutor') && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Demo Account:</strong>
                </Typography>
                <Typography variant="body2">
                  Email: {demoCredentials.email}<br/>
                  Password: {demoCredentials.password}
                </Typography>
                <Button 
                  size="small" 
                  onClick={fillDemo}
                  sx={{ mt: 1 }}
                >
                  Use Demo Credentials
                </Button>
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
                error={!formData.email.trim() && error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 3 }}
                error={!formData.password.trim() && error}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <MotionButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{ mb: 3, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </MotionButton>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    style={{ 
                      color: '#1976d2', 
                      textDecoration: 'none', 
                      fontWeight: 600 
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </MotionCard>
      </Box>
    </Container>
  );
}
