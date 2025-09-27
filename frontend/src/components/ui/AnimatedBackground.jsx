import React from 'react';
import { Box } from '@mui/material';

const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        opacity: 0.03,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 25% 25%, #1a365d 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #2563eb 0%, transparent 50%)
          `,
          opacity: 0.4,
          animation: 'subtle-float 20s ease-in-out infinite',
        },
        '@keyframes subtle-float': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-10px) translateX(5px)' }
        }
      }}
    />
  );
};

export default AnimatedBackground;
