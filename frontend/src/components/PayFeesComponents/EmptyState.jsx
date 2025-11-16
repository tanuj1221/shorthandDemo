// frontend\src\components\PayFeesComponents\EmptyState.jsx

import { Box, Typography } from '@mui/material';

export const EmptyState = () => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    color: 'text.secondary'
  }}>
    <Typography variant="h6">No students found</Typography>
  </Box>
);