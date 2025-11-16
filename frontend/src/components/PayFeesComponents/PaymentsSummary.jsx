// frontend\src\components\PayFeesComponents\PaymentsSummary.jsx

import { Box, Typography, Button } from '@mui/material';

export const PaymentsSummary = ({ 
  selected, 
  onProceed,
  subscriptionMode,
  studentsData = []
}) => {
  // Calculate amount based on subscription mode
  const calculateAmount = () => {
    const pricing = {
      '2months': 200,
      '4months': 350,
      '6months': 450
    };
    
    // Each student_id represents one subject
    return selected.length * pricing[subscriptionMode];
  };

  // Format date to show batch end date based on subscription
  const getBatchEndDate = () => {
    const today = new Date();
    const monthsToAdd = {
      '2months': 2,
      '4months': 4,
      '6months': 6
    };
    
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + monthsToAdd[subscriptionMode]);
    
    return endDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="h6">
          Total Amount: ₹{calculateAmount()}
        </Typography>
        <Typography variant="h6">
          Batch End Date: {getBatchEndDate()}
        </Typography>
      </Box>
      
    </>
  );
};