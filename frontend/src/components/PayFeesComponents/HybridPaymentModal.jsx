import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Slider,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  AccountBalanceWallet,
  QrCode,
  Info,
  Payment
} from '@mui/icons-material';
import axios from 'axios';
import qrImg from '../../images/qr.jpg';

// API function for hybrid payment
const processHybridPayment = async (paymentData) => {
  try {
    const response = await fetch('http://localhost:3001/hybridpayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
      credentials: 'include' // Important for session cookies
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Payment failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Hybrid payment error:', error);
    throw error;
  }
};

export const HybridPaymentModal = ({ 
  open, 
  onClose, 
  selectedStudents, 
  subscriptionMode, 
  studentsData 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [utrNumber, setUtrNumber] = useState('');
  const [usePointsOnly, setUsePointsOnly] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate total amount
  const getTotalAmount = () => {
    const prices = { 
      '2months': 200, 
      '4months': 350, 
      '6months': 450 
    };
    
    // Each student_id represents one subject
    return selectedStudents.length * prices[subscriptionMode];
  };

  // Calculate remaining amount after points
  const getRemainingAmount = () => {
    return Math.max(0, getTotalAmount() - pointsToUse);
  };

  // Get selected students details
  const selectedStudentsDetails = studentsData
    .filter(student => selectedStudents.includes(student.id))
    .map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email || 'N/A',
      contact: student.mobileNo || 'N/A',
      instituteId: student.instituteId || 'N/A'
    }));

  // Fetch available points when modal opens
  useEffect(() => {
    if (open) {
      fetchAvailablePoints();
    }
  }, [open]);

  // Auto-set points usage when toggle changes
  useEffect(() => {
    if (usePointsOnly) {
      const maxUsablePoints = Math.min(availablePoints, getTotalAmount());
      setPointsToUse(maxUsablePoints);
    } else {
      setPointsToUse(0);
    }
  }, [usePointsOnly, availablePoints]);

  const fetchAvailablePoints = async () => {
    try {
      setIsLoadingPoints(true);
      
      // Updated API endpoint
      const response = await axios.get(
        'http://localhost:3001/institute-points2',
        { withCredentials: true }
      );
      
      console.log('Points API Response:', response.data);
      
      // Handle different possible response structures
      let points = 0;
      if (response.data) {
        if (typeof response.data === 'number') {
          points = response.data;
        } else if (response.data.points !== undefined) {
          points = response.data.points;
        } else if (response.data.data && response.data.data.points !== undefined) {
          points = response.data.data.points;
        } else if (response.data.institute_points !== undefined) {
          points = response.data.institute_points;
        }
      }
      
      setAvailablePoints(points || 0);
    } catch (error) {
      console.error('Error fetching points:', error);
      setAvailablePoints(0);
      
      const errorMessage = error.response?.status === 404 
        ? 'Points data not found for this institute'
        : error.response?.data?.message || 'Failed to load available points';
        
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsLoadingPoints(false);
    }
  };

  const handlePayment = async () => {
    const totalAmount = getTotalAmount();
    const remainingAmount = getRemainingAmount();

    // Validation
    if (pointsToUse > availablePoints) {
      setNotification({
        open: true,
        message: 'Cannot use more points than available',
        severity: 'error'
      });
      return;
    }

    if (remainingAmount > 0 && !utrNumber.trim()) {
      setNotification({
        open: true,
        message: 'Please enter UTR number for the remaining amount',
        severity: 'error'
      });
      return;
    }

    if (pointsToUse === 0 && remainingAmount === 0) {
      setNotification({
        open: true,
        message: 'Please select a payment method',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const individualCashAmount = remainingAmount / selectedStudents.length;
      
      // Prepare payment data according to your backend format
      const paymentData = {
        payments: selectedStudentsDetails.map(student => ({
          studentId: student.id,
          cashAmount: Math.ceil(individualCashAmount) // Individual student's cash amount
        })),
        totalPointsUsed: pointsToUse,
        totalCashAmount: remainingAmount,
        subscriptionMode: subscriptionMode,
        utrNumber: remainingAmount > 0 ? utrNumber : undefined
      };

      console.log('Submitting hybrid payment data:', paymentData);

      // Use the new endpoint function
      const response = await processHybridPayment(paymentData);

      console.log('Payment response:', response);

      if (response.success) {
        let message = 'Payment successful! ';
        if (pointsToUse > 0 && remainingAmount > 0) {
          message += `Used ${pointsToUse} points + ₹${remainingAmount} cash`;
        } else if (pointsToUse > 0) {
          message += `Paid using ${pointsToUse} points only`;
        } else {
          message += `Paid ₹${remainingAmount} via QR`;
        }

        setNotification({
          open: true,
          message: message,
          severity: 'success'
        });
        
        // Reset form
        setPointsToUse(0);
        setUtrNumber('');
        setUsePointsOnly(false);
        
        setTimeout(() => onClose(true), 2000);
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Hybrid payment error:', error);
      
      const errorMessage = error.message || 'Payment processing failed';
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const totalAmount = getTotalAmount();
  const remainingAmount = getRemainingAmount();
  const maxUsablePoints = Math.min(availablePoints, totalAmount);

  return (
    <>
      <Dialog open={open} onClose={() => onClose(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment />
            <span>Smart Payment Options</span>
          </Box>
          <Chip 
            label={`${selectedStudents.length} student(s)`} 
            sx={{ bgcolor: 'white', color: 'primary.main' }} 
            size="small" 
          />
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Left Column - Payment Options */}
            <Grid item xs={12} md={6}>
              {/* Points Balance Card */}
              <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AccountBalanceWallet color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Available Points
                    </Typography>
                  </Box>
                  {isLoadingPoints ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Loading points...</Typography>
                    </Box>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {availablePoints.toLocaleString()} Points (₹{availablePoints.toLocaleString()})
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method Toggle */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={usePointsOnly}
                        onChange={(e) => setUsePointsOnly(e.target.checked)}
                        color="primary"
                        disabled={availablePoints < totalAmount}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Pay with Points Only
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {availablePoints >= totalAmount 
                            ? 'Use points for full payment' 
                            : `Need ${(totalAmount - availablePoints).toLocaleString()} more points`}
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>

              {/* Points Slider */}
              {!usePointsOnly && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Use Points (1 Point = ₹1)
                    </Typography>
                    <Slider
                      value={pointsToUse}
                      onChange={(_, value) => setPointsToUse(value)}
                      min={0}
                      max={maxUsablePoints}
                      step={1}
                      marks={[
                        { value: 0, label: '₹0' },
                        { value: maxUsablePoints, label: `₹${maxUsablePoints.toLocaleString()}` }
                      ]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                      sx={{ mt: 2, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Using {pointsToUse.toLocaleString()} points = ₹{pointsToUse.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Payment Summary */}
              <Card sx={{ bgcolor: 'info.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Payment Breakdown
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Total Amount:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>₹{totalAmount.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Points Used:</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      -{pointsToUse.toLocaleString()} Points (₹{pointsToUse.toLocaleString()})
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Pay via QR:</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: remainingAmount > 0 ? 'error.main' : 'success.main' }}>
                      ₹{remainingAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - QR Code & UTR */}
            <Grid item xs={12} md={6}>
              {remainingAmount > 0 && (
                <>
                  {/* QR Code Section */}
                  <Card sx={{ mb: 3, textAlign: 'center' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                        <QrCode color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Scan & Pay ₹{remainingAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <img 
                        src={qrImg} 
                        alt="Payment QR Code" 
                        style={{ 
                          width: '100%', 
                          maxWidth: 250, 
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Scan this QR code to pay the remaining amount
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* UTR Input */}
                  <Card>
                    <CardContent>
                      <TextField
                        fullWidth
                        label="UTR/Transaction Number"
                        variant="outlined"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        required
                        helperText="Enter UTR number after paying via QR code"
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </>
              )}

              {remainingAmount === 0 && (
                <Card sx={{ bgcolor: 'success.light' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AccountBalanceWallet sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      Full Payment with Points!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No additional payment required
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>

          {/* Student Details Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Selected Students ({selectedStudents.length})
            </Typography>
            
            <List dense sx={{ 
              maxHeight: 200, 
              overflow: 'auto', 
              border: '1px solid #eee', 
              borderRadius: 1,
              bgcolor: 'background.paper'
            }}>
              {selectedStudentsDetails.map((student) => (
                <ListItem key={student.id} divider>
                  <ListItemText
                    primary={`${student.name} (ID: ${student.instituteId})`}
                    secondary={`Email: ${student.email} | Contact: ${student.contact}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Info Box */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1, display: 'flex', gap: 1 }}>
            <Info color="warning" />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                Payment Options:
              </Typography>
              <Typography variant="caption" display="block">
                • Use points only (if you have enough)
              </Typography>
              <Typography variant="caption" display="block">
                • Use points + QR payment for remaining amount
              </Typography>
              <Typography variant="caption" display="block">
                • Pay full amount via QR (set points to 0)
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => onClose(false)} 
            disabled={isSubmitting}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePayment}
            disabled={isSubmitting || (remainingAmount > 0 && !utrNumber.trim()) || isLoadingPoints}
            color="primary"
            sx={{ minWidth: 150 }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : remainingAmount === 0 ? 
              `Pay ${pointsToUse.toLocaleString()} Points` : 
              `Pay ${pointsToUse.toLocaleString()} Points + ₹${remainingAmount.toLocaleString()}`}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};