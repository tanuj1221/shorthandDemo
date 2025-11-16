
// frontend/src/pages/AudioPage.jsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Paper
} from '@mui/material';
import AudioTable from '../components/AudioPageComponent/AudioTable';
import EvaluationDialog from '../components/AudioPageComponent/EvaluationDialog';
import useAudioSubmissions from '../hooks/useAudioSubmissions';

const AudioPage = () => {
  // Custom hook for audio submissions
  const {
    audioSubmissions,
    updateSubmission,
    deleteSubmission,
    loading,
    error,
    refreshSubmissions
  } = useAudioSubmissions();

  // Local state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle notification display
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  // Handle notification close
  const handleNotificationClose = useCallback(() => {
    setNotification({ message: '', type: '' });
  }, []);

  // Handle submission deletion
  const handleDelete = async (id) => {
    try {
      setIsProcessing(true);
      await deleteSubmission(id);
      showNotification('Submission deleted successfully', 'success');
      await refreshSubmissions(); // Refresh the list after deletion
    } catch (error) {
      showNotification(error.message || 'Failed to delete submission', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle submission update
  const handleUpdate = async (updatedSubmission) => {
    try {
      setIsProcessing(true);
      await updateSubmission(updatedSubmission);
      setSelectedSubmission(null);
      showNotification(`Submission ${updatedSubmission.status} successfully`, 'success');
      await refreshSubmissions(); // Refresh the list after update
    } catch (error) {
      showNotification(error.message || 'Failed to update submission', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setSelectedSubmission(null);
  }, []);

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refreshSubmissions}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'background.default',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 className="text-4xl font-bold mb-4 text-center py-4 h-15">Audio Submissions Evaluation</h2>

        </Paper>

        {/* Main Content */}
        <Card>
          <CardContent>
            {loading || isProcessing ? (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 3,
                minHeight: 200
              }}>
                <CircularProgress />
              </Box>
            ) : (
              <AudioTable
                submissions={Array.isArray(audioSubmissions) ? audioSubmissions : []}
                onSelectSubmission={setSelectedSubmission}
                onUpdateSubmission={handleUpdate}
                onDeleteSubmission={handleDelete}
                disabled={isProcessing}
              />
            )}
          </CardContent>
        </Card>

        {/* Evaluation Dialog */}
        {selectedSubmission && (
          <EvaluationDialog
            open={!!selectedSubmission}
            submission={selectedSubmission}
            onClose={handleDialogClose}
            onSave={handleUpdate}
            disabled={isProcessing}
          />
        )}

        {/* Notification */}
        <Snackbar
          open={!!notification.message}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleNotificationClose}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AudioPage;