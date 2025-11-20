// frontend/src/pages/Storage.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Tooltip,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import {
  Folder as FolderIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  ContentCopy as CopyIcon,
  ArrowBack as BackIcon,
  SelectAll as SelectAllIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Storage = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedFileLink, setSelectedFileLink] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStorage();
  }, []);

  const fetchStorage = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://www.shorthandexam.in/api/storage/structure', {
        withCredentials: true
      });
      setFolders(response.data.data);
    } catch (err) {
      showSnackbar('Failed to load storage', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showSnackbar('Folder name is required', 'error');
      return;
    }

    try {
      await axios.post('https://www.shorthandexam.in/api/storage/folder', {
        folderName: newFolderName,
        description: newFolderDesc
      }, { withCredentials: true });

      showSnackbar('Folder created successfully', 'success');
      setCreateFolderOpen(false);
      setNewFolderName('');
      setNewFolderDesc('');
      fetchStorage();
    } catch (err) {
      showSnackbar('Failed to create folder', 'error');
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    if (!currentFolder) return;

    const formData = new FormData();
    formData.append('folderId', currentFolder.id);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      setUploading(true);
      await axios.post('https://www.shorthandexam.in/api/storage/upload', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showSnackbar(`${files.length} file(s) uploaded successfully`, 'success');
      fetchStorage();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      showSnackbar('Failed to upload files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await uploadFiles(files);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Delete this folder and all its files?')) return;

    try {
      await axios.delete(`https://www.shorthandexam.in/api/storage/folder/${folderId}`, {
        withCredentials: true
      });
      showSnackbar('Folder deleted successfully', 'success');
      setCurrentFolder(null);
      fetchStorage();
    } catch (err) {
      showSnackbar('Failed to delete folder', 'error');
    }
  };

  const handleDeleteSelectedFiles = async () => {
    if (selectedFileIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedFileIds.length} selected file(s)?`)) return;

    try {
      for (const fileId of selectedFileIds) {
        await axios.delete(`https://www.shorthandexam.in/api/storage/file/${fileId}`, {
          withCredentials: true
        });
      }
      showSnackbar(`${selectedFileIds.length} file(s) deleted successfully`, 'success');
      setSelectedFileIds([]);
      fetchStorage();
    } catch (err) {
      showSnackbar('Failed to delete files', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Link copied to clipboard', 'success');
  };

  const showLinkDialog = (fileUrl) => {
    setSelectedFileLink(fileUrl);
    setLinkDialogOpen(true);
  };

  const getCleanPath = (fileUrl) => {
    // Extract just the path part after the domain
    try {
      const url = new URL(fileUrl);
      return url.pathname;
    } catch {
      return fileUrl;
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSelectAll = () => {
    if (!currentFolder) return;
    if (selectedFileIds.length === currentFolder.files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(currentFolder.files.map(f => f.id));
    }
  };

  const handleFileCheckbox = (fileId) => {
    setSelectedFileIds(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Folder List View
  if (!currentFolder) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            📁 File Storage
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateFolderOpen(true)}
          >
            Create Folder
          </Button>
        </Box>

        {folders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <FolderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No folders yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first folder to start organizing files
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setCreateFolderOpen(true)}
            >
              Create Folder
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => setCurrentFolder(folder)}
                >
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <FolderIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" noWrap>
                      {folder.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {folder.files?.length || 0} files
                    </Typography>
                    {folder.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {folder.description}
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Folder Dialog */}
        <Dialog open={createFolderOpen} onClose={() => setCreateFolderOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              fullWidth
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={newFolderDesc}
              onChange={(e) => setNewFolderDesc(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Folder Content View
  const files = currentFolder.files || [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="h6"
          onClick={() => setCurrentFolder(null)}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
        >
          <HomeIcon fontSize="small" />
          Storage
        </Link>
        <Typography variant="h6" color="text.primary">
          {currentFolder.name}
        </Typography>
      </Breadcrumbs>

      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => setCurrentFolder(null)}
          >
            Back
          </Button>
          {files.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={<SelectAllIcon />}
                onClick={handleSelectAll}
              >
                {selectedFileIds.length === files.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedFileIds.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelectedFiles}
                >
                  Delete Selected ({selectedFileIds.length})
                </Button>
              )}
            </>
          )}
        </Box>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleDeleteFolder(currentFolder.id)}
        >
          Delete Folder
        </Button>
      </Box>

      {/* Drag & Drop Upload Area */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <Box>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Uploading files...</Typography>
          </Box>
        ) : (
          <Box>
            <UploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop files here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse files
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Maximum file size: 50MB
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Files Table */}
      {files.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FileIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No files in this folder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload files using the area above
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedFileIds.length === files.length}
                    indeterminate={selectedFileIds.length > 0 && selectedFileIds.length < files.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow
                  key={file.id}
                  hover
                  selected={selectedFileIds.includes(file.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => handleFileCheckbox(file.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileIcon color="action" />
                      <Typography>{file.original_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatFileSize(file.file_size)}</TableCell>
                  <TableCell>{formatDate(file.uploaded_at)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View & Copy Link">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => showLinkDialog(file.file_url)}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Link Preview Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>File Link</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Full URL:
          </Typography>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100', wordBreak: 'break-all' }}>
            <Typography variant="body2" fontFamily="monospace">
              {selectedFileLink}
            </Typography>
          </Paper>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Clean Path (for easy reference):
          </Typography>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100', wordBreak: 'break-all' }}>
            <Typography variant="body2" fontFamily="monospace" color="primary">
              {getCleanPath(selectedFileLink)}
            </Typography>
          </Paper>

          <Typography variant="caption" color="text.secondary">
            💡 Tip: The filename is preserved as uploaded (spaces replaced with underscores).
            You can easily construct links like: /storage/folder_1/myfile.pdf
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={() => {
              copyToClipboard(selectedFileLink);
              setLinkDialogOpen(false);
            }}
          >
            Copy Full URL
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Storage;
