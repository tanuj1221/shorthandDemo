// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import DeleteIcon from '@mui/icons-material/Delete';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   CircularProgress,
//   Box,
//   TablePagination,
//   Button,
//   TextField,
//   Snackbar,
//   Alert,
//   IconButton,
//   Tooltip,
//   Dialog,
//   DialogContent
// } from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import SaveIcon from '@mui/icons-material/Save';
// import CancelIcon from '@mui/icons-material/Cancel';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import ZoomInIcon from '@mui/icons-material/ZoomIn';
// import AddIcon from '@mui/icons-material/Add';
// import DialogTitle from '@mui/material/DialogTitle';
// import DialogActions from '@mui/material/DialogActions';
// import { SearchBar } from '../PayFeesComponents/SearchBar';
// import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// export default function DataTable({ tableName }) {
//   // State management
//   const [tableData, setTableData] = useState([]);
//   const [originalData, setOriginalData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [editingId, setEditingId] = useState(null);
//   const [editedData, setEditedData] = useState({});
//   const [hasChanges, setHasChanges] = useState(false);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [columnTypes, setColumnTypes] = useState({});
//   const [imagePreview, setImagePreview] = useState({
//     open: false,
//     src: ''
//   });
//   const [searchTerm, setSearchTerm] = useState('');

//   const [addDialogOpen, setAddDialogOpen] = useState(false);
//   const [newRecord, setNewRecord] = useState({});
//   const [addErrors, setAddErrors] = useState({});

//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [recordToDelete, setRecordToDelete] = useState(null);

//   const [fileInputKey, setFileInputKey] = useState(Date.now());
//   const [currentImageField, setCurrentImageField] = useState(null);

//   const MAX_IMAGE_SIZE = 50 * 1024; // 50KB in bytes

//   // Fetch table data
//   useEffect(() => {
//     fetchTableData();
//   }, [tableName]);

//   // Search functionality
//   useEffect(() => {
//     if (searchTerm) {
//       const lowercasedSearch = searchTerm.toLowerCase();
//       const filteredData = originalData.filter(row =>
//         Object.values(row).some(
//           value => value &&
//             value.toString().toLowerCase().includes(lowercasedSearch)
//         ));
//       setTableData(filteredData);
//       setPage(0);
//     } else {
//       setTableData([...originalData]);
//     }
//   }, [searchTerm, originalData]);

//   const fetchTableData = async () => {
//     try {
//       setLoading(true);
//       setEditingId(null);
//       setEditedData({});
//       setHasChanges(false);
//       setSearchTerm('');

//       const response = await axios.get(`https://www.shorthandexam.in/table/${tableName}`, {
//         headers: {
//           Authorization: 'Bearer dummy-token'
//         }
//       });

//       const data = response.data?.data ?? response.data ?? [];
//       const dataWithIds = data.map((row, index) => ({
//         ...row,
//         _temp_id: row.id || index
//       }));

//       setTableData(dataWithIds);
//       setOriginalData(JSON.parse(JSON.stringify(dataWithIds)));

//       // Infer column types from first row
//       if (dataWithIds.length > 0) {
//         const types = {};
//         Object.entries(dataWithIds[0]).forEach(([key, value]) => {
//           if (key === '_temp_id') return;
//           types[key] = typeof value;
//           // Special handling for image columns
//           if (typeof value === 'string' && (value.startsWith('data:image/') ||
//             value.startsWith('/9j/') || value.startsWith('iVBORw'))) {
//             types[key] = 'image';
//           }
//         });
//         setColumnTypes(types);
//       }

//       setError('');
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       setError('Failed to fetch table data: ' + errorMessage);
//       showSnackbar('Failed to fetch table data: ' + errorMessage, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Add record functionality
//   const handleAddFieldChange = (field, value) => {
//     setNewRecord(prev => ({
//       ...prev,
//       [field]: value === '' ? null : value
//     }));
//     setAddErrors(prev => ({ ...prev, [field]: '' }));
//   };

//   const handleAddRecord = async () => {
//     try {
//       setIsSubmitting(true);

//       // Validate required fields
//       const errors = {};
//       const columns = tableData.length > 0 ?
//         Object.keys(tableData[0]).filter(key => key !== '_temp_id') :
//         [];

//       columns.forEach(col => {
//         if (newRecord[col] === undefined || newRecord[col] === null || newRecord[col] === '') {
//           errors[col] = 'This field is required';
//         }
//       });

//       setAddErrors(errors);
//       if (Object.keys(errors).length > 0) {
//         showSnackbar('Please fill all required fields', 'error');
//         return;
//       }

//       const response = await axios.post(
//         `https://www.shorthandexam.in/table/${tableName}/add`,
//         newRecord,
//         {
//           headers: {
//             Authorization: 'Bearer dummy-token',
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         showSnackbar('Record added successfully!');
//         setAddDialogOpen(false);
//         setNewRecord({});
//         await fetchTableData();
//       } else {
//         showSnackbar(response.data.message || 'Failed to add record', 'error');
//       }
//     } catch (error) {
//       showSnackbar(error.response?.data?.message || 'Failed to add record', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };


//   // Modify the handleImageUpload function
//   const handleImageUpload = (field, event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     // Check file size
//     if (file.size > MAX_IMAGE_SIZE) {
//       showSnackbar(`Image size must be less than 50KB. Current size: ${(file.size / 1024).toFixed(2)}KB`, 'error');
//       setFileInputKey(Date.now()); // Reset the file input
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const base64String = e.target.result;
//       if (addDialogOpen) {
//         handleAddFieldChange(field, base64String);
//       } else {
//         handleFieldChange(field, base64String);
//       }
//       setFileInputKey(Date.now());
//     };
//     reader.readAsDataURL(file);
//   };


//   // Modify the renderImageUploadField function to show size limit
//   const renderImageUploadField = (column) => {
//     return (
//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//         {newRecord[column] && (
//           <img
//             src={newRecord[column]}
//             alt="Preview"
//             style={{
//               maxWidth: '100px',
//               maxHeight: '100px',
//               borderRadius: '4px'
//             }}
//           />
//         )}
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//           <Button
//             variant="outlined"
//             component="label"
//             sx={{ mt: 1 }}
//           >
//             Upload Image
//             <input
//               key={fileInputKey}
//               type="file"
//               hidden
//               accept="image/*"
//               onChange={(e) => handleImageUpload(column, e)}
//             />
//           </Button>
//           <Typography variant="caption" color="textSecondary">
//             Maximum image size: 50KB
//           </Typography>
//         </Box>
//         <Button
//           variant="outlined"
//           color="error"
//           onClick={() => {
//             if (addDialogOpen) {
//               handleAddFieldChange(column, null);
//             } else {
//               handleFieldChange(column, null);
//             }
//           }}
//           disabled={!newRecord[column]}
//           sx={{ mt: 1 }}
//         >
//           Remove Image
//         </Button>
//       </Box>
//     );
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({
//       open: true,
//       message,
//       severity
//     });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };




//   // // Format base64 image string
//   // const formatBase64Image = (base64String) => {
//   //   if (!base64String) return null;

//   //   if (base64String.startsWith('data:image/')) {
//   //     return base64String;
//   //   }

//   //   let mimeType = 'image/jpeg';
//   //   if (base64String.startsWith('iVBORw')) {
//   //     mimeType = 'image/png';
//   //   } else if (base64String.startsWith('R0lGOD')) {
//   //     mimeType = 'image/gif';
//   //   }

//   //   return `data:${mimeType};base64,${base64String}`;
//   // };

//   // // Render cell content based on type
//   // const renderCellContent = (column, value) => {
//   //   if (value === null || value === undefined) {
//   //     return <span style={{ color: '#999', fontStyle: 'italic' }}>NULL</span>;
//   //   }

//   //   if (columnTypes[column] === 'image' ||
//   //     (typeof value === 'string' && (value.startsWith('data:image/') ||
//   //       value.startsWith('/9j/') || value.startsWith('iVBORw')))) {
//   //     const formattedImage = formatBase64Image(value);
//   //     if (!formattedImage) return 'Invalid image';

//   //     return (
//   //       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//   //         <img
//   //           src={formattedImage}
//   //           alt={`${column} preview`}
//   //           style={{
//   //             maxWidth: '50px',
//   //             maxHeight: '50px',
//   //             borderRadius: '4px',
//   //             objectFit: 'contain',
//   //             cursor: 'pointer'
//   //           }}
//   //           onClick={() => setImagePreview({
//   //             open: true,
//   //             src: formattedImage
//   //           })}
//   //           onError={(e) => {
//   //             e.target.style.display = 'none';
//   //           }}
//   //         />
//   //         <IconButton
//   //           size="small"
//   //           onClick={() => setImagePreview({
//   //             open: true,
//   //             src: formattedImage
//   //           })}
//   //         >
//   //           <ZoomInIcon fontSize="small" />
//   //         </IconButton>
//   //       </Box>
//   //     );
//   //   }

//   //   return String(value);
//   // };


//   const formatBase64Image = (base64String) => {
//   // Handle empty/undefined input
//   if (!base64String || typeof base64String !== 'string') {
//     return null;
//   }

//   // Check if already properly formatted
//   if (base64String.startsWith('data:image/')) {
//     // Validate existing data URL structure
//     const dataUrlRegex = /^data:image\/(\w+);base64,([A-Za-z0-9+/]+={0,2})$/;
//     if (dataUrlRegex.test(base64String)) {
//       return base64String;
//     }
//     return null;
//   }

//   // Determine MIME type based on common patterns
//   let mimeType = 'image/jpeg';
//   if (base64String.startsWith('iVBORw0KGgo')) { // PNG
//     mimeType = 'image/png';
//   } else if (base64String.startsWith('R0lGODdh') || base64String.startsWith('R0lGODlh')) { // GIF
//     mimeType = 'image/gif';
//   } else if (base64String.startsWith('/9j/')) { // JPEG
//     mimeType = 'image/jpeg';
//   } else if (base64String.startsWith('UklGR')) { // WebP
//     mimeType = 'image/webp';
//   }

//   // Validate base64 content
//   const base64Content = base64String.split(',')[1] || base64String;
//   const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
  
//   if (!base64Regex.test(base64Content)) {
//     console.warn('Invalid base64 image data');
//     return null;
//   }

//   return `data:${mimeType};base64,${base64Content}`;
// };

// /**
//  * Renders table cell content with proper type handling and error boundaries
//  * @param {string} column - Column name
//  * @param {any} value - Cell value
//  * @returns {JSX.Element|string} - Rendered cell content
//  */
// const renderCellContent = (column, value) => {
//   // Handle null/undefined values
//   if (value === null || value === undefined) {
//     return (
//       <span style={{ color: '#999', fontStyle: 'italic' }}>
//         NULL
//       </span>
//     );
//   }

//   // Handle image content
//   const isImageColumn = columnTypes[column] === 'image';
//   const isImageString = typeof value === 'string' && (
//     value.startsWith('data:image/') ||
//     value.startsWith('/9j/') ||
//     value.startsWith('iVBORw') ||
//     value.startsWith('R0lGOD') ||
//     value.startsWith('UklGR')
//   );

//   if (isImageColumn || isImageString) {
//     const formattedImage = formatBase64Image(value);
    
//     if (!formattedImage) {
//       return (
//         <Box sx={{ 
//           display: 'flex',
//           alignItems: 'center',
//           gap: 1,
//           color: 'error.main',
//           fontSize: '0.75rem'
//         }}>
//           <ErrorOutlineIcon fontSize="small" />
//           Invalid Image
//         </Box>
//       );
//     }

//     return (
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//         <Tooltip title="Click to enlarge">
//           <img
//             src={formattedImage}
//             alt={`${column} preview`}
//             style={{
//               maxWidth: '50px',
//               maxHeight: '50px',
//               borderRadius: '4px',
//               objectFit: 'contain',
//               cursor: 'pointer',
//               backgroundColor: '#f5f5f5'
//             }}
//             onClick={() => setImagePreview({
//               open: true,
//               src: formattedImage
//             })}
//             onError={(e) => {
//               e.target.style.display = 'none';
//               e.target.nextElementSibling.style.display = 'flex';
//             }}
//           />
//         </Tooltip>
//         <Box 
//           sx={{ 
//             display: 'none',
//             alignItems: 'center',
//             gap: 0.5,
//             color: 'error.main',
//             fontSize: '0.75rem'
//           }}
//         >
//           <ErrorOutlineIcon fontSize="small" />
//           Failed to load
//         </Box>
//         <IconButton
//           size="small"
//           onClick={() => setImagePreview({
//             open: true,
//             src: formattedImage
//           })}
//           sx={{ ml: 0.5 }}
//         >
//           <ZoomInIcon fontSize="small" />
//         </IconButton>
//       </Box>
//     );
//   }

//   // Handle other types
//   return String(value);
// };




//   // Render input field for add dialog
//   const renderAddInputField = (column) => {
//     const type = columnTypes[column] || 'string';

//     if (type === 'image') {
//       return (
//         <Box sx={{ mb: 2 }}>
//           <Typography variant="subtitle2" gutterBottom>
//             {column}
//           </Typography>
//           {renderImageUploadField(column)}
//           {addErrors[column] && (
//             <Typography color="error" variant="caption">
//               {addErrors[column]}
//             </Typography>
//           )}
//         </Box>
//       );
//     }

//     switch (type) {
//       case 'number':
//         return (
//           <TextField
//             type="number"
//             label={column}
//             value={newRecord[column] ?? ''}
//             onChange={(e) => handleAddFieldChange(column, e.target.value)}
//             fullWidth
//             margin="normal"
//             error={!!addErrors[column]}
//             helperText={addErrors[column]}
//           />
//         );
//       case 'boolean':
//         return (
//           <TextField
//             select
//             label={column}
//             value={newRecord[column] ?? ''}
//             onChange={(e) => handleAddFieldChange(column, e.target.value === 'true')}
//             fullWidth
//             margin="normal"
//             error={!!addErrors[column]}
//             helperText={addErrors[column]}
//             SelectProps={{
//               native: true,
//             }}
//           >
//             <option value=""></option>
//             <option value="true">true</option>
//             <option value="false">false</option>
//           </TextField>
//         );
//       case 'image':
//         return (
//           <TextField
//             label={column}
//             value={newRecord[column] ?? ''}
//             onChange={(e) => handleAddFieldChange(column, e.target.value)}
//             fullWidth
//             margin="normal"
//             multiline
//             rows={3}
//             error={!!addErrors[column]}
//             helperText={addErrors[column]}
//             placeholder="Paste base64 image data"
//           />
//         );
//       default:
//         return (
//           <TextField
//             label={column}
//             value={newRecord[column] ?? ''}
//             onChange={(e) => handleAddFieldChange(column, e.target.value)}
//             fullWidth
//             margin="normal"
//             error={!!addErrors[column]}
//             helperText={addErrors[column]}
//           />
//         );
//     }
//   };

//   // Table pagination
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     const newRowsPerPage = parseInt(event.target.value, 10);
//     setRowsPerPage(newRowsPerPage);
//     setPage(0);
//   };

//   // Edit functionality
//   const handleEdit = (row) => {
//     setEditingId(row._temp_id);
//     setEditedData({ ...row });
//   };

//   const handleCancelEdit = () => {
//     setEditingId(null);
//     setEditedData({});
//   };

//   const handleFieldChange = (field, value) => {
//     const processedValue = value === '' ? null : value;

//     setEditedData(prev => ({
//       ...prev,
//       [field]: processedValue
//     }));
//     setHasChanges(true);
//   };

//   const handleSaveEdit = () => {
//     setTableData(prev =>
//       prev.map(row =>
//         row._temp_id === editingId ? { ...editedData } : row
//       )
//     );
//     setEditingId(null);
//     setEditedData({});
//     setHasChanges(true);
//     showSnackbar('Row changes saved locally', 'success');
//   };

//   // Delete functionality
//   const handleDeleteClick = (row) => {
//     const rowData = { ...row };
//     delete rowData._reactInternals;
//     delete rowData._reactFragment;

//     setRecordToDelete(rowData);
//     setDeleteConfirmOpen(true);
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       if (!recordToDelete) {
//         throw new Error('No record specified for deletion');
//       }

//       setIsSubmitting(true);
//       const response = await axios.delete(
//         `https://www.shorthandexam.in/table/${tableName}/delete`,
//         {
//           data: recordToDelete,
//           headers: {
//             Authorization: 'Bearer dummy-token',
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         showSnackbar(response.data.message || 'Record deleted successfully!');
//         await fetchTableData();
//       } else {
//         showSnackbar(response.data.message || 'Failed to delete record', 'error');
//       }
//     } catch (error) {
//       showSnackbar(
//         error.response?.data?.message ||
//         'Failed to delete record. Please try again.',
//         'error'
//       );
//     } finally {
//       setIsSubmitting(false);
//       setDeleteConfirmOpen(false);
//       setRecordToDelete(null);
//     }
//   };

//   // Data preparation and submission
//   const prepareDataForSubmission = (data) => {
//     const preparedData = data.map(row => {
//       const { _temp_id, ...cleanRow } = row;
//       return cleanRow;
//     });
//     return preparedData;
//   };

//   const handleSubmitChanges = async () => {
//     try {
//       setIsSubmitting(true);

//       const changes = tableData.filter((row, index) => {
//         return JSON.stringify(row) !== JSON.stringify(originalData[index]);
//       });

//       if (changes.length === 0) {
//         showSnackbar('No changes to save');
//         return;
//       }

//       const preparedChanges = prepareDataForSubmission(changes);

//       const response = await axios.put(
//         `https://www.shorthandexam.in/table/${tableName}`,
//         preparedChanges,
//         {
//           headers: {
//             Authorization: 'Bearer dummy-token',
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         await fetchTableData();
//         setHasChanges(false);
//         showSnackbar(response.data.message || 'Changes saved successfully!');
//       } else {
//         showSnackbar(response.data.message || 'Some updates failed', 'warning');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       showSnackbar(`Failed to save changes: ${errorMessage}`, 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Render appropriate input field based on column type
//   const renderInputField = (column, value) => {
//     const type = columnTypes[column] || 'string';

//     if (type === 'image') {
//       return (
//         <Box sx={{ mb: 2 }}>
//           <Typography variant="subtitle2" gutterBottom>
//             {column}
//           </Typography>
//           {value && (
//             <img
//               src={value}
//               alt="Current"
//               style={{
//                 maxWidth: '100px',
//                 maxHeight: '100px',
//                 borderRadius: '4px',
//                 marginBottom: '8px'
//               }}
//             />
//           )}
//           <Button
//             variant="outlined"
//             component="label"
//             sx={{ mt: 1, mr: 1 }}
//           >
//             {value ? 'Change Image' : 'Upload Image'}
//             <input
//               key={fileInputKey}
//               type="file"
//               hidden
//               accept="image/*"
//               onChange={(e) => handleImageUpload(column, e)}
//             />
//           </Button>
//           {value && (
//             <Button
//               variant="outlined"
//               color="error"
//               onClick={() => handleFieldChange(column, null)}
//               sx={{ mt: 1 }}
//             >
//               Remove
//             </Button>
//           )}
//         </Box>
//       );
//     }

//     switch (type) {
//       case 'number':
//         return (
//           <TextField
//             type="number"
//             value={value ?? ''}
//             onChange={(e) => handleFieldChange(column, e.target.value)}
//             size="small"
//             fullWidth
//           />
//         );
//       case 'boolean':
//         return (
//           <select
//             value={value ?? ''}
//             onChange={(e) => handleFieldChange(column, e.target.value === 'true')}
//             style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
//           >
//             <option value="true">true</option>
//             <option value="false">false</option>
//           </select>
//         );
//       case 'image':
//         return (
//           <TextField
//             value={value ?? ''}
//             onChange={(e) => handleFieldChange(column, e.target.value)}
//             size="small"
//             fullWidth
//             placeholder="Paste base64 image data"
//             multiline
//             rows={3}
//           />
//         );
//       default:
//         return (
//           <TextField
//             value={value ?? ''}
//             onChange={(e) => handleFieldChange(column, e.target.value)}
//             size="small"
//             fullWidth
//           />
//         );
//     }
//   };

//   // Loading state
//   if (loading && tableData.length === 0) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   const columns = tableData.length > 0 ?
//     Object.keys(tableData[0]).filter(key => key !== '_temp_id') :
//     [];

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>

//       {/* Image preview dialog */}
//       <Dialog
//         open={imagePreview.open}
//         onClose={() => setImagePreview({ open: false, src: '' })}
//         maxWidth="md"
//       >
//         <DialogContent>
//           <img
//             src={imagePreview.src}
//             alt="Preview"
//             style={{
//               width: '100%',
//               height: 'auto',
//               maxHeight: '80vh'
//             }}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* Table header with title and action buttons */}
//       <Box sx={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         mb: 2,
//         gap: 2,
//         flexWrap: 'wrap'
//       }}>
//         <Typography variant="h5" component="h2" gutterBottom>
//           {tableName}
//         </Typography>

//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Tooltip title="Add new record">
//             <IconButton
//               onClick={() => setAddDialogOpen(true)}
//               disabled={isSubmitting}
//               color="primary"
//             >
//               <AddIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Refresh table data">
//             <IconButton
//               onClick={fetchTableData}
//               disabled={isSubmitting}
//               color="primary"
//             >
//               <RefreshIcon />
//             </IconButton>
//           </Tooltip>

//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={isSubmitting ? null : <CheckCircleIcon />}
//             onClick={handleSubmitChanges}
//             disabled={!hasChanges || isSubmitting}
//             sx={{
//               minWidth: '180px',
//               opacity: hasChanges ? 1 : 0.6,
//               transition: 'opacity 0.3s ease',
//               '&:disabled': {
//                 opacity: 0.6
//               }
//             }}
//           >
//             {isSubmitting ? (
//               <CircularProgress size={24} color="inherit" />
//             ) : (
//               'Submit Changes'
//             )}
//           </Button>
//         </Box>
//       </Box>

//       {/* Search Bar */}
//       <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

//       {/* Error display */}
//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {/* Main table content */}
//       {Array.isArray(tableData) && tableData.length > 0 ? (
//         <Paper elevation={3} sx={{ overflow: 'hidden' }}>
//           <TableContainer sx={{
//             maxHeight: 'calc(100vh - 200px)',
//             maxWidth: '100%',
//             '&::-webkit-scrollbar': {
//               height: '8px',
//               width: '8px'
//             },
//             '&::-webkit-scrollbar-thumb': {
//               backgroundColor: 'primary.main',
//               borderRadius: '4px'
//             }
//           }}>
//             <Table stickyHeader aria-label="sticky table" size="small">
//               <TableHead>
//                 <TableRow>
//                   {columns.map((col) => (
//                     <TableCell
//                       key={col}
//                       sx={{
//                         fontWeight: 'bold',
//                         backgroundColor: 'primary.main',
//                         color: 'primary.contrastText',
//                         whiteSpace: 'nowrap'
//                       }}
//                     >
//                       {col}
//                     </TableCell>
//                   ))}
//                   <TableCell
//                     sx={{
//                       fontWeight: 'bold',
//                       backgroundColor: 'primary.main',
//                       color: 'primary.contrastText',
//                       width: '150px',
//                       position: 'sticky',
//                       right: 0
//                     }}
//                   >
//                     Actions
//                   </TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {tableData
//                   .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                   .map((row) => (
//                     <TableRow
//                       key={row._temp_id}
//                       sx={{
//                         '&:nth-of-type(even)': {
//                           backgroundColor: 'action.hover',
//                           '& .MuiTableCell-root:last-child': {
//                             backgroundColor: theme => theme.palette.mode === 'light'
//                               ? theme.palette.grey[200]
//                               : theme.palette.grey[700]
//                           }
//                         },
//                         '&:hover': {
//                           backgroundColor: 'action.selected',
//                           '& .MuiTableCell-root:last-child': {
//                             backgroundColor: theme => theme.palette.mode === 'light'
//                               ? theme.palette.grey[100]
//                               : theme.palette.grey[800]
//                           }
//                         }
//                       }}
//                     >
//                       {columns.map((col) => (
//                         <TableCell key={`${row._temp_id}-${col}`}>
//                           {editingId === row._temp_id ? (
//                             renderInputField(col, editedData[col])
//                           ) : (
//                             renderCellContent(col, row[col])
//                           )}
//                         </TableCell>
//                       ))}

//                       <TableCell
//                         sx={{
//                           position: 'sticky',
//                           right: 0,
//                           backgroundColor: editingId === row._temp_id
//                             ? 'background.paper'
//                             : theme => theme.palette.mode === 'light'
//                               ? theme.palette.grey[100]
//                               : theme.palette.grey[800],
//                           zIndex: 1,
//                           '&:hover': {
//                             backgroundColor: editingId === row._temp_id
//                               ? 'background.paper'
//                               : theme => theme.palette.mode === 'light'
//                                 ? theme.palette.grey[100]
//                                 : theme.palette.grey[800]
//                           }
//                         }}
//                       >
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                           {editingId === row._temp_id ? (
//                             <>
//                               <Tooltip title="Save changes">
//                                 <IconButton
//                                   color="success"
//                                   onClick={handleSaveEdit}
//                                   disabled={isSubmitting}
//                                   size="small"
//                                 >
//                                   <SaveIcon fontSize="small" />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title="Cancel edit">
//                                 <IconButton
//                                   color="error"
//                                   onClick={handleCancelEdit}
//                                   disabled={isSubmitting}
//                                   size="small"
//                                 >
//                                   <CancelIcon fontSize="small" />
//                                 </IconButton>
//                               </Tooltip>
//                             </>
//                           ) : (
//                             <>
//                               <Tooltip title="Edit row">
//                                 <IconButton
//                                   color="primary"
//                                   onClick={() => handleEdit(row)}
//                                   disabled={isSubmitting || editingId !== null}
//                                   size="small"
//                                 >
//                                   <EditIcon fontSize="small" />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title="Delete row">
//                                 <IconButton
//                                   color="error"
//                                   onClick={() => handleDeleteClick(row)}
//                                   disabled={isSubmitting}
//                                   size="small"
//                                 >
//                                   <DeleteIcon fontSize="small" />
//                                 </IconButton>
//                               </Tooltip>
//                             </>
//                           )}
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//               </TableBody>
//             </Table>
//           </TableContainer>

//           {/* Table pagination */}
//           <TablePagination
//             rowsPerPageOptions={[5, 10, 25, 50]}
//             component="div"
//             count={tableData.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//             sx={{
//               '& .MuiTablePagination-toolbar': {
//                 paddingLeft: 2,
//                 paddingRight: 1
//               }
//             }}
//           />
//         </Paper>
//       ) : (
//         <Typography variant="body1" color="text.secondary">
//           {searchTerm ? 'No matching records found' : 'No data available in this table'}
//         </Typography>
//       )}

//       {/* Add Record Dialog */}
//       <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
//         <DialogTitle>
//           <Typography variant="h6">Add New Record</Typography>
//         </DialogTitle>
//         <DialogContent dividers>
//           <Box sx={{ mt: 1 }}>
//             {columns.map((column) => (
//               <div key={column}>
//                 {columnTypes[column] === 'image' ? (
//                   renderImageUploadField(column)
//                 ) : (
//                   renderAddInputField(column)
//                 )}
//               </div>
//             ))}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setAddDialogOpen(false)} disabled={isSubmitting}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleAddRecord}
//             color="primary"
//             variant="contained"
//             disabled={isSubmitting}
//             startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//           >
//             {isSubmitting ? 'Adding...' : 'Add Record'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteConfirmOpen}
//         onClose={() => setDeleteConfirmOpen(false)}
//       >
//         <DialogTitle>Confirm Deletion</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to delete this record?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => setDeleteConfirmOpen(false)}
//             disabled={isSubmitting}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleConfirmDelete}
//             color="error"
//             variant="contained"
//             disabled={isSubmitting}
//             startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//           >
//             {isSubmitting ? 'Deleting...' : 'Delete'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  TablePagination,
  Button,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { SearchBar } from '../PayFeesComponents/SearchBar';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function DataTable({ tableName }) {
  // State management
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [columnTypes, setColumnTypes] = useState({});
  const [imagePreview, setImagePreview] = useState({
    open: false,
    src: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [addErrors, setAddErrors] = useState({});

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [currentImageField, setCurrentImageField] = useState(null);

  const MAX_IMAGE_SIZE = 50 * 1024; // 50KB in bytes

  // Fetch table data
  useEffect(() => {
    fetchTableData();
  }, [tableName]);

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filteredData = originalData.filter(row =>
        Object.values(row).some(
          value => value &&
            value.toString().toLowerCase().includes(lowercasedSearch)
        ));
      setTableData(filteredData);
      setPage(0);
    } else {
      setTableData([...originalData]);
    }
  }, [searchTerm, originalData]);

  const fetchTableData = async () => {
    try {
      setLoading(true);
      setEditingId(null);
      setEditedData({});
      setHasChanges(false);
      setSearchTerm('');

      const response = await axios.get(`https://www.shorthandexam.in/table/${tableName}`, {
        headers: {
          Authorization: 'Bearer dummy-token'
        }
      });

      const data = response.data?.data ?? response.data ?? [];
      const dataWithIds = data.map((row, index) => ({
        ...row,
        _temp_id: row.id || index
      }));

      setTableData(dataWithIds);
      setOriginalData(JSON.parse(JSON.stringify(dataWithIds)));

      // Infer column types from first row
      if (dataWithIds.length > 0) {
        const types = {};
        Object.entries(dataWithIds[0]).forEach(([key, value]) => {
          if (key === '_temp_id') return;
          types[key] = typeof value;
          // Special handling for image columns
          if (typeof value === 'string' && (value.startsWith('data:image/') ||
            value.startsWith('/9j/') || value.startsWith('iVBORw'))) {
            types[key] = 'image';
          }
        });
        setColumnTypes(types);
      }

      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError('Failed to fetch table data: ' + errorMessage);
      showSnackbar('Failed to fetch table data: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel function
  // const exportToExcel = () => {
  //   try {
  //     // Prepare data for export (remove internal fields)
  //     const exportData = tableData.map(row => {
  //       const { _temp_id, ...cleanRow } = row;
  //       return cleanRow;
  //     });

  //     // Create CSV content
  //     const columns = Object.keys(exportData[0] || {});
  //     let csvContent = columns.join(',') + '\n';
      
  //     exportData.forEach(row => {
  //       const rowValues = columns.map(column => {
  //         let value = row[column];
          
  //         // Handle null/undefined values
  //         if (value === null || value === undefined) return '';
          
  //         // Handle image data (don't export full base64)
  //         if (columnTypes[column] === 'image' && typeof value === 'string') {
  //           return '[Image Data]';
  //         }
          
  //         // Escape commas and quotes in strings
  //         if (typeof value === 'string') {
  //           value = value.replace(/"/g, '""');
  //           if (value.includes(',') || value.includes('"') || value.includes('\n')) {
  //             value = `"${value}"`;
  //           }
  //         }
          
  //         return value;
  //       });
  //       csvContent += rowValues.join(',') + '\n';
  //     });

  //     // Create download link
  //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.setAttribute('href', url);
  //     link.setAttribute('download', `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`);
  //     link.style.visibility = 'hidden';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
      
  //     showSnackbar('Data exported successfully!', 'success');
  //   } catch (error) {
  //     console.error('Export error:', error);
  //     showSnackbar('Failed to export data', 'error');
  //   }
  // };
     
     const exportToExcel = () => {
  try {
    // Prepare data (remove internal fields)
    const exportData = tableData.map(row => {
      const { _temp_id, ...cleanRow } = row;
      return cleanRow;
    });

    if (exportData.length === 0) {
      showSnackbar('No data available to export', 'warning');
      return;
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName);

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    // Save file
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `${tableName}_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    showSnackbar('Excel file exported successfully!', 'success');
  } catch (error) {
    console.error('Export error:', error);
    showSnackbar('Failed to export Excel file', 'error');
  }
};

  // Add record functionality
  const handleAddFieldChange = (field, value) => {
    setNewRecord(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }));
    setAddErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddRecord = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      const errors = {};
      const columns = tableData.length > 0 ?
        Object.keys(tableData[0]).filter(key => key !== '_temp_id') :
        [];

      columns.forEach(col => {
        if (newRecord[col] === undefined || newRecord[col] === null || newRecord[col] === '') {
          errors[col] = 'This field is required';
        }
      });

      setAddErrors(errors);
      if (Object.keys(errors).length > 0) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }

      const response = await axios.post(
        `https://www.shorthandexam.in/table/${tableName}/add`,
        newRecord,
        {
          headers: {
            Authorization: 'Bearer dummy-token',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        showSnackbar('Record added successfully!');
        setAddDialogOpen(false);
        setNewRecord({});
        await fetchTableData();
      } else {
        showSnackbar(response.data.message || 'Failed to add record', 'error');
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to add record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modify the handleImageUpload function
  const handleImageUpload = (field, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      showSnackbar(`Image size must be less than 50KB. Current size: ${(file.size / 1024).toFixed(2)}KB`, 'error');
      setFileInputKey(Date.now()); // Reset the file input
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      if (addDialogOpen) {
        handleAddFieldChange(field, base64String);
      } else {
        handleFieldChange(field, base64String);
      }
      setFileInputKey(Date.now());
    };
    reader.readAsDataURL(file);
  };

  // Modify the renderImageUploadField function to show size limit
  const renderImageUploadField = (column) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {newRecord[column] && (
          <img
            src={newRecord[column]}
            alt="Preview"
            style={{
              maxWidth: '100px',
              maxHeight: '100px',
              borderRadius: '4px'
            }}
          />
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 1 }}
          >
            Upload Image
            <input
              key={fileInputKey}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleImageUpload(column, e)}
            />
          </Button>
          <Typography variant="caption" color="textSecondary">
            Maximum image size: 50KB
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            if (addDialogOpen) {
              handleAddFieldChange(column, null);
            } else {
              handleFieldChange(column, null);
            }
          }}
          disabled={!newRecord[column]}
          sx={{ mt: 1 }}
        >
          Remove Image
        </Button>
      </Box>
    );
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatBase64Image = (base64String) => {
    // Handle empty/undefined input
    if (!base64String || typeof base64String !== 'string') {
      return null;
    }

    // Check if already properly formatted
    if (base64String.startsWith('data:image/')) {
      // Validate existing data URL structure
      const dataUrlRegex = /^data:image\/(\w+);base64,([A-Za-z0-9+/]+={0,2})$/;
      if (dataUrlRegex.test(base64String)) {
        return base64String;
      }
      return null;
    }

    // Determine MIME type based on common patterns
    let mimeType = 'image/jpeg';
    if (base64String.startsWith('iVBORw0KGgo')) { // PNG
      mimeType = 'image/png';
    } else if (base64String.startsWith('R0lGODdh') || base64String.startsWith('R0lGODlh')) { // GIF
      mimeType = 'image/gif';
    } else if (base64String.startsWith('/9j/')) { // JPEG
      mimeType = 'image/jpeg';
    } else if (base64String.startsWith('UklGR')) { // WebP
      mimeType = 'image/webp';
    }

    // Validate base64 content
    const base64Content = base64String.split(',')[1] || base64String;
    const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
    
    if (!base64Regex.test(base64Content)) {
      console.warn('Invalid base64 image data');
      return null;
    }

    return `data:${mimeType};base64,${base64Content}`;
  };

  /**
   * Renders table cell content with proper type handling and error boundaries
   * @param {string} column - Column name
   * @param {any} value - Cell value
   * @returns {JSX.Element|string} - Rendered cell content
   */
  const renderCellContent = (column, value) => {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return (
        <span style={{ color: '#999', fontStyle: 'italic' }}>
          NULL
        </span>
      );
    }

    // Handle image content
    const isImageColumn = columnTypes[column] === 'image';
    const isImageString = typeof value === 'string' && (
      value.startsWith('data:image/') ||
      value.startsWith('/9j/') ||
      value.startsWith('iVBORw') ||
      value.startsWith('R0lGOD') ||
      value.startsWith('UklGR')
    );

    if (isImageColumn || isImageString) {
      const formattedImage = formatBase64Image(value);
      
      if (!formattedImage) {
        return (
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'error.main',
            fontSize: '0.75rem'
          }}>
            <ErrorOutlineIcon fontSize="small" />
            Invalid Image
          </Box>
        );
      }

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Click to enlarge">
            <img
              src={formattedImage}
              alt={`${column} preview`}
              style={{
                maxWidth: '50px',
                maxHeight: '50px',
                borderRadius: '4px',
                objectFit: 'contain',
                cursor: 'pointer',
                backgroundColor: '#f5f5f5'
              }}
              onClick={() => setImagePreview({
                open: true,
                src: formattedImage
              })}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          </Tooltip>
          <Box 
            sx={{ 
              display: 'none',
              alignItems: 'center',
              gap: 0.5,
              color: 'error.main',
              fontSize: '0.75rem'
            }}
          >
            <ErrorOutlineIcon fontSize="small" />
            Failed to load
          </Box>
          <IconButton
            size="small"
            onClick={() => setImagePreview({
              open: true,
              src: formattedImage
            })}
            sx={{ ml: 0.5 }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    // Handle other types
    return String(value);
  };

  // Render input field for add dialog
  const renderAddInputField = (column) => {
    const type = columnTypes[column] || 'string';

    if (type === 'image') {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {column}
          </Typography>
          {renderImageUploadField(column)}
          {addErrors[column] && (
            <Typography color="error" variant="caption">
              {addErrors[column]}
            </Typography>
          )}
        </Box>
      );
    }

    switch (type) {
      case 'number':
        return (
          <TextField
            type="number"
            label={column}
            value={newRecord[column] ?? ''}
            onChange={(e) => handleAddFieldChange(column, e.target.value)}
            fullWidth
            margin="normal"
            error={!!addErrors[column]}
            helperText={addErrors[column]}
          />
        );
      case 'boolean':
        return (
          <TextField
            select
            label={column}
            value={newRecord[column] ?? ''}
            onChange={(e) => handleAddFieldChange(column, e.target.value === 'true')}
            fullWidth
            margin="normal"
            error={!!addErrors[column]}
            helperText={addErrors[column]}
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            <option value="true">true</option>
            <option value="false">false</option>
          </TextField>
        );
      case 'image':
        return (
          <TextField
            label={column}
            value={newRecord[column] ?? ''}
            onChange={(e) => handleAddFieldChange(column, e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            error={!!addErrors[column]}
            helperText={addErrors[column]}
            placeholder="Paste base64 image data"
          />
        );
      default:
        return (
          <TextField
            label={column}
            value={newRecord[column] ?? ''}
            onChange={(e) => handleAddFieldChange(column, e.target.value)}
            fullWidth
            margin="normal"
            error={!!addErrors[column]}
            helperText={addErrors[column]}
          />
        );
    }
  };

  // Table pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Edit functionality
  const handleEdit = (row) => {
    setEditingId(row._temp_id);
    setEditedData({ ...row });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    const processedValue = value === '' ? null : value;

    setEditedData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    setHasChanges(true);
  };

  const handleSaveEdit = () => {
    setTableData(prev =>
      prev.map(row =>
        row._temp_id === editingId ? { ...editedData } : row
      )
    );
    setEditingId(null);
    setEditedData({});
    setHasChanges(true);
    showSnackbar('Row changes saved locally', 'success');
  };

  // Delete functionality
  const handleDeleteClick = (row) => {
    const rowData = { ...row };
    delete rowData._reactInternals;
    delete rowData._reactFragment;

    setRecordToDelete(rowData);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!recordToDelete) {
        throw new Error('No record specified for deletion');
      }

      setIsSubmitting(true);
      const response = await axios.delete(
        `https://www.shorthandexam.in/table/${tableName}/delete`,
        {
          data: recordToDelete,
          headers: {
            Authorization: 'Bearer dummy-token',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        showSnackbar(response.data.message || 'Record deleted successfully!');
        await fetchTableData();
      } else {
        showSnackbar(response.data.message || 'Failed to delete record', 'error');
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message ||
        'Failed to delete record. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
    }
  };

  // Data preparation and submission
  const prepareDataForSubmission = (data) => {
    const preparedData = data.map(row => {
      const { _temp_id, ...cleanRow } = row;
      return cleanRow;
    });
    return preparedData;
  };

  const handleSubmitChanges = async () => {
    try {
      setIsSubmitting(true);

      const changes = tableData.filter((row, index) => {
        return JSON.stringify(row) !== JSON.stringify(originalData[index]);
      });

      if (changes.length === 0) {
        showSnackbar('No changes to save');
        return;
      }

      const preparedChanges = prepareDataForSubmission(changes);

      const response = await axios.put(
        `https://www.shorthandexam.in/table/${tableName}`,
        preparedChanges,
        {
          headers: {
            Authorization: 'Bearer dummy-token',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await fetchTableData();
        setHasChanges(false);
        showSnackbar(response.data.message || 'Changes saved successfully!');
      } else {
        showSnackbar(response.data.message || 'Some updates failed', 'warning');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      showSnackbar(`Failed to save changes: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render appropriate input field based on column type
  const renderInputField = (column, value) => {
    const type = columnTypes[column] || 'string';

    if (type === 'image') {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {column}
          </Typography>
          {value && (
            <img
              src={value}
              alt="Current"
              style={{
                maxWidth: '100px',
                maxHeight: '100px',
                borderRadius: '4px',
                marginBottom: '8px'
              }}
            />
          )}
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 1, mr: 1 }}
          >
            {value ? 'Change Image' : 'Upload Image'}
            <input
              key={fileInputKey}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleImageUpload(column, e)}
            />
          </Button>
          {value && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleFieldChange(column, null)}
              sx={{ mt: 1 }}
            >
              Remove
            </Button>
          )}
        </Box>
      );
    }

    switch (type) {
      case 'number':
        return (
          <TextField
            type="number"
            value={value ?? ''}
            onChange={(e) => handleFieldChange(column, e.target.value)}
            size="small"
            fullWidth
          />
        );
      case 'boolean':
        return (
          <select
            value={value ?? ''}
            onChange={(e) => handleFieldChange(column, e.target.value === 'true')}
            style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      case 'image':
        return (
          <TextField
            value={value ?? ''}
            onChange={(e) => handleFieldChange(column, e.target.value)}
            size="small"
            fullWidth
            placeholder="Paste base64 image data"
            multiline
            rows={3}
          />
        );
      default:
        return (
          <TextField
            value={value ?? ''}
            onChange={(e) => handleFieldChange(column, e.target.value)}
            size="small"
            fullWidth
          />
        );
    }
  };

  // Loading state
  if (loading && tableData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const columns = tableData.length > 0 ?
    Object.keys(tableData[0]).filter(key => key !== '_temp_id') :
    [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image preview dialog */}
      <Dialog
        open={imagePreview.open}
        onClose={() => setImagePreview({ open: false, src: '' })}
        maxWidth="md"
      >
        <DialogContent>
          <img
            src={imagePreview.src}
            alt="Preview"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh'
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Table header with title and action buttons */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {tableName}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Export to Excel button - placed to the left of Add button */}
          <Tooltip title="Export to Excel">
            <IconButton
              onClick={exportToExcel}
              disabled={isSubmitting || tableData.length === 0}
              color="primary"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add new record">
            <IconButton
              onClick={() => setAddDialogOpen(true)}
              disabled={isSubmitting}
              color="primary"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh table data">
            <IconButton
              onClick={fetchTableData}
              disabled={isSubmitting}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            startIcon={isSubmitting ? null : <CheckCircleIcon />}
            onClick={handleSubmitChanges}
            disabled={!hasChanges || isSubmitting}
            sx={{
              minWidth: '180px',
              opacity: hasChanges ? 1 : 0.6,
              transition: 'opacity 0.3s ease',
              '&:disabled': {
                opacity: 0.6
              }
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Submit Changes'
            )}
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main table content */}
      {Array.isArray(tableData) && tableData.length > 0 ? (
        <Paper elevation={3} sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{
            maxHeight: 'calc(100vh - 200px)',
            maxWidth: '100%',
            '&::-webkit-scrollbar': {
              height: '8px',
              width: '8px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.main',
              borderRadius: '4px'
            }
          }}>
            <Table stickyHeader aria-label="sticky table" size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      width: '150px',
                      position: 'sticky',
                      right: 0
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow
                      key={row._temp_id}
                      sx={{
                        '&:nth-of-type(even)': {
                          backgroundColor: 'action.hover',
                          '& .MuiTableCell-root:last-child': {
                            backgroundColor: theme => theme.palette.mode === 'light'
                              ? theme.palette.grey[200]
                              : theme.palette.grey[700]
                          }
                        },
                        '&:hover': {
                          backgroundColor: 'action.selected',
                          '& .MuiTableCell-root:last-child': {
                            backgroundColor: theme => theme.palette.mode === 'light'
                              ? theme.palette.grey[100]
                              : theme.palette.grey[800]
                          }
                        }
                      }}
                    >
                      {columns.map((col) => (
                        <TableCell key={`${row._temp_id}-${col}`}>
                          {editingId === row._temp_id ? (
                            renderInputField(col, editedData[col])
                          ) : (
                            renderCellContent(col, row[col])
                          )}
                        </TableCell>
                      ))}

                      <TableCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          backgroundColor: editingId === row._temp_id
                            ? 'background.paper'
                            : theme => theme.palette.mode === 'light'
                              ? theme.palette.grey[100]
                              : theme.palette.grey[800],
                          zIndex: 1,
                          '&:hover': {
                            backgroundColor: editingId === row._temp_id
                              ? 'background.paper'
                              : theme => theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[800]
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {editingId === row._temp_id ? (
                            <>
                              <Tooltip title="Save changes">
                                <IconButton
                                  color="success"
                                  onClick={handleSaveEdit}
                                  disabled={isSubmitting}
                                  size="small"
                                >
                                  <SaveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel edit">
                                <IconButton
                                  color="error"
                                  onClick={handleCancelEdit}
                                  disabled={isSubmitting}
                                  size="small"
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Edit row">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEdit(row)}
                                  disabled={isSubmitting || editingId !== null}
                                  size="small"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete row">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteClick(row)}
                                  disabled={isSubmitting}
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={tableData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-toolbar': {
                paddingLeft: 2,
                paddingRight: 1
              }
            }}
          />
        </Paper>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {searchTerm ? 'No matching records found' : 'No data available in this table'}
        </Typography>
      )}

      {/* Add Record Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Add New Record</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            {columns.map((column) => (
              <div key={column}>
                {columnTypes[column] === 'image' ? (
                  renderImageUploadField(column)
                ) : (
                  renderAddInputField(column)
                )}
              </div>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddRecord}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Adding...' : 'Add Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}