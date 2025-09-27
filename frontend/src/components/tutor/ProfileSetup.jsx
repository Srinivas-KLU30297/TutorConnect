import React, { useState } from "react";
import { 
  Box, Typography, TextField, Button, Grid, Card, CardContent, 
  Chip, Stack, MenuItem, Alert, Container, LinearProgress,
  InputAdornment, FormControl, InputLabel, Select, OutlinedInput
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "English", "Literature", "History", "Geography", "Economics",
  "Spanish", "French", "German", "SAT Prep", "ACT Prep",
  "Programming", "Web Development", "Data Science", "Calculus", "Algebra"
];

const languages = [
  "English", "Spanish", "French", "German", "Mandarin", "Hindi",
  "Arabic", "Portuguese", "Russian", "Japanese", "Italian"
];

const experienceLevels = [
  "Less than 1 year", "1-2 years", "3-5 years", 
  "6-10 years", "10+ years", "15+ years"
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const nav = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [profileData, setProfileData] = useState({
    // Step 1: Basic Info
    professionalTitle: '',
    bio: '',
    location: '',
    
    // Step 2: Teaching Info
    subjects: [],
    experience: '',
    education: '',
    hourlyRate: 50,
    
    // Step 3: Additional Info
    languages: ['English'],
    certifications: '',
    specializations: '',
    
    // Step 4: Availability (we'll add this later)
    availability: 'Full-time'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
    setError('');
  };

  const addSubject = (subject) => {
    if (subject && !profileData.subjects.includes(subject)) {
      setProfileData({
        ...profileData,
        subjects: [...profileData.subjects, subject]
      });
    }
  };

  const removeSubject = (subject) => {
    setProfileData({
      ...profileData,
      subjects: profileData.subjects.filter(s => s !== subject)
    });
  };

  const addLanguage = (language) => {
    if (language && !profileData.languages.includes(language)) {
      setProfileData({
        ...profileData,
        languages: [...profileData.languages, language]
      });
    }
  };

  const removeLanguage = (language) => {
    if (profileData.languages.length > 1) { // Keep at least one language
      setProfileData({
        ...profileData,
        languages: profileData.languages.filter(l => l !== language)
      });
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return profileData.professionalTitle && profileData.bio && profileData.location;
      case 2:
        return profileData.subjects.length > 0 && profileData.experience && profileData.education;
      case 3:
        return profileData.languages.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      setError('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const submitProfile = async () => {
    setLoading(true);
    setError('');

    try {
      // Make API call to save profile
      const response = await fetch('http://localhost:5000/api/tutors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tutorconnect_token')}`
        },
        body: JSON.stringify({
          bio: profileData.bio,
          hourly_rate: profileData.hourlyRate,
          experience: profileData.experience,
          subjects: profileData.subjects,
          education: profileData.education,
          professional_title: profileData.professionalTitle,
          location: profileData.location,
          languages: profileData.languages,
          certifications: profileData.certifications,
          specializations: profileData.specializations
        })
      });

      if (response.ok) {
        // Mark profile as completed
        localStorage.setItem('tutorconnect_profile_completed', 'true');
        nav('/tutor');
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MotionCard
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Tell us about yourself
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Professional Title"
                    placeholder="e.g., Mathematics & Physics Tutor"
                    value={profileData.professionalTitle}
                    onChange={(e) => handleChange('professionalTitle', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Professional Bio"
                    placeholder="Describe your teaching experience, approach, and what makes you a great tutor..."
                    value={profileData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    helperText={`${profileData.bio.length}/500 characters`}
                    inputProps={{ maxLength: 500 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    placeholder="e.g., New York, NY"
                    value={profileData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </MotionCard>
        );

      case 2:
        return (
          <MotionCard
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Teaching Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Subjects You Teach
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Add Subject</InputLabel>
                    <Select
                      value=""
                      onChange={(e) => addSubject(e.target.value)}
                      input={<OutlinedInput label="Add Subject" />}
                    >
                      {subjects.map(subject => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {profileData.subjects.map(subject => (
                      <Chip
                        key={subject}
                        label={subject}
                        onDelete={() => removeSubject(subject)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Teaching Experience"
                    value={profileData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                  >
                    {experienceLevels.map(level => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hourly Rate (₹)"
                    type="number"
                    value={profileData.hourlyRate}
                    onChange={(e) => handleChange('hourlyRate', Number(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 10, max: 10000 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Education & Qualifications"
                    placeholder="e.g., Ph.D. in Mathematics, M.S. in Physics, B.Tech from IIT..."
                    value={profileData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </MotionCard>
        );

      case 3:
        return (
          <MotionCard
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Additional Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Languages You Speak
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Add Language</InputLabel>
                    <Select
                      value=""
                      onChange={(e) => addLanguage(e.target.value)}
                      input={<OutlinedInput label="Add Language" />}
                    >
                      {languages.map(language => (
                        <MenuItem key={language} value={language}>
                          {language}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {profileData.languages.map(language => (
                      <Chip
                        key={language}
                        label={language}
                        onDelete={profileData.languages.length > 1 ? () => removeLanguage(language) : undefined}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Certifications & Awards (Optional)"
                    placeholder="e.g., Teaching Excellence Award, TESOL Certified, etc."
                    value={profileData.certifications}
                    onChange={(e) => handleChange('certifications', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Specializations (Optional)"
                    placeholder="e.g., SAT/ACT Prep, Advanced Calculus, Competitive Programming, etc."
                    value={profileData.specializations}
                    onChange={(e) => handleChange('specializations', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </MotionCard>
        );

      case 4:
        return (
          <MotionCard
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Review Your Profile
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary">
                    {profileData.professionalTitle}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {profileData.bio}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {profileData.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Experience:</strong> {profileData.experience}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Hourly Rate:</strong> ₹{profileData.hourlyRate}/hr
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Subjects:</strong>
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {profileData.subjects.map(subject => (
                      <Chip key={subject} label={subject} size="small" />
                    ))}
                  </Stack>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Languages:</strong>
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {profileData.languages.map(language => (
                      <Chip key={language} label={language} size="small" color="secondary" />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </MotionCard>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Welcome to TutorConnect, {user?.name?.split(' ')[0]}! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Let's set up your tutoring profile to attract students
          </Typography>
          
          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Step {currentStep} of {totalSteps}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentStep / totalSteps) * 100} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={prevStep}
            disabled={currentStep === 1}
            size="large"
          >
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <MotionButton
              variant="contained"
              onClick={nextStep}
              size="large"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next Step
            </MotionButton>
          ) : (
            <MotionButton
              variant="contained"
              onClick={submitProfile}
              disabled={loading}
              size="large"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </MotionButton>
          )}
        </Box>
      </Box>
    </Container>
  );
}
