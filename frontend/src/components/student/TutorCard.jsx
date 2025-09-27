import React from "react";
import { Card, CardContent, Typography, Chip, Stack, Button, Box, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function TutorCard({ tutor, onView }) {
  return (
    <MotionCard 
      sx={{ 
        mb: 2, 
        p: 2,
        border: '1px solid #e0e0e0',
        position: 'relative',
        overflow: 'visible'
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 8px 25px rgba(0,0,0,0.12)"
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Live Indicator */}
      {tutor.isLive && (
        <Chip
          label="🟢 Live"
          color="success"
          size="small"
          sx={{
            position: 'absolute',
            top: -8,
            right: 16,
            zIndex: 1,
            fontWeight: 600
          }}
        />
      )}

      <CardContent sx={{ display: "flex", gap: 3, alignItems: 'start', p: 2 }}>
        <Avatar
          sx={{
            width: 80, 
            height: 80, 
            bgcolor: "primary.main",
            color: "white", 
            fontSize: '2rem',
            fontWeight: 700
          }}
        >
          {tutor.name.charAt(0)}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {tutor.name}
            </Typography>
            {tutor.verified && (
              <VerifiedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            )}
          </Box>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {tutor.professionalTitle}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {tutor.location}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
            {tutor.subjects.slice(0, 3).map(s => (
              <Chip key={s} label={s} size="small" color="primary" variant="outlined" />
            ))}
            {tutor.subjects.length > 3 && (
              <Chip label={`+${tutor.subjects.length - 3} more`} size="small" variant="outlined" />
            )}
          </Stack>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ₹{tutor.hourlyRate}/hr
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hourly Rate
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarRoundedIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {tutor.rating}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {tutor.totalReviews} reviews
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {tutor.experience}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Experience
                </Typography>
              </Box>
            </Box>

            <MotionButton 
              variant="contained" 
              onClick={() => onView(tutor)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ 
                px: 3,
                py: 1,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)'
              }}
            >
              View Profile
            </MotionButton>
          </Box>
        </Box>
      </CardContent>
    </MotionCard>
  );
}
