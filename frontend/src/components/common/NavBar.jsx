import React, { useState } from "react";
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, 
  Avatar, Menu, MenuItem, IconButton, Divider
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MessageIcon from '@mui/icons-material/Message';

const MotionButton = motion(Button);

export default function NavBar() {
  const { user, role, logout } = useAuth();
  const nav = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    nav("/role");
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1, justifyContent: 'space-between' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 800,
              color: 'primary.main',
              letterSpacing: '-0.02em'
            }}
          >
            TutorConnect
          </Typography>
          
          {!user && (
            <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
              <Button 
                component={Link} 
                to="/role" 
                variant="outlined"
                sx={{ 
                  borderColor: 'grey.300',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.50'
                  }
                }}
              >
                Get Started
              </Button>
              <MotionButton 
                component={Link} 
                to="/login" 
                variant="contained"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </MotionButton>
            </Box>
          )}
          
          {user && (
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              {/* Quick Navigation */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  startIcon={<DashboardIcon />}
                  component={Link}
                  to={role === 'student' ? '/student' : '/tutor'}
                  sx={{ color: 'text.primary' }}
                >
                  Dashboard
                </Button>
                <Button
                  startIcon={<MessageIcon />}
                  component={Link}
                  to="/chat"
                  sx={{ color: 'text.primary' }}
                >
                  Messages
                </Button>
              </Box>

              {/* User Menu */}
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1
                    }
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {role}
                  </Typography>
                </Box>
                <Divider />
                
                <MenuItem 
                  component={Link} 
                  to={role === 'student' ? '/student' : '/tutor'}
                >
                  <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
                  Dashboard
                </MenuItem>
                
                <MenuItem component={Link} to="/chat">
                  <MessageIcon sx={{ mr: 1 }} fontSize="small" />
                  Messages
                </MenuItem>
                
                <MenuItem component={Link} to="/profile">
                  <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
                  Profile Settings
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
