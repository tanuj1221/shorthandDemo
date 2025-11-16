// src/utils/snackbarUtils.js

export const showSnackbar = (setSnackbar) => (message, severity = 'success') => {
  setSnackbar({ open: true, message, severity });
};

export const closeSnackbar = (setSnackbar) => () => {
  setSnackbar((prev) => ({ ...prev, open: false }));
};