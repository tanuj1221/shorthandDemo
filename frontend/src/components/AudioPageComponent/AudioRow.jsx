// frontend/src/components/AudioPageComponent/AudioRow.jsx
import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Box,
  Avatar,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  Check,
  Delete,
  Person,
  School,
  Subject,
} from '@mui/icons-material';
import StatusChip from './StatusChip';
import AudioPlayer from './AudioPlayer';

const AudioRow = ({ 
  submission, 
  onSelect,
  onDelete,
  disabled = false 
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullAnswer, setShowFullAnswer] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await onDelete(submission.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <TableRow
        sx={{
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <TableCell sx={{ minWidth: 300 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {submission.link && (
              <Box sx={{ width: '100%' }}>
                <AudioPlayer audioUrl={submission.link} />
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Evaluate">
                <span>
                  <IconButton 
                    onClick={() => onSelect(submission)}
                    disabled={disabled}
                  >
                    <Check color={submission.status === 'approved' ? 'success' : 'inherit'} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Delete">
                <span>
                  <IconButton 
                    onClick={handleDeleteClick}
                    disabled={disabled}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
              <School fontSize="small" />
            </Avatar>
            <Typography>{submission.instituteId}</Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 24, height: 24 }}>
              <Subject fontSize="small" />
            </Avatar>
            <Typography>{submission.subjectId}</Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }}>
              <Person fontSize="small" />
            </Avatar>
            <Typography>{submission.recorded_by}</Typography>
          </Box>
        </TableCell>

        <TableCell>
          <StatusChip status={submission.status} />
        </TableCell>

        <TableCell>
          <Typography>
            {formatDate(submission.created_at)}
          </Typography>
        </TableCell>

        <TableCell>
          <Box sx={{ maxWidth: 300 }}>
            <Typography>
              {truncateText(submission.answer, 100)}
              {submission.answer?.length > 100 && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setShowFullAnswer(true)}
                  sx={{ ml: 1 }}
                >
                  Read More
                </Link>
              )}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>

      <Dialog
        open={showFullAnswer}
        onClose={() => setShowFullAnswer(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Full Answer</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            {submission.answer}
          </Typography>
          {submission.remark && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                Remarks:
              </Typography>
              <Typography>
                {submission.remark}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFullAnswer(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this audio submission? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AudioRow;