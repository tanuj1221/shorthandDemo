// frontend/src/components/AudioPageComponent/StatusChip.jsx
import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status || 'Unknown'}
      color={getStatusColor(status)}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

export default StatusChip;