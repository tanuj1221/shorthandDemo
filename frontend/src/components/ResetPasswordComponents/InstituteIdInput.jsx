// src/components/ResetPasswordComponents/InstituteIdInput.jsx
import React from 'react';
import { TextField } from '@mui/material';

const InstituteIdInput = ({ value, onChange }) => (
  <TextField
    fullWidth
    label="Institute ID"
    name="instituteId"
    type="text"
    value={value}
    onChange={onChange}
    margin="normal"
    variant="outlined"
    required
    autoComplete="username"
    sx={{ mb: 2 }}
  />
);

export default InstituteIdInput;

