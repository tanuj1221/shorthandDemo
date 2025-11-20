// src/ResetPassword.jsx

import React from "react";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Box } from "@mui/material";

// Components
import ResetPasswordHeader from "../components/ResetPasswordComponents/ResetPasswordHeader";
import PasswordInfoBox from "../components/ResetPasswordComponents/PasswordInfoBox";
import InstituteIdInput from "../components/ResetPasswordComponents/InstituteIdInput";
import PasswordInput from "../components/ResetPasswordComponents/PasswordInput";
import ConfirmPasswordInput from "../components/ResetPasswordComponents/ConfirmPasswordInput";
import SubmitButton from "../components/ResetPasswordComponents/SubmitButton";

// Utils
import { showSnackbar, closeSnackbar } from "../utils/snackbarUtils";

const ResetPassword = () => {
  const [formData, setFormData] = React.useState({
    instituteId: "",
    newPassword: "",
    confirmPassword: "",
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClickShowPassword = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.instituteId) {
      showSnackbar(setSnackbar)("Please enter your institute ID", "error");
      return;
    }

    if (!formData.newPassword) {
      showSnackbar(setSnackbar)("Please enter a new password", "error");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showSnackbar(setSnackbar)("Passwords do not match", "error");
      return;
    }

    if (
      formData.newPassword.length !== 4 ||
      !/^\d+$/.test(formData.newPassword)
    ) {
      showSnackbar(setSnackbar)("Password must be exactly 4 digits", "error");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add auth token if needed
        },
        body: JSON.stringify({
          instituteId: formData.instituteId,
          newPassword: formData.newPassword,
        }),
        credentials: "include", // Include cookies if using session-based auth
      });

      // First check if the response is OK
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to reset password");
      }

      // If response is OK, try to parse as JSON
      const data = await response.json();

      showSnackbar(setSnackbar)(
        data.message || "Password reset successfully!",
        "success"
      );

      // Reset form
      setFormData({
        instituteId: "",
        newPassword: "",
        confirmPassword: "",
        showNewPassword: false,
        showConfirmPassword: false,
      });
    } catch (error) {
      console.error("Password reset error:", error);
      showSnackbar(setSnackbar)(
        error.message.startsWith("Not authenticated")
          ? "Please login first"
          : error.message || "Failed to reset password",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        margin: "auto",
        maxWidth: 600,
        padding: 4,
        marginTop: 5,
        position: "relative",
      }}
    >
      {/* Header */}
      <ResetPasswordHeader />

      {/* Info Box */}
      <PasswordInfoBox />

      {/* Reset Password Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Institute ID Field */}
        <InstituteIdInput
          value={formData.instituteId}
          onChange={handleChange}
        />

        {/* New Password Field */}
        <PasswordInput
          value={formData.newPassword}
          onChange={handleChange}
          onToggle={() => handleClickShowPassword("showNewPassword")}
          show={formData.showNewPassword}
        />

        {/* Confirm Password Field */}
        <ConfirmPasswordInput
          value={formData.confirmPassword}
          onChange={handleChange}
          onToggle={() => handleClickShowPassword("showConfirmPassword")}
          show={formData.showConfirmPassword}
        />

        <Divider sx={{ my: 3 }} />

        {/* Submit Button */}
        <SubmitButton onClick={handleSubmit} loading={isLoading} />
      </Box>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar(setSnackbar)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar(setSnackbar)}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ResetPassword;
