
// src/components/ResetPasswordComponents/ResetPasswordHeader.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

const ResetPasswordHeader = () => (
  <Box sx={{ textAlign: 'center', mb: 3 }}>
    <LockResetIcon color="primary" sx={{ fontSize: 60, color: '#3b82f6'}} />
    <Typography
      variant="h4"
      sx={{
        fontWeight: 'bold',
        color: '#3b82f6',
        mt: 1,
      }}
    >
      RESET PASSWORD
    </Typography>
    <Typography variant="subtitle1" color="text.secondary">
      Enter your institute ID and new password
    </Typography>
  </Box>
);

export default ResetPasswordHeader;

