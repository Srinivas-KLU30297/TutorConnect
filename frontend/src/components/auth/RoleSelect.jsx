import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Box, Card, CardContent, Typography, Button, Stack, Container, Grid
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate, Link } from "react-router-dom";

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function RoleSelect() {
  const { selectRole } = useAuth();
  const nav = useNavigate();

  const choose = (r) => { 
    selectRole(r); 
    nav("/login"); 
  };

  const roles = [
    {
      type: 'student',
      title: 'Student',
      subtitle: 'Learn from expert tutors',
      icon: SchoolIcon,
      description: 'Access personalized tutoring sessions with qualified educators',
      features: [
        'Browse qualified tutors by subject',
        'Schedule flexible learning sessions',
        'Track your learning progress',
        'Direct messaging with tutors',
        'Session recordings and materials'
      ],
      color: 'primary'
    },
    {
      type: 'tutor',
      title: 'Tutor',
      subtitle: 'Share knowledge and earn',
      icon: WorkIcon,
      description: 'Build your tutoring career with our comprehensive platform',
      features: [
        'Create detailed teaching profile',
        'Set your rates and availability',
        'Manage student bookings',
        'Built-in video conferencing',
        'Earnings analytics and reports'
      ],
      color: 'secondary'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 4, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'text.primary',
                mb: 2,
                fontWeight: 800
              }}
            >
              Choose Your Role
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Join thousands of learners and educators transforming education through personalized tutoring
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <Grid item xs={12} md={5} key={role.type}>
                <MotionCard 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)'
                    }
                  }}
                  initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <CardContent sx={{ p: 4, height: '100%' }}>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}>
                      {/* Header */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mb: 2
                        }}>
                          <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: `${role.color}.50`,
                            color: `${role.color}.main`,
                            mr: 2
                          }}>
                            <IconComponent sx={{ fontSize: 32 }} />
                          </Box>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                              {role.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {role.subtitle}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body1" sx={{ 
                          color: 'text.secondary',
                          lineHeight: 1.6
                        }}>
                          {role.description}
                        </Typography>
                      </Box>

                      {/* Features */}
                      <Box sx={{ mb: 4, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          What you get:
                        </Typography>
                        <Stack spacing={1.5}>
                          {role.features.map((feature, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: `${role.color}.main`,
                                mr: 2,
                                flexShrink: 0
                              }} />
                              <Typography variant="body2" color="text.secondary">
                                {feature}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      {/* CTA Button */}
                      <MotionButton 
                        fullWidth 
                        variant="contained"
                        color={role.color}
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => choose(role.type)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        sx={{ 
                          py: 1.5,
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        Continue as {role.title}
                      </MotionButton>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button 
            component={Link} 
            to="/" 
            variant="outlined"
            color="inherit"
            sx={{ 
              borderColor: 'grey.300',
              color: 'text.secondary'
            }}
          >
            ← Back to Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
