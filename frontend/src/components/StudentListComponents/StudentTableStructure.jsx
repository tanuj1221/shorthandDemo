// ShorthandDemo2025\frontend\src\components\StudentListComponents\StudentTableStructure.jsx
import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Image rendering helper components
const NoImagePlaceholder = () => (
  <Box sx={{
    width: 50,
    height: 50,
    borderRadius: '50%',
    backgroundColor: 'grey.200',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <Typography variant="caption" color="text.secondary">
      No Image
    </Typography>
  </Box>
);

const InvalidImagePlaceholder = () => (
  <Box sx={{
    width: 50,
    height: 50,
    borderRadius: '50%',
    backgroundColor: 'grey.200',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <Typography variant="caption" color="error">
      Invalid
    </Typography>
  </Box>
);

const StudentTableStructure = ({
  students = [],
  selected = [],
  loading = false,
  searchTerm = '',
  statusFilter = 'all',
  batchYearFilter = 'all',
  batchYears = [],
  onSelectAll,
  onSelect,
  onSearch,
  onStatusFilterChange,
  onBatchYearFilterChange,
  onRefresh,
  onDownloadExcel,
  onDeleteSelected,
  onDeleteConfirm,
  onDeleteCancel,
  deleteDialogOpen = false,
  filterAnchorEl = null,
  snackbar = { open: false, message: '', severity: 'success' },
  onSnackbarClose,
  onFilterMenuOpen,
  onFilterMenuClose,
  renderImage
}) => {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (studentId) => {
    setImageErrors(prev => ({ ...prev, [studentId]: true }));
  };

  // Default image renderer
  const defaultRenderImage = (student) => {
    if (!student.image || imageErrors[student.student_id]) {
      return <InvalidImagePlaceholder />;
    }

    try {
      let imageSrc = student.image;

      if (typeof student.image === 'string' && !student.image.startsWith('data:')) {
        imageSrc = `data:image/jpeg;base64,${student.image}`;
      }

      return (
        <Box
          component="img"
          src={imageSrc}
          alt={`${student.firstName} ${student.lastName}`}
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid',
            borderColor: 'divider'
          }}
          onError={() => handleImageError(student.student_id)}
        />
      );
    } catch (e) {
      return <InvalidImagePlaceholder />;
    }
  };

  const imageRenderer = renderImage || defaultRenderImage;

  // Payment status renderer
  const renderPaymentStatus = (student) => {
    const amount = student.amount || student.payment_status;
    let statusText, statusColor;
    
    if (amount === 'paid') {
      statusText = 'PAID';
      statusColor = '#4caf50'; // green
    } else if (amount === 'waiting') {
      statusText = 'WAITING';
      statusColor = '#ff9800'; // orange
    } else {
      statusText = 'UNPAID';
      statusColor = '#f44336'; // red
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: statusColor
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color: statusColor,
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
        >
          {statusText}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        margin: 'auto',
        maxWidth: '95%',
        padding: 3,
        marginTop: 5,
        position: 'relative'
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Header */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        gap: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
          STUDENTS LIST
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          <Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FilterIcon />} onClick={onFilterMenuOpen} disabled={loading}>
            Filter
          </Button>
          <Button variant="contained" color="success" onClick={onDownloadExcel} disabled={loading}>
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={onFilterMenuClose}>
        <MenuItem>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => onStatusFilterChange(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="waiting">Waiting Approval</MenuItem>
              <MenuItem value="unpaid">Unpaid</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Batch Year</InputLabel>
            <Select
              value={batchYearFilter}
              label="Batch Year"
              onChange={(e) => onBatchYearFilterChange(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All Years</MenuItem>
              {batchYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search students..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Chip
            label={`${selected.length} selected`}
            color="primary"
            onDelete={() => onSelectAll(false)}
          />
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDeleteSelected}
            disabled={loading}
          >
            Delete
          </Button>
        </Box>
      )}

      {/* Student Table - Scrollable */}
      <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < students.length}
                  checked={students.length > 0 && selected.length === students.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>First Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Last Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Password</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Expiry Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Batch Year</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Subject</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student.student_id}
                hover
                selected={selected.includes(student.student_id)}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={selected.includes(student.student_id)}
                    onChange={() => onSelect(student.student_id)}
                  />
                </TableCell>
                <TableCell>{imageRenderer(student)}</TableCell>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {student.password || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {renderPaymentStatus(student)}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {student.batchStartDate || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {student.batchEndDate || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={student.batch_year || 'N/A'} 
                    size="small" 
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>
                <TableCell>{student.subject_name || student.subjects}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Total Count */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Total Students: {students.length}
        </Typography>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={onDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the selected student(s)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDeleteCancel}>Cancel</Button>
          <Button onClick={onDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={onSnackbarClose}
      >
        <Alert
          onClose={onSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  ); 
};

export default StudentTableStructure;
