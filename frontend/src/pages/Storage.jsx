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
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';

// Recursive component to render folder tree
const FolderTreeView = ({ 
  tree, 
  expandedFolders, 
  toggleFolder, 
  selectedFileIds, 
  handleFileCheckbox, 
  showLinkDialog, 
  formatFileSize, 
  formatDate,
  basePath,
  level = 0 
}) => {
  const indent = level * 24;
  
  return (
    <Box>
      {/* Render root files first */}
      {tree.files.map((file) => (
        <Box
          key={file.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1,
            px: 2,
            pl: indent + 2,
            '&:hover': { bgcolor: 'action.hover' },
            borderRadius: 1,
            mb: 0.5
          }}
        >
          <Checkbox
            size="small"
            checked={selectedFileIds.includes(file.id)}
            onChange={() => handleFileCheckbox(file.id)}
            sx={{ mr: 1 }}
          />
          <FileIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {file.original_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
            </Typography>
          </Box>
          <Tooltip title="View & Copy Link">
            <IconButton
              size="small"
              color="primary"
              onClick={() => showLinkDialog(file.file_url)}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ))}
      
      {/* Render subfolders */}
      {Object.keys(tree.folders).sort().map((folderName) => {
        const folderPath = basePath ? `${basePath}/${folderName}` : folderName;
        const isExpanded = expandedFolders[folderPath];
        const subTree = tree.folders[folderName];
        const fileCount = countFiles(subTree);
        
        return (
          <Box key={folderPath}>
            {/* Folder header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 1,
                px: 2,
                pl: indent + 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                borderRadius: 1,
                mb: 0.5
              }}
              onClick={() => toggleFolder(folderPath)}
            >
              {isExpanded ? (
                <ExpandMoreIcon sx={{ fontSize: 20, mr: 0.5, color: 'text.secondary' }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 20, mr: 0.5, color: 'text.secondary' }} />
              )}
              {isExpanded ? (
                <FolderOpenIcon sx={{ fontSize: 20, color: 'warning.main', mr: 1 }} />
              ) : (
                <FolderIcon sx={{ fontSize: 20, color: 'warning.main', mr: 1 }} />
              )}
              <Typography variant="body2" fontWeight="medium" sx={{ flex: 1 }}>
                {folderName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fileCount} {fileCount === 1 ? 'file' : 'files'}
              </Typography>
            </Box>
            
            {/* Folder contents (when expanded) */}
            {isExpanded && (
              <FolderTreeView
                tree={subTree}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                selectedFileIds={selectedFileIds}
                handleFileCheckbox={handleFileCheckbox}
                showLinkDialog={showLinkDialog}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
                basePath={folderPath}
                level={level + 1}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

// Helper function to count total files in a tree
const countFiles = (tree) => {
  let count = tree.files.length;
  Object.values(tree.folders).forEach(subTree => {
    count += countFiles(subTree);
  });
  return count;
};

// Helper function to get all folder paths recursively
const getAllFolderPaths = (folders, basePath = '') => {
  let paths = [];
  Object.keys(folders).forEach(folderName => {
    const folderPath = basePath ? `${basePath}/${folderName}` : folderName;
    paths.push(folderPath);
    const subPaths = getAllFolderPaths(folders[folderName].folders, folderPath);
    paths = paths.concat(subPaths);
  });
  return paths;
};

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
  const [expandedFolders, setExpandedFolders] = useState({});
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

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

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      await uploadFiles(files, true);
    }
  };

  const uploadFiles = async (files, isFolder = false) => {
    if (!currentFolder) return;

    const formData = new FormData();
    formData.append('folderId', currentFolder.id);
    
    if (isFolder) {
      // For folder uploads, preserve directory structure
      files.forEach(file => {
        // Get relative path from webkitRelativePath
        const relativePath = file.webkitRelativePath;
        if (relativePath) {
          // Extract directory path (remove filename)
          const pathParts = relativePath.split('/');
          pathParts.pop(); // Remove filename
          const dirPath = pathParts.slice(1).join('/'); // Remove root folder name
          
          // Use fieldname to indicate subfolder
          const fieldName = dirPath ? `files-${dirPath}` : 'files';
          formData.append(fieldName, file);
        } else {
          formData.append('files', file);
        }
      });
    } else {
      // Regular file upload
      files.forEach(file => {
        formData.append('files', file);
      });
    }

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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateFolderOpen(true)}
            >
              Create Folder
            </Button>
          </Box>
        </Box>

        {/* Info Box */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
          <Typography variant="body2" color="info.dark">
            💡 <strong>Tip:</strong> Click on a folder to open it, then you can upload files or entire folders (like .NET publish folders) with preserved directory structure.
          </Typography>
        </Paper>

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
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={folder.id}>
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
  
  // Build folder tree structure from files
  const buildFolderTree = (files) => {
    const tree = { folders: {}, files: [] };
    
    files.forEach(file => {
      if (!file.file_path || file.file_path.trim() === '') {
        // Root level file
        tree.files.push(file);
      } else {
        // File in subfolder
        const pathParts = file.file_path.split('/').filter(p => p.trim() !== '');
        let currentLevel = tree.folders;
        
        // Build nested folder structure
        pathParts.forEach((part, index) => {
          if (!currentLevel[part]) {
            currentLevel[part] = { folders: {}, files: [] };
          }
          
          // If this is the last part, add the file
          if (index === pathParts.length - 1) {
            currentLevel[part].files.push(file);
          } else {
            currentLevel = currentLevel[part].folders;
          }
        });
      }
    });
    
    return tree;
  };
  
  const folderTree = buildFolderTree(files);
  
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

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
              {Object.keys(folderTree.folders).length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    const allFolderPaths = getAllFolderPaths(folderTree.folders);
                    const allExpanded = allFolderPaths.every(path => expandedFolders[path]);
                    if (allExpanded) {
                      setExpandedFolders({});
                    } else {
                      const expanded = {};
                      allFolderPaths.forEach(path => expanded[path] = true);
                      setExpandedFolders(expanded);
                    }
                  }}
                >
                  {Object.values(expandedFolders).some(v => v) ? 'Collapse All' : 'Expand All'}
                </Button>
              )}
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

      {/* Upload Options */}
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        📤 Upload Options
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'grey.300',
              bgcolor: dragActive ? 'action.hover' : 'background.paper',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
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
                <Typography>Uploading...</Typography>
              </Box>
            ) : (
              <Box>
                <FileIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag & drop or click to browse
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              border: '2px dashed',
              borderColor: 'secondary.main',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'secondary.dark', bgcolor: 'action.hover' }
            }}
            onClick={() => folderInputRef.current?.click()}
          >
            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: '', directory: '' })}
              multiple
              onChange={handleFolderSelect}
              style={{ display: 'none' }}
            />
            <FolderIcon sx={{ fontSize: 50, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Upload Folder
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload entire folder with structure
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Perfect for .NET publish folders
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Files Tree View */}
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
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, px: 1 }}>
            📂 Folder Contents
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {/* Render folder tree */}
          <FolderTreeView 
            tree={folderTree}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            selectedFileIds={selectedFileIds}
            handleFileCheckbox={handleFileCheckbox}
            showLinkDialog={showLinkDialog}
            formatFileSize={formatFileSize}
            formatDate={formatDate}
            basePath=""
          />
        </Paper>
      )}

      {/* Link Preview Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>📎 File Link</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Full URL:
          </Typography>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100', wordBreak: 'break-all', position: 'relative' }}>
            <Typography variant="body2" fontFamily="monospace">
              {selectedFileLink}
            </Typography>
            <IconButton
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={() => copyToClipboard(selectedFileLink)}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Paper>

          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Clean Path:
          </Typography>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50', wordBreak: 'break-all', position: 'relative' }}>
            <Typography variant="body2" fontFamily="monospace" color="primary.main" sx={{ fontWeight: 'bold' }}>
              {getCleanPath(selectedFileLink)}
            </Typography>
            <IconButton
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={() => copyToClipboard(getCleanPath(selectedFileLink))}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Paper>

          <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.light' }}>
            <Typography variant="caption" color="info.dark">
              💡 <strong>Tip:</strong> Filenames are sanitized for URLs (spaces → underscores, special chars removed).
              You can manually construct links like: <code>/storage/folder_1/my_file.pdf</code>
            </Typography>
          </Box>
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
