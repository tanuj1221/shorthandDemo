// src/components/SubmitButton.jsx

import React from 'react';
import { Box, Button } from '@mui/material';

const SubmitButton = ({ onClick, loading }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Button
      type="submit"
      variant="contained"
      color="primary"
      size="large"
      disabled={loading}
      sx={{ px: 5 }}
      onClick={onClick}
    >
      {loading ? 'Resetting...' : 'Reset Password'}
    </Button>
  </Box>
);

export default SubmitButton;

