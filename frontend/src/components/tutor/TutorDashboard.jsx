import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Grid, Card, CardContent, Tabs, Tab, 
  Avatar, Alert, Chip, Stack
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import MessageIcon from '@mui/icons-material/Message';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function TutorDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [messages, setMessages] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [myStudents, setMyStudents] = useState([]);

  useEffect(() => {
    loadTutorData();
    
    // Auto refresh every 5 seconds when live
    const interval = setInterval(() => {
      if (isLive) {
        loadBookingRequests();
        loadMyStudents();
        loadMessages();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user, isLive]);

  const loadTutorData = async () => {
    try {
      const profileCompleted = localStorage.getItem('tutorconnect_profile_completed');
      const profileLive = localStorage.getItem('tutorconnect_profile_live');
      
      if (profileCompleted !== 'true') {
        nav('/tutor-setup');
        return;
      }

      setIsLive(profileLive === 'true');

      // Store current user name for booking system
      if (user?.name) {
        localStorage.setItem('tutorconnect_user_name', user.name);
      }

      const mockProfileData = {
        ...user,
        professionalTitle: localStorage.getItem('tutorconnect_profile_title') || 'Professional Tutor',
        bio: localStorage.getItem('tutorconnect_profile_bio') || 'Experienced educator ready to help students.',
        hourly_rate: parseInt(localStorage.getItem('tutorconnect_profile_rate')) || 50,
        experience: localStorage.getItem('tutorconnect_profile_experience') || '3-5 years',
        subjects: JSON.parse(localStorage.getItem('tutorconnect_profile_subjects') || '["Web Development"]'),
        languages: JSON.parse(localStorage.getItem('tutorconnect_profile_languages') || '["English"]'),
        rating: 4.8,
        total_reviews: 0,
        total_students: 0,
        total_hours: 0,
        earnings: 0,
        verified: true
      };

      setProfileData(mockProfileData);

      if (profileLive === 'true') {
        loadMessages();
        loadBookingRequests();
        loadMyStudents();
      }
      
    } catch (error) {
      console.error('Error loading tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = () => {
    if (!user?.name) return;
    
    const userRole = 'tutor';
    const conversations = bookingService.getUserConversations(user.name, userRole);
    
    // Extract recent messages from conversations
    const recentMessages = conversations.slice(0, 5).map(conv => ({
      id: conv.id,
      student_name: conv.student_name,
      student_email: conv.student_email,
      message: conv.last_message,
      timestamp: conv.last_message_time,
      replied: false,
      conversation_id: conv.id
    }));
    
    setMessages(recentMessages);
    console.log('✅ Loaded messages for tutor:', user.name, recentMessages);
  };

  const loadBookingRequests = () => {
    if (!user?.name) return;
    
    const requests = bookingService.getTutorBookings(user.name);
    setBookingRequests(requests);
    console.log('✅ Loaded booking requests for tutor:', user.name, requests);
  };

  const loadMyStudents = () => {
    if (!user?.name) return;
    
    const studentsList = bookingService.getMyStudents(user.name);
    setMyStudents(studentsList);
    console.log('✅ Loaded students for tutor:', user.name, studentsList);
  };

  const handleGoLive = () => {
    localStorage.setItem('tutorconnect_profile_live', 'true');
    setIsLive(true);
    
    // Store user name for the booking system
    if (user?.name) {
      localStorage.setItem('tutorconnect_user_name', user.name);
    }
    
    loadMessages();
    loadBookingRequests();
    loadMyStudents();
    alert('🎉 Congratulations! Your profile is now live and visible to students!');
  };

  const handleGoOffline = () => {
    localStorage.setItem('tutorconnect_profile_live', 'false');
    setIsLive(false);
    setMessages([]);
    setBookingRequests([]);
    setMyStudents([]);
  };

  const acceptBooking = (bookingId) => {
    console.log('🎯 Accepting booking:', bookingId);
    
    const result = bookingService.updateBookingStatus(bookingId, 'confirmed');
    console.log('✅ Booking acceptance result:', result);
    
    // Refresh all data
    loadBookingRequests();
    loadMyStudents();
    loadMessages();
    
    // Debug: Show all data
    bookingService.getAllData();
    
    alert('✅ Booking confirmed! Student has been added to "My Students" and can now chat with you. Check the "My Students" tab!');
  };

  const declineBooking = (bookingId) => {
    bookingService.updateBookingStatus(bookingId, 'declined');
    loadBookingRequests();
    alert('❌ Booking declined. Student will be notified.');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography variant="h6">Loading your dashboard...</Typography>
      </Box>
    );
  }

  const pendingBookings = bookingRequests.filter(req => req.status === 'pending').length;
  const confirmedBookings = bookingRequests.filter(req => req.status === 'confirmed').length;

  const stats = [
    {
      title: "Total Earnings",
      value: `₹${myStudents.reduce((total, student) => total + student.total_earnings, 0)}`,
      icon: AttachMoneyIcon,
      color: "success.main",
      change: isLive ? `${confirmedBookings} sessions confirmed` : "Go live to start earning!"
    },
    {
      title: "My Students", 
      value: myStudents.length,
      icon: PeopleIcon,
      color: "primary.main",
      change: isLive ? `${pendingBookings} pending requests` : "Students will find you when live"
    },
    {
      title: "Profile Views",
      value: isLive ? Math.max(124, bookingRequests.length * 10) : "0",
      icon: VisibilityIcon,
      color: "info.main",
      change: isLive ? "Great visibility!" : "Go live to get views"
    },
    {
      title: "Hours Taught",
      value: `${myStudents.reduce((total, student) => total + student.sessions_count, 0)}h`,
      icon: EventIcon,
      color: "warning.main",
      change: isLive ? `${confirmedBookings} sessions completed` : "Ready to start teaching!"
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              {isLive 
                ? "Your profile is live and accepting students!" 
                : "Complete setup and go live to start teaching"
              }
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            {!isLive ? (
              <MotionButton
                variant="contained"
                size="large"
                onClick={handleGoLive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
                  color: 'white',
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}
              >
                🚀 Go Live Now!
              </MotionButton>
            ) : (
              <Box>
                <Chip
                  label="🟢 Live"
                  color="success"
                  variant="filled"
                  sx={{ mb: 1, fontSize: '1rem', px: 2, py: 1 }}
                />
                <br />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleGoOffline}
                  color="error"
                >
                  Go Offline
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Status Alerts */}
      {!isLive && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            📋 Profile Complete - Ready to Go Live!
          </Typography>
          <Typography>
            Your profile setup is complete. Click "Go Live Now" to make your profile visible to students and start receiving booking requests.
          </Typography>
        </Alert>
      )}

      {isLive && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            🎉 You're Live! Students Can Now Find You
          </Typography>
          <Typography>
            Your profile is active and visible to students. You have {bookingRequests.length} total booking requests and {myStudents.length} students.
          </Typography>
        </Alert>
      )}

      {pendingBookings > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            🔔 {pendingBookings} New Booking Request{pendingBookings > 1 ? 's' : ''}!
          </Typography>
          <Typography>
            You have {pendingBookings} pending booking request(s) waiting for your response. Accept them to add students to your list!
          </Typography>
        </Alert>
      )}

      {/* Debug Alert */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            <strong>Debug Info:</strong> User: {user?.name} | 
            Stored Name: {localStorage.getItem('tutorconnect_user_name')} | 
            Students: {myStudents.length} | Bookings: {bookingRequests.length}
          </Typography>
          <Button 
            size="small" 
            onClick={() => bookingService.getAllData()}
            sx={{ mt: 1 }}
          >
            Debug: View All Data in Console
          </Button>
          <Button 
            size="small" 
            onClick={() => {
              loadBookingRequests();
              loadMyStudents();
              loadMessages();
            }}
            sx={{ mt: 1, ml: 1 }}
          >
            Refresh Data
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${stat.color.split('.')[0]}.50`,
                      mr: 2
                    }}>
                      <IconComponent sx={{ color: stat.color, fontSize: 24 }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.change}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Main Content */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ px: 3 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Profile Overview" />
            <Tab label={`Booking Requests ${pendingBookings > 0 ? `(${pendingBookings})` : ''}`} />
            <Tab label={`My Students ${myStudents.length > 0 ? `(${myStudents.length})` : ''}`} />
            <Tab label={`Messages ${messages.length > 0 ? `(${messages.length})` : ''}`} />
            <Tab label="Earnings & Analytics" />
          </Tabs>
        </Box>

        {/* Profile Overview Tab */}
        {activeTab === 0 && (
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Your Profile
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => nav('/tutor-setup')}
              >
                Edit Profile
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem',
                      fontWeight: 700
                    }}
                  >
                    {user.name?.charAt(0) || 'T'}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profileData?.professionalTitle}
                  </Typography>
                  <Chip label="✓ Verified" color="success" size="small" sx={{ mt: 1 }} />
                </Box>
              </Grid>

              <Grid item xs={12} md={9}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {profileData?.bio}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Hourly Rate:</strong> ₹{profileData?.hourly_rate}/hr
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Experience:</strong> {profileData?.experience}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Location:</strong> {profileData?.location || user.location || 'India'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Subjects:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {profileData?.subjects?.map(subject => (
                        <Chip key={subject} label={subject} size="small" />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Booking Requests Tab */}
        {activeTab === 1 && (
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Booking Requests
            </Typography>
            
            {!isLive ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Go live to receive booking requests from students
                </Typography>
              </Box>
            ) : bookingRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No booking requests yet. Students will send requests soon!
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {bookingRequests.map((request) => (
                  <Grid item xs={12} key={request.id}>
                    <Card 
                      variant="outlined" 
                      sx={{
                        border: request.status === 'pending' ? '2px solid #ff9800' : '1px solid #e0e0e0',
                        bgcolor: request.status === 'pending' ? 'warning.50' : 'background.paper'
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {request.student_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.student_email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Request ID: {request.id} | Created: {new Date(request.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                          <Chip
                            label={request.status.toUpperCase()}
                            color={
                              request.status === 'pending' ? 'warning' :
                              request.status === 'confirmed' ? 'success' : 'error'
                            }
                            sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                          />
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Subject:</strong> {request.subject}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Date:</strong> {request.requested_date}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Time:</strong> {request.requested_time}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Duration:</strong> {request.duration} minutes
                            </Typography>
                            <Typography variant="body2">
                              <strong>Rate:</strong> ₹{request.hourly_rate}/hr
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                              <strong>Total Cost:</strong> ₹{Math.round(request.total_cost)}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Typography variant="body2" sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <strong>Student Message:</strong> "{request.message}"
                        </Typography>
                        
                        {request.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => acceptBooking(request.id)}
                              sx={{ fontWeight: 600 }}
                            >
                              ✅ Accept Booking
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => declineBooking(request.id)}
                            >
                              ❌ Decline
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<MessageIcon />}
                              onClick={() => nav('/chat')}
                            >
                              💬 Message Student
                            </Button>
                          </Box>
                        )}

                        {request.status === 'confirmed' && (
                          <Alert severity="success">
                            <Typography variant="body2">
                              ✅ <strong>Session Confirmed!</strong> You will receive ₹{Math.round(request.total_cost)} for this session. Student has been added to "My Students"!
                            </Typography>
                          </Alert>
                        )}

                        {request.status === 'declined' && (
                          <Alert severity="info">
                            <Typography variant="body2">
                              ❌ This request was declined.
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        )}

        {/* My Students Tab */}
        {activeTab === 2 && (
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              My Students ({myStudents.length})
            </Typography>
            
            {myStudents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No students yet. Accept booking requests to see students here!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  When you accept a booking request, the student will automatically appear here
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {myStudents.map((student) => (
                  <Grid item xs={12} md={6} key={student.id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {student.student_name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {student.student_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {student.student_email}
                            </Typography>
                          </Box>
                          <Chip 
                            label={student.status} 
                            color="success" 
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Subject:</strong> {student.subject}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Sessions:</strong> {student.sessions_count}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: 'success.main', fontWeight: 600 }}>
                          <strong>Total Earnings:</strong> ₹{Math.round(student.total_earnings)}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                          <strong>Last Session:</strong> {student.last_session}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => nav('/chat')}
                          >
                            💬 Chat
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<VideoCallIcon />}
                            onClick={() => window.open(`https://meet.jit.si/tutorconnect-${student.student_name.replace(/\s+/g, '-')}`, '_blank')}
                          >
                            Video Call
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        )}

        {/* Messages Tab */}
        {activeTab === 3 && (
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Recent Messages ({messages.length})
              </Typography>
              <Button
                variant="contained"
                onClick={() => nav('/chat')}
              >
                Open Full Chat
              </Button>
            </Box>
            
            {!isLive ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Go live to receive messages from students
                </Typography>
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No messages yet. Students will contact you after booking sessions!
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {messages.map((message) => (
                  <Grid item xs={12} key={message.id}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                              {message.student_name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {message.student_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {message.student_email} • {new Date(message.timestamp).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label="New"
                            color="primary"
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 3 }}>
                          "{message.message}"
                        </Typography>
                        
                        <Button
                          variant="contained"
                          startIcon={<MessageIcon />}
                          onClick={() => nav('/chat')}
                        >
                          Reply to Student
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        )}

        {/* Analytics Tab */}
        {activeTab === 4 && (
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Earnings & Analytics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: 300, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box>
                    <TrendingUpIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {isLive ? "Total Bookings" : "Ready to Earn"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isLive ? `${bookingRequests.length} booking requests received` : "Go live to start earning"}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, color: 'success.main' }}>
                      {bookingRequests.length}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: 300, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box>
                    <StarIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Response Rate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {bookingRequests.length > 0 ? "Great job responding to students!" : "Start teaching to get ratings"}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, color: 'warning.main' }}>
                      {bookingRequests.length > 0 ? "100%" : "--"}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Box>
  );
}
