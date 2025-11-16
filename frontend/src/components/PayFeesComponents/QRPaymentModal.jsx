// // frontend\src\components\PayFeesComponents\QRPaymentModal.jsx

// import { 
//   Dialog, 
//   DialogTitle, 
//   DialogContent, 
//   DialogActions, 
//   Button, 
//   TextField, 
//   Typography, 
//   Box,
//   Divider,
//   CircularProgress,
//   List,
//   ListItem,
//   ListItemText,
//   Chip,
//   Snackbar,
//   Alert
// } from '@mui/material';
// import { useState } from 'react';
// import qrImg from '../../images/qr.jpg';
// import axios from 'axios';

// export const QRPaymentModal = ({ 
//   open, 
//   onClose, 
//   selectedStudents, 
//   subscriptionMode, 
//   studentsData 
// }) => {
//   const [utrNumber, setUtrNumber] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [notification, setNotification] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   // Calculate amount based on subscription mode
//   const getAmount = () => {
//     const prices = { 
//       '2months': 200, 
//       '4months': 350, 
//       '6months': 450 
//     };
//     return selectedStudents.length * prices[subscriptionMode];
//   };

//   // Get all selected students details
//   const selectedStudentsDetails = studentsData
//     .filter(student => selectedStudents.includes(student.id))
//     .map(student => ({
//       id: student.id,
//       name: `${student.firstName} ${student.lastName}`,
//       email: student.email || 'N/A',
//       contact: student.mobileNo || 'N/A',
//       instituteId: student.instituteId || 'N/A'
//     }));

//   const handleSubmit = async () => {
//     if (!utrNumber || utrNumber.trim() === '') {
//       setNotification({
//         open: true,
//         message: 'Please enter a valid UTR number',
//         severity: 'error'
//       });
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const individualAmount = getAmount() / selectedStudents.length;
      
//       // Prepare payment data in the format backend expects
//       const paymentData = {
//         payments: selectedStudentsDetails.map(student => ({
//           studentId: student.id,
//           name: student.name,
//           contact: student.contact,
//           email: student.email,
//           amount: individualAmount,
//           utr: utrNumber
//         }))
//       };

//       console.log('Submitting payment data:', paymentData);

//       const response = await axios.post(
//         'https://www.shorthandexam.in/verifyPayment1',
//         paymentData,
//         { 
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         setNotification({
//           open: true,
//           message: `Successfully processed ${selectedStudents.length} payment(s)!`,
//           severity: 'success'
//         });
//         setTimeout(() => onClose(true), 2000);
//       } else {
//         throw new Error(response.data.message || 'Payment verification failed');
//       }
//     } catch (error) {
//       console.error('Payment processing error:', {
//         status: error.response?.status,
//         message: error.message,
//         responseData: error.response?.data,
//         requestData: error.config?.data
//       });
      
//       const errorMessage = error.response?.data?.error?.details?.join(', ') || 
//                           error.response?.data?.error?.message || 
//                           error.message || 
//                           'Payment processing failed';
      
//       setNotification({
//         open: true,
//         message: errorMessage,
//         severity: 'error'
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleCloseNotification = () => {
//     setNotification(prev => ({ ...prev, open: false }));
//   };

//   return (
//     <>
//       <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
//         <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <span>Pay Using QR Code</span>
//           <Chip label={`${selectedStudents.length} student(s)`} color="primary" size="small" />
//         </DialogTitle>
        
//         <DialogContent dividers>
//           {/* Student Details Section */}
//           <Box sx={{ mb: 3 }}>
//             <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
//               Student Details
//             </Typography>
            
//             <List dense sx={{ 
//               maxHeight: 300, 
//               overflow: 'auto', 
//               border: '1px solid #eee', 
//               borderRadius: 1,
//               bgcolor: 'background.paper'
//             }}>
//               {selectedStudentsDetails.map((student) => (
//                 <ListItem key={student.id} divider>
//                   <ListItemText
//                     primary={
//                       <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'medium' }}>
//                         {student.name} (ID: {student.instituteId})
//                       </Typography>
//                     }
//                     secondary={
//                       <Box component="span">
//                         <Typography component="span" variant="body2" display="block">
//                           Email: {student.email}
//                         </Typography>
//                         <Typography component="span" variant="body2" display="block">
//                           Contact: {student.contact}
//                         </Typography>
//                       </Box>
//                     }
//                     sx={{ py: 1 }}
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           </Box>

//           <Divider sx={{ my: 2 }} />

//           {/* Payment Information Section */}
//           <Box sx={{ 
//             display: 'flex', 
//             flexDirection: { xs: 'column', md: 'row' }, 
//             gap: 4,
//             mb: 3 
//           }}>
//             {/* QR Code Section */}
//             <Box sx={{ 
//               flex: 1, 
//               display: 'flex', 
//               flexDirection: 'column', 
//               alignItems: 'center',
//               p: 2,
//               border: '1px dashed #ccc',
//               borderRadius: 1
//             }}>
//               <img 
//                 src={qrImg} 
//                 alt="Payment QR Code" 
//                 style={{ 
//                   width: '100%', 
//                   maxWidth: 250, 
//                   height: 'auto',
//                   objectFit: 'contain'
//                 }}
//               />
//               <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
//                 Scan this QR code using your bank's mobile app to make payment
//               </Typography>
//             </Box>

//             {/* Payment Details Section */}
//             <Box sx={{ flex: 1 }}>
//               <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
//                 Payment Summary
//               </Typography>
              
//               <Box sx={{ 
//                 bgcolor: 'background.paper', 
//                 p: 2, 
//                 borderRadius: 1,
//                 mb: 2
//               }}>
//                 <Typography variant="body1" component="div">
//                   <Box component="span" display="block"><strong>Subscription:</strong> {subscriptionMode.replace('months', ' months')}</Box>
//                   <Box component="span" display="block"><strong>Price per student:</strong> ₹{
//                     { '2months': 200, '4months': 350, '6months': 450 }[subscriptionMode]
//                   }</Box>
//                   <Box component="span" display="block"><strong>Number of students:</strong> {selectedStudents.length}</Box>
//                 </Typography>
//                 <Divider sx={{ my: 1 }} />
//                 <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
//                   Total Amount: ₹{getAmount()}
//                 </Typography>
//               </Box>

//               <TextField
//                 fullWidth
//                 label="UTR/Transaction Number"
//                 variant="outlined"
//                 value={utrNumber}
//                 onChange={(e) => setUtrNumber(e.target.value)}
//                 sx={{ mb: 2 }}
//                 required
//                 helperText="Enter the UTR number from your payment receipt"
//                 size="small"
//               />
//             </Box>
//           </Box>
//         </DialogContent>

//         <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
//           <Button 
//             onClick={() => onClose(false)} 
//             disabled={isSubmitting}
//             variant="outlined"
//             sx={{ minWidth: 100 }}
//           >
//             Cancel
//           </Button>
//           <Button 
//             variant="contained" 
//             onClick={handleSubmit}
//             disabled={!utrNumber || isSubmitting}
//             color="primary"
//             sx={{ minWidth: 150 }}
//           >
//             {isSubmitting ? (
//               <>
//                 <CircularProgress size={20} sx={{ mr: 1 }} />
//                 Verifying...
//               </>
//             ) : 'Verify Payment'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={notification.open}
//         autoHideDuration={6000}
//         onClose={handleCloseNotification}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert 
//           onClose={handleCloseNotification} 
//           severity={notification.severity}
//           sx={{ width: '100%' }}
//         >
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// frontend\src\components\PayFeesComponents\QRPaymentModal.jsx

import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Box,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { useState } from 'react';
import qrImg from '../../images/qr.jpg';
import axios from 'axios';

export const QRPaymentModal = ({ 
  open, 
  onClose, 
  selectedStudents, 
  subscriptionMode, 
  studentsData 
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate amount based on subscription mode
  const getAmount = () => {
    const prices = { 
      '2months': 200, 
      '4months': 350, 
      '6months': 450 
    };
    
    // Each student_id represents one subject
    return selectedStudents.length * prices[subscriptionMode];
  };

  // Get all selected students details
  const selectedStudentsDetails = studentsData
    .filter(student => selectedStudents.includes(student.id))
    .map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email || 'N/A',
      contact: student.mobileNo || 'N/A',
      instituteId: student.instituteId || 'N/A'
    }));

  const handleSubmit = async () => {
    if (!utrNumber || utrNumber.trim() === '') {
      setNotification({
        open: true,
        message: 'Please enter a valid UTR number',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const individualAmount = getAmount() / selectedStudents.length;
      
      // Prepare payment data in the format backend expects
      const paymentData = {
        payments: selectedStudentsDetails.map(student => ({
          studentId: student.id,
          name: student.name,
          contact: student.contact,
          email: student.email,
          amount: individualAmount,
          utr: utrNumber
        })),
        subscriptionMode: subscriptionMode // Add subscription mode to the request
      };

      console.log('Submitting payment data:', paymentData);

      const response = await axios.post(
        'https://www.shorthandexam.in/verifyPayment1',
        paymentData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setNotification({
          open: true,
          message: `Successfully processed ${selectedStudents.length} payment(s)! Batch period: ${response.data.batchStartDate} to ${response.data.batchEndDate}`,
          severity: 'success'
        });
        setTimeout(() => onClose(true), 2000);
      } else {
        throw new Error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment processing error:', {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data,
        requestData: error.config?.data
      });
      
      const errorMessage = error.response?.data?.error?.details?.join(', ') || 
                          error.response?.data?.error?.message || 
                          error.message || 
                          'Payment processing failed';
      
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

  return (
    <>
      <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Pay Using QR Code</span>
          <Chip label={`${selectedStudents.length} student(s)`} color="primary" size="small" />
        </DialogTitle>
        
        <DialogContent dividers>
          {/* Student Details Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Student Details
            </Typography>
            
            <List dense sx={{ 
              maxHeight: 300, 
              overflow: 'auto', 
              border: '1px solid #eee', 
              borderRadius: 1,
              bgcolor: 'background.paper'
            }}>
              {selectedStudentsDetails.map((student) => (
                <ListItem key={student.id} divider>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'medium' }}>
                        {student.name} (ID: {student.instituteId})
                      </Typography>
                    }
                    secondary={
                      <Box component="span">
                        <Typography component="span" variant="body2" display="block">
                          Email: {student.email}
                        </Typography>
                        <Typography component="span" variant="body2" display="block">
                          Contact: {student.contact}
                        </Typography>
                      </Box>
                    }
                    sx={{ py: 1 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Payment Information Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 4,
            mb: 3 
          }}>
            {/* QR Code Section */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              p: 2,
              border: '1px dashed #ccc',
              borderRadius: 1
            }}>
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Scan this QR code using your bank's mobile app to make payment
              </Typography>
            </Box>

            {/* Payment Details Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Payment Summary
              </Typography>
              
              <Box sx={{ 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                mb: 2
              }}>
                <Typography variant="body1" component="div">
                  <Box component="span" display="block"><strong>Subscription:</strong> {subscriptionMode.replace('months', ' months')}</Box>
                  <Box component="span" display="block"><strong>Price per student:</strong> ₹{
                    { '2months': 200, '4months': 350, '6months': 450 }[subscriptionMode]
                  }</Box>
                  <Box component="span" display="block"><strong>Number of students:</strong> {selectedStudents.length}</Box>
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Total Amount: ₹{getAmount()}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="UTR/Transaction Number"
                variant="outlined"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                sx={{ mb: 2 }}
                required
                helperText="Enter the UTR number from your payment receipt"
                size="small"
              />
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
            onClick={handleSubmit}
            disabled={!utrNumber || isSubmitting}
            color="primary"
            sx={{ minWidth: 150 }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Verifying...
              </>
            ) : 'Verify Payment'}
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
