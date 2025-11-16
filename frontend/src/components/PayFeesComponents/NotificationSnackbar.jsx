// frontend\src\components\PayFeesComponents\NotificationSnackbar.jsx

import { Snackbar, Alert } from '@mui/material';

export const NotificationSnackbar = ({ 
  open, 
  message, 
  severity, 
  onClose 
}) => (
  <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);