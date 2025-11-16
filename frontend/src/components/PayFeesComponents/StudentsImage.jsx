// // frontend\src\components\PayFeesComponents\StudentsImage.jsx

import { Box, Typography } from '@mui/material';

export const StudentsImage = ({ imageData }) => {
  if (!imageData) {
    return (
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          backgroundColor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          No Image
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box
      component="img"
      src={imageData.startsWith('data:image') ? imageData : `data:image/jpeg;base64,${imageData}`}
      alt="Student"
      sx={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1px solid',
        borderColor: 'divider'
      }}
    />
  );
};