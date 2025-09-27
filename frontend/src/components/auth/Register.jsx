import React, { useState } from "react";
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  Alert, Container, Grid, InputAdornment, IconButton 
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function Register() {
  const { register, role } = useAuth();
  const nav = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email address is required');
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!role) {
      setError('Please go back and select a role first');
      setLoading(false);
      return;
    }

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
      location: formData.location.trim()
    });

    setLoading(false);

    if (result.ok) {
      setSuccess('Account created successfully! Please login with your credentials.');
      setTimeout(() => {
        nav('/login');
      }, 2000);
    } else {
      setError(result.message || 'Registration failed');
    }
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
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                Join as a {role || 'user'}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Full Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!formData.name.trim() && error}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!formData.email.trim() && error}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="location"
                    label="City, State"
                    value={formData.location}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Password */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!formData.password.trim() && error}
                    helperText="Minimum 6 characters"
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
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={formData.password !== formData.confirmPassword && formData.confirmPassword}
                    helperText={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'Passwords do not match' : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <MotionButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </MotionButton>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      color: '#1976d2', 
                      textDecoration: 'none', 
                      fontWeight: 600 
                    }}
                  >
                    Sign In
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
