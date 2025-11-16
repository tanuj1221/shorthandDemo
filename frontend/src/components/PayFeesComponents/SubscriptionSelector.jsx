// // frontend\src\components\PayFeesComponents\SubscriptionSelector.jsx
import { 
  Typography, 
  Select, 
  MenuItem, 
  Button,
  Box,
  FormControl,
  InputLabel 
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PaymentIcon from '@mui/icons-material/Payment';

export const SubscriptionSelector = ({ 
  subscriptionMode, 
  setSubscriptionMode,
  onQrPaymentClick,
  onHybridPaymentClick
}) => {
  const subscriptionOptions = [
    { value: "2months", label: "2 Months", price: "₹200" },
    { value: "4months", label: "4 Months", price: "₹350" },
    { value: "6months", label: "6 Months", price: "₹450" }
  ];

  const selectedOption = subscriptionOptions.find(opt => opt.value === subscriptionMode);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select Subscription Mode:
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="subscription-select-label">Subscription Plan</InputLabel>
        <Select
          labelId="subscription-select-label"
          value={subscriptionMode}
          label="Subscription Plan"
          onChange={(e) => setSubscriptionMode(e.target.value)}
        >
          {subscriptionOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {`${option.label} - ${option.price}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedOption && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          Selected: {selectedOption.label} ({selectedOption.price})
        </Typography>
      )}

      {/* Payment Method Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        {/* Smart Payment Button */}
        <Button
          variant="contained"
          color="success"
          startIcon={<PaymentIcon />}
          onClick={onHybridPaymentClick}
          sx={{ minWidth: 180 }}
        >
          Smart Payment
        </Button>

        {/* QR Payment Only Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<QrCodeIcon />}
          onClick={onQrPaymentClick}
          sx={{ minWidth: 150 }}
        >
          QR Payment Only
        </Button>

        {/* View Instructions Button */}
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<OpenInNewIcon />}
          onClick={() => window.open("https://shorthandbucket.s3.ap-south-1.amazonaws.com/Payment_Demo+.pdf", "_blank")}
        >
          View Instructions
        </Button>
      </Box>

      {/* Payment Options Info */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
          💡 Payment Options:
        </Typography>
        <Typography variant="caption" display="block">
          • <strong>Smart Payment:</strong> Use points + money
        </Typography>
        <Typography variant="caption" display="block">
          • <strong>QR Payment Only:</strong> Pay full amount via QR code
        </Typography>
        <Typography variant="caption" display="block">
          • <strong>Points Rate:</strong> 1 Point = ₹1
        </Typography>
      </Box>
    </Box>
  );
};