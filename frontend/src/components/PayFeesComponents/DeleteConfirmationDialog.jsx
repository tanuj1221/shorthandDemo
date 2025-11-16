// frontend\src\components\PayFeesComponents\DeleteConfirmationDialog.jsx

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export const DeleteConfirmationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  selectedCount 
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete {selectedCount} student(s)? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" autoFocus>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);