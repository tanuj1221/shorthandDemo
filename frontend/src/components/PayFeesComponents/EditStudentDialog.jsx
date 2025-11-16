// frontend\src\components\PayFeesComponents\EditStudentDialog.jsx

import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  IconButton,
  Typography,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const EditStudentDialog = ({ 
  open, 
  onClose, 
  student, 
  onSave,
  onImageChange,
  onRemoveImage
}) => {
  const [formData, setFormData] = React.useState(student || {});

  React.useEffect(() => {
    setFormData(student || {});
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit Student
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Middle Name"
            name="middleName"
            value={formData.middleName || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Mother's Name"
            name="motherName"
            value={formData.motherName || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Batch Year"
            name="batchYear"
            value={formData.batchYear || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Subjects"
            name="subjects"
            value={formData.subjects || ''}
            onChange={handleChange}
            fullWidth
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Upload Photo (20-50 KB size)</Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="student-image-upload"
              type="file"
              onChange={onImageChange}
            />
            <label htmlFor="student-image-upload">
              <Button variant="outlined" component="span">
                Upload Photo
              </Button>
            </label>
            
            {formData.image && (
              <>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={formData.image.startsWith('data:image') ? formData.image : `data:image/jpeg;base64,${formData.image}`}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Typography variant="body2">Preview</Typography>
                </Box>
                <Button
                  color="error"
                  onClick={onRemoveImage}
                  sx={{ mt: 1 }}
                >
                  Remove Image
                </Button>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};