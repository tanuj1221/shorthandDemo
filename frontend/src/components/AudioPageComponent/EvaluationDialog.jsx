// frontend\src\components\AudioPageComponent\EvaluationDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';

const EvaluationDialog = ({ open, submission, onClose, onSave }) => {
  const [remark, setRemark] = React.useState(submission?.remark || '');
  const [status, setStatus] = React.useState(submission?.status || 'pending');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (submission) {
      setRemark(submission.remark || '');
      setStatus(submission.status || 'pending');
    }
  }, [submission]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        ...submission,
        status,
        remark,
        id: submission.id,
      });
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Evaluate Audio Submission</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1">
            <strong>Institute:</strong> {submission?.instituteId}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Subject:</strong> {submission?.subjectId}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Recorded by:</strong> {submission?.recorded_by}
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Remarks"
          multiline
          rows={4}
          fullWidth
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          color={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'primary'}
          startIcon={status === 'approved' ? <Check /> : status === 'rejected' ? <Close /> : null}
        >
          {isSaving ? 'Saving...' : status === 'approved' ? 'Approve' : status === 'rejected' ? 'Reject' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EvaluationDialog;