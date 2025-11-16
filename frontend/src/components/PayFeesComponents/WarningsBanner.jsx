// frontend\src\components\PayFeesComponents\WarningsBanner.jsx

import { Box, Typography } from '@mui/material';

export const WarningsBanner = () => (
  <Box
    sx={{
      backgroundColor: 'grey.100',
      p: 3,
      mb: 3,
      borderRadius: 1,
      textAlign: 'center'
    }}
  >
    <Typography variant="body1" gutterBottom>
      Delete facility is available only before payment.
    </Typography>
    <Typography variant="body1" gutterBottom>
      No edit / delete allowed once fees is Paid.
    </Typography>
    <Typography variant="body1" gutterBottom>
      डिलिट सुविधा फक्त फी भरण्यापूर्वी उपलब्ध आहे.
    </Typography>
    <Typography variant="body1">
      एकदा फी भरल्यानंतर एडिट / डिलिट करता येणार नाही
    </Typography>
  </Box>
);