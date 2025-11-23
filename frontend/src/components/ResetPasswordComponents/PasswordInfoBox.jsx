// src/components/PasswordInfoBox.jsx

import React from "react";
import { Box, Typography } from "@mui/material";

const PasswordInfoBox = () => (
  <Box
    sx={{
      backgroundColor: "grey.100",
      p: 3,
      mb: 3,
      borderRadius: 1,
      textAlign: "center",
    }}
  >
    <Typography variant="body1" gutterBottom>
      Password must be 4-8 alphanumeric characters (letters and numbers)
    </Typography>
    <Typography variant="body1">
      Make sure your new password is strong and unique
    </Typography>
  </Box>
);

export default PasswordInfoBox;
