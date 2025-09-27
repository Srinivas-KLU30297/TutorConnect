import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Typography, TextField, MenuItem, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Chip, Stack, Card, CardContent,
  Avatar, Divider, Alert
} from "@mui/material";
import { motion } from "framer-motion";
import VideoCallIcon from '@mui/icons-material/VideoCall';
import TutorCard from "./TutorCard";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";

const MotionCard = motion(Card);

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "Web Development", "Programming", "English", "Spanish", "French"
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    duration: 60,
    message: ''
  });
  const [myBookings, setMyBookings] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);

  useEffect(() => {
    // Load student's booking history and sessions
    if (user?.email) {
      const bookings = bookingService.getStudentBookings(user.email);
      const sessions = bookingService.getMySessions(user.email);
      setMyBookings(bookings);
      setMySessions(sessions);
      
      console.log('Student Dashboard - User:', user.email);
      console.log('Student Dashboard - Bookings:', bookings);
      console.log('Student Dashboard - Sessions:', sessions);
    }
  }, [user]);

  // Get live tutors - including current logged in user if they're a tutor
  const getLiveTutors = () => {
    const tutors = [];
    
    // Check if current logged in user is also a live tutor
    const currentUserName = localStorage.getItem('tutorconnect_user_name');
    const isCurrentUserLive = localStorage.getItem('tutorconnect_profile_live') === 'true';
    const currentUserRole = user?.role;
    
    console.log('Current user name from storage:', currentUserName);
    console.log('Is current user live:', isCurrentUserLive);
    console.log('Current user role:', currentUserRole);
    
    // Add current user as tutor if they're live (and not the same person booking)
    if (isCurrentUserLive && currentUserName && currentUserName !== user?.name) {
      tutors.push({
        id: 1,
        name: currentUserName,
        professionalTitle: localStorage.getItem('tutorconnect_profile_title') || "Professional Tutor",
        location: localStorage.getItem('tutorconnect_user_location') || "India",
        subjects: JSON.parse(localStorage.getItem('tutorconnect_profile_subjects') || '["Web Development"]'),
        hourlyRate: parseInt(localStorage.getItem('tutorconnect_profile_rate')) || 500,
        rating: 4.8,
        totalReviews: 23,
        bio: localStorage.getItem('tutorconnect_profile_bio') || "Experienced educator ready to help students.",
        isLive: true,
        experience: localStorage.getItem('tutorconnect_profile_experience') || "3-5 years",
        languages: JSON.parse(localStorage.getItem('tutorconnect_profile_languages') || '["English"]'),
        verified: true
      });
    }

    // Add demo tutors (always available)
    tutors.push(
      {
        id: 2,
        name: "Dr. Sarah Mitchell",
        professionalTitle: "Mathematics Professor",
        location: "Mumbai, Maharashtra", 
        subjects: ["Mathematics", "Calculus", "Statistics"],
        hourlyRate: 800,
        rating: 4.9,
        totalReviews: 156,
        bio: "Ph.D. in Mathematics with 10+ years teaching experience.",
        isLive: true,
        experience: "10+ years",
        languages: ["English", "Hindi", "Marathi"],
        verified: true
      },
      {
        id: 3,
        name: "Arjun Patel",
        professionalTitle: "Software Engineer & Mentor",
        location: "Bangalore, Karnataka",
        subjects: ["Python", "Data Science", "Machine Learning"], 
        hourlyRate: 600,
        rating: 4.7,
        totalReviews: 89,
        bio: "Senior software engineer passionate about teaching programming.",
        isLive: true,
        experience: "6-10 years", 
        languages: ["English", "Hindi", "Gujarati"],
        verified: true
      }
    );

    console.log('Available tutors:', tutors);
    return tutors;
  };

  const liveTutors = getLiveTutors();

  const filtered = useMemo(() => {
    return liveTutors.filter(t => {
      const matchesQuery =
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.location.toLowerCase().includes(query.toLowerCase()) ||
        t.professionalTitle.toLowerCase().includes(query.toLowerCase());
      const matchesSubject = subject ? t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase())) : true;
      const matchesPrice = price ? t.hourlyRate <= Number(price) : true;
      return matchesQuery && matchesSubject && matchesPrice && t.isLive;
    });
  }, [query, subject, price, liveTutors]);

  const viewTutor = (t) => { 
    setCurrent(t); 
    setOpen(true); 
  };

  const openBookingDialog = (tutor) => {
    setCurrent(tutor);
    setOpen(false);
    setBookingDialog(true);
  };

  const submitBookingRequest = () => {
    if (!user) {
      alert('Please login to book a session');
      return;
    }

    const booking = {
      tutor_id: current.id,
      tutor_name: current.name,
      student_name: user.name,
      student_email: user.email,
      subject: current.subjects[0],
      requested_date: bookingDetails.date,
      requested_time: bookingDetails.time,
      duration: bookingDetails.duration,
      message: bookingDetails.message || 'No specific message',
      hourly_rate: current.hourlyRate,
      total_cost: (current.hourlyRate * bookingDetails.duration) / 60
    };

    console.log('Creating booking request:', booking);

    // Save booking request using our service
    const savedBooking = bookingService.createBookingRequest(booking);
    
    // Update local state
    setMyBookings(prev => [...prev, savedBooking]);
    
    alert(`✅ Booking request sent to ${current.name}! 

Details:
- Subject: ${booking.subject}
- Date: ${booking.requested_date}
- Time: ${booking.requested_time}
- Duration: ${booking.duration} minutes
- Cost: ₹${Math.round(booking.total_cost)}

You'll be notified once they respond.`);
    
    setBookingDialog(false);
    setBookingDetails({ date: '', time: '', duration: 60, message: '' });
  };

  // My Sessions View
  if (showSessions) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            My Sessions 📚
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => setShowSessions(false)}
          >
            Back to Find Tutors
          </Button>
        </Box>

        {mySessions.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No confirmed sessions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Book a session with a tutor and get it confirmed to see it here
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => setShowSessions(false)}
              >
                Find Tutors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {mySessions.map((session) => (
              <Grid item xs={12} md={6} key={session.id}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {session.tutor_name}
                      </Typography>
                      <Chip 
                        label={session.status} 
                        color="success" 
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Subject:</strong> {session.subject}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Date:</strong> {session.session_date} at {session.session_time}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Duration:</strong> {session.duration} minutes
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: 'success.main', fontWeight: 600 }}>
                      <strong>Cost:</strong> ₹{Math.round(session.cost)}
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
                        onClick={() => window.open(`https://meet.jit.si/tutorconnect-${session.id}`, '_blank')}
                      >
                        Join Call
                      </Button>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Find Your Perfect Tutor 🎯
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Connect with expert educators who are online and ready to teach
        </Typography>
      </Box>

      {/* My Sessions Alert */}
      {mySessions.length > 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              🎉 You have {mySessions.length} confirmed session(s)!
            </Typography>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => setShowSessions(true)}
            >
              View My Sessions
            </Button>
          </Box>
        </Alert>
      )}

      {/* My Bookings Summary */}
      {myBookings.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              📚 You have {myBookings.length} booking request(s). 
              {myBookings.filter(b => b.status === 'pending').length > 0 && 
                ` ${myBookings.filter(b => b.status === 'pending').length} pending approval.`
              }
              {myBookings.filter(b => b.status === 'confirmed').length > 0 && 
                ` ${myBookings.filter(b => b.status === 'confirmed').length} confirmed!`
              }
            </Typography>
            {mySessions.length === 0 && myBookings.filter(b => b.status === 'confirmed').length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Refresh page to see confirmed sessions
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {/* Live Tutors Alert */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          🟢 {filtered.length} tutors are currently live and accepting students!
        </Typography>
      </Alert>

      {/* Debug Info */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            <strong>Debug Info:</strong> User: {user?.name} ({user?.email}) | 
            Current User from Storage: {localStorage.getItem('tutorconnect_user_name')} | 
            Profile Live: {localStorage.getItem('tutorconnect_profile_live')} |
            Found {liveTutors.length} total tutors
          </Typography>
          <Button 
            size="small" 
            onClick={() => bookingService.getAllData()}
            sx={{ mt: 1 }}
          >
            Debug: View All Data in Console
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Search & Filter
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Search by name, title, or location"
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. React, Mumbai, Professor"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField 
                select 
                fullWidth 
                label="Subject"
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField 
                fullWidth 
                label="Max price (₹/hr)" 
                type="number"
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1000"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Available Tutors ({filtered.length})
      </Typography>

      {filtered.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No tutors found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search filters or make sure someone is live as a tutor
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(t => (
            <Grid item xs={12} key={t.id}>
              <TutorCard tutor={t} onView={viewTutor} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tutor Details Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
              {current?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {current?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {current?.professionalTitle}
              </Typography>
              {current?.verified && <Chip label="✓ Verified" color="success" size="small" />}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>About</Typography>
              <Typography sx={{ mb: 3 }}>{current?.bio}</Typography>
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Subjects</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {current?.subjects?.map(s => (
                  <Chip key={s} label={s} color="primary" variant="outlined" />
                ))}
              </Stack>
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Languages</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {current?.languages?.map(l => (
                  <Chip key={l} label={l} color="secondary" variant="outlined" />
                ))}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  ₹{current?.hourlyRate}/hr
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  📍 {current?.location}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  ⭐ {current?.rating} ({current?.totalReviews} reviews)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  💼 {current?.experience}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} size="large">
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => openBookingDialog(current)}
            size="large"
          >
            Request Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Request Dialog */}
      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Request a Session with {current?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preferred Date"
                type="date"
                value={bookingDetails.date}
                onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preferred Time"
                type="time"
                value={bookingDetails.time}
                onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Session Duration"
                value={bookingDetails.duration}
                onChange={(e) => setBookingDetails({...bookingDetails, duration: e.target.value})}
              >
                <MenuItem value={30}>30 minutes - ₹{Math.round((current?.hourlyRate || 0) * 0.5)}</MenuItem>
                <MenuItem value={60}>1 hour - ₹{current?.hourlyRate || 0}</MenuItem>
                <MenuItem value={90}>1.5 hours - ₹{Math.round((current?.hourlyRate || 0) * 1.5)}</MenuItem>
                <MenuItem value={120}>2 hours - ₹{(current?.hourlyRate || 0) * 2}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Message to Tutor (Optional)"
                placeholder="Describe what you'd like to learn or any specific requirements..."
                value={bookingDetails.message}
                onChange={(e) => setBookingDetails({...bookingDetails, message: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBookingDialog(false)} size="large">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={submitBookingRequest}
            disabled={!bookingDetails.date || !bookingDetails.time}
            size="large"
          >
            Send Request (₹{Math.round(((current?.hourlyRate || 0) * bookingDetails.duration) / 60)})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
