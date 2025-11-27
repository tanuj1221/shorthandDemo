// frontend/src/pages/DownloadClient.jsx
import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Computer as ComputerIcon,
  Wifi as WifiIcon,
  Storage as StorageIcon,
  Headphones as HeadphonesIcon,
  Monitor as MonitorIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';

const DownloadClient = () => {
  const downloadClientUrl = 'https://dev.shorthandexam.in/storage/exe/Shorthand%20Demo%20Nov%2025.exe';
  const rustDeskUrl = 'https://github.com/rustdesk/rustdesk/releases/download/1.4.4/rustdesk-1.4.4-x86_64.exe';
  const anyDeskUrl = 'https://download.anydesk.com/AnyDesk.exe';
  const ultraViewerUrl = 'https://www.ultraviewer.net/en/download.html';

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            Shorthand Demo Client – Download
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Download and install the Shorthand Demo Client to get started
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* System Requirements Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1.5 }}>
            <CheckIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main', fontSize: '1.2rem' }} />
            System Requirements
          </Typography>

          <Grid container spacing={2}>
            {/* Compact Requirements */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WifiIcon sx={{ mr: 0.5, color: 'primary.main', fontSize: '1rem' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Internet</Typography>
                  </Box>
                  <Typography variant="caption" display="block">• 50 Mbps (single PC)</Typography>
                  <Typography variant="caption" display="block">• 100 Mbps (multi-PC)</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ComputerIcon sx={{ mr: 0.5, color: 'primary.main', fontSize: '1rem' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Hardware</Typography>
                  </Box>
                  <Typography variant="caption" display="block">• 10 GB free space</Typography>
                  <Typography variant="caption" display="block">• Headphones required</Typography>
                  <Typography variant="caption" display="block">• 1280×768 display</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ComputerIcon sx={{ mr: 0.5, color: 'primary.main', fontSize: '1rem' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>OS</Typography>
                  </Box>
                  <Typography variant="caption" display="block" color="success.main">✓ Windows 10/11</Typography>
                  <Typography variant="caption" display="block" color="error.main">✗ Windows 7</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Download Section */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
            <DownloadIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main', fontSize: '1.2rem' }} />
            Download Shorthand Demo Client
          </Typography>
          <Button
            variant="contained"
            size="medium"
            startIcon={<DownloadIcon />}
            href={downloadClientUrl}
            sx={{
              py: 1.5,
              px: 3,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              },
            }}
          >
            Download Client
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Remote Support Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
            <SupportIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main', fontSize: '1.2rem' }} />
            Remote Support Tools
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            Install any one tool below for remote assistance. Share your ID & Password with support.
          </Typography>

          <Grid container spacing={2}>
            {/* RustDesk */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    RustDesk
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<DownloadIcon fontSize="small" />}
                    href={rustDeskUrl}
                    download
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* AnyDesk */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    AnyDesk
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<DownloadIcon fontSize="small" />}
                    href={anyDeskUrl}
                    download
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* UltraViewer */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    UltraViewer
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<DownloadIcon fontSize="small" />}
                    href={ultraViewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>


      </Paper>
    </Container>
  );
};

export default DownloadClient;
