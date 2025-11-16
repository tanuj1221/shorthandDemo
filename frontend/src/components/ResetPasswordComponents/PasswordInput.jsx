// src/components/PasswordInput.jsx

import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const PasswordInput = ({ value, onChange, onToggle, show }) => (
  <TextField
    fullWidth
    label="New Password"
    name="newPassword"
    type={show ? 'text' : 'password'}
    value={value}
    onChange={onChange}
    margin="normal"
    variant="outlined"
    required
    autoComplete="new-password"
    sx={{ mb: 2 }}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={onToggle}
            edge="end"
          >
            {show ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
);

export default PasswordInput;

