// // src/pages/StudentList.jsx
// import React, { useEffect } from 'react';
// import { 
//   Box, 
//   Typography, 
//   Chip, 
//   CircularProgress 
// } from '@mui/material';
// import { saveAs } from 'file-saver';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import StudentTableStructure from '../components/StudentListComponents/StudentTableStructure';

// const StudentList = () => {
//   // State management
//   const [searchTerm, setSearchTerm] = React.useState('');
//   const [selected, setSelected] = React.useState([]);
//   const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
//   const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
//   const [currentPage, setCurrentPage] = React.useState(1);
//   const [loading, setLoading] = React.useState(false);
//   const [filterAnchorEl, setFilterAnchorEl] = React.useState(null);
//   const [statusFilter, setStatusFilter] = React.useState('all');
//   const [actionAnchorEl, setActionAnchorEl] = React.useState(null);
//   const [selectedStudent, setSelectedStudent] = React.useState(null);
//   const [students, setStudents] = React.useState([]);
//   const [apiError, setApiError] = React.useState(null);
  
//   const rowsPerPage = 5;

//   // Fetch students from API
//   const fetchStudents = async () => {
//     setLoading(true);
//     setApiError(null);
    
//     try {
//       const response = await fetch('https://www.shorthandexam.in/paystudents', {
//         method: 'GET',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 404) {
//           setStudents([]);
//           showSnackbar('No students with pending amount found', 'info');
//           return;
//         }
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
      
//       // Transform API response
//       const transformedData = data.map(student => ({
//         ...student,
//         student_id: student.student_id,
//         firstName: student.firstName,
//         lastName: student.lastName,
//         amount: student.amount,
//         subjects: student.subject_name,
//         image: student.image ? formatImageData(student.image) : null
//       }));

//       setStudents(transformedData);
//       showSnackbar(`Loaded ${transformedData.length} students`, 'success');
      
//     } catch (error) {
//       console.error('Error fetching students:', error);
//       setApiError(error.message);
//       showSnackbar('Failed to load students data', 'error');
//       setStudents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Format image data to ensure it's proper base64
//   const formatImageData = (imageData) => {
//   // If already properly formatted, return as is
//   if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
//     return imageData;
//   }
  
//   // If it's a buffer or array, convert to base64
//   if (imageData?.data) {
//     const base64 = arrayBufferToBase64(imageData.data);
//     return `data:image/jpeg;base64,${base64}`;
//   }
  
//   // If it's raw base64 without prefix
//   if (typeof imageData === 'string' && !imageData.startsWith('data:')) {
//     return `data:image/jpeg;base64,${imageData}`;
//   }
  
//   // If it's already base64 with prefix but wrong format
//   if (typeof imageData === 'string' && imageData.includes('base64,')) {
//     // Extract the actual base64 part after the comma
//     const base64Part = imageData.split('base64,')[1];
//     return `data:image/jpeg;base64,${base64Part}`;
//   }
  
//   return null;
// };

//   // Helper function to convert array buffer to base64
//   const arrayBufferToBase64 = (buffer) => {
//     let binary = '';
//     const bytes = new Uint8Array(buffer);
//     const len = bytes.byteLength;
//     for (let i = 0; i < len; i++) {
//       binary += String.fromCharCode(bytes[i]);
//     }
//     return window.btoa(binary);
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   // Filter students based on search term and status filter
//   const filteredStudents = students.filter(student => {
//     const matchesSearch = Object.values(student).some(
//       value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     const studentStatus = student.amount === 'pending' ? 'unpaid' : student.amount;
//     const matchesStatus = statusFilter === 'all' || studentStatus === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   // Pagination
//   const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
//   const paginatedStudents = filteredStudents.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handleSelectAll = (checked) => {
//     setSelected(checked ? paginatedStudents.map(student => student.student_id) : []);
//   };

//   const handleSelect = (id) => {
//     setSelected(prev => 
//       prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
//     );
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const closeSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };

//   const handleDelete = () => {
//     setLoading(true);
//     setTimeout(() => {
//       showSnackbar(`Deleted ${selected.length} student(s)`, 'success');
//       setSelected([]);
//       setDeleteDialogOpen(false);
//       setLoading(false);
//       fetchStudents();
//     }, 1000);
//   };

//   const downloadPDF = () => {
//     setLoading(true);
//     const doc = new jsPDF();
//     doc.text('Student List', 14, 15);

//     const tableData = filteredStudents.map(student => [
//       student.student_id,
//       `${student.firstName} ${student.lastName}`,
//       student.motherName,
//       student.amount === 'pending' ? 'unpaid' : student.amount,
//       student.subjects,
//       student.batchYear
//     ]);

//     doc.autoTable({
//       head: [['ID', 'Name', "Mother's Name", 'Status', 'Subject', 'Batch Year']],
//       body: tableData,
//       startY: 20,
//       styles: { fontSize: 8 },
//       columnStyles: {
//         0: { cellWidth: 20 },
//         1: { cellWidth: 30 },
//         2: { cellWidth: 30 },
//         3: { cellWidth: 15 },
//         4: { cellWidth: 25 },
//         5: { cellWidth: 30 }
//       }
//     });

//     doc.save('student_list.pdf');
//     setLoading(false);
//     showSnackbar('PDF downloaded successfully', 'success');
//   };

//   const downloadExcel = () => {
//     setLoading(true);
//     const worksheet = XLSX.utils.json_to_sheet(filteredStudents);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
//     XLSX.writeFile(workbook, "student_list.xlsx");
//     setLoading(false);
//     showSnackbar('Excel file downloaded successfully', 'success');
//   };

//   const handleActionMenuOpen = (event, student) => {
//     setActionAnchorEl(event.currentTarget);
//     setSelectedStudent(student);
//   };

//   const handleActionMenuClose = () => {
//     setActionAnchorEl(null);
//     setSelectedStudent(null);
//   };

//   const handleView = () => {
//     showSnackbar(`Viewing details for ${selectedStudent.firstName} ${selectedStudent.lastName}`, 'info');
//     handleActionMenuClose();
//   };

//   const handleEdit = () => {
//     showSnackbar(`Editing ${selectedStudent.firstName} ${selectedStudent.lastName}`, 'info');
//     handleActionMenuClose();
//   };

//   const handleSingleDelete = () => {
//     setSelected([selectedStudent.student_id]);
//     setDeleteDialogOpen(true);
//     handleActionMenuClose();
//   };

//   const handleRefresh = () => {
//     fetchStudents();
//   };

//   const handleFilterMenuOpen = (event) => {
//     setFilterAnchorEl(event.currentTarget);
//   };

//   const handleFilterMenuClose = () => {
//     setFilterAnchorEl(null);
//   };

//   // Render status chip
//   const renderStatusChip = (student) => {
//     const displayStatus = student.amount === 'pending' ? 'unpaid' : student.amount;
//     const chipColor = student.amount === 'paid' ? 'success' : 'error';
    
//     return (
//       <Chip
//         label={displayStatus}
//         color={chipColor}
//         size="small"
//       />
//     );
//   };

//   if (apiError && students.length === 0 && !loading) {
//     return (
//       <Box sx={{ 
//         display: 'flex', 
//         flexDirection: 'column', 
//         alignItems: 'center', 
//         justifyContent: 'center', 
//         height: '50vh',
//         gap: 2,
//         padding: 3
//       }}>
//         <Typography variant="h6" color="error">
//           Failed to load students data
//         </Typography>
//         <Typography variant="body2" color="textSecondary" textAlign="center">
//           Error: {apiError}
//         </Typography>
//         <Box sx={{ mt: 2 }}>
//           <button 
//             onClick={fetchStudents}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#1976d2',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Retry
//           </button>
//         </Box>
//       </Box>
//     );
//   }

//   return (
//     <StudentTableStructure
//       students={paginatedStudents}
//       selected={selected}
//       loading={loading}
//       currentPage={currentPage}
//       totalPages={totalPages}
//       searchTerm={searchTerm}
//       statusFilter={statusFilter}
//       onSelectAll={handleSelectAll}
//       onSelect={handleSelect}
//       onSearch={setSearchTerm}
//       onStatusFilterChange={setStatusFilter}
//       onPageChange={setCurrentPage}
//       onRefresh={handleRefresh}
//       onDownloadPDF={downloadPDF}
//       onDownloadExcel={downloadExcel}
//       onDeleteSelected={() => setDeleteDialogOpen(true)}
//       onActionMenuOpen={handleActionMenuOpen}
//       onView={handleView}
//       onEdit={handleEdit}
//       onSingleDelete={handleSingleDelete}
//       onDeleteConfirm={handleDelete}
//       onDeleteCancel={() => setDeleteDialogOpen(false)}
//       deleteDialogOpen={deleteDialogOpen}
//       actionAnchorEl={actionAnchorEl}
//       filterAnchorEl={filterAnchorEl}
//       snackbar={snackbar}
//       onSnackbarClose={closeSnackbar}
//       onFilterMenuOpen={handleFilterMenuOpen}
//       onFilterMenuClose={handleFilterMenuClose}
//       onActionMenuClose={handleActionMenuClose}
//       renderStatusChip={renderStatusChip}
//       rowsPerPage={rowsPerPage}
//     />
//   );
// };

// export default StudentList;


// src/pages/StudentList.jsx
import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  CircularProgress 
} from '@mui/material';
import StudentTableStructure from '../components/StudentListComponents/StudentTableStructure';

const StudentList = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selected, setSelected] = React.useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [actionAnchorEl, setActionAnchorEl] = React.useState(null);
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const [students, setStudents] = React.useState([]);
  const [apiError, setApiError] = React.useState(null);

  const rowsPerPage = 5;

  const fetchStudents = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await fetch('https://www.shorthandexam.in/paystudents', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setStudents([]);
          showSnackbar('No students with pending amount found', 'info');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const transformedData = data.map(student => ({
        ...student,
        image: student.image ? formatImageData(student.image) : null
      }));

      setStudents(transformedData);
      showSnackbar(`Loaded ${transformedData.length} students`, 'success');
    } catch (error) {
      console.error('Error fetching students:', error);
      setApiError(error.message);
      showSnackbar('Failed to load students data', 'error');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatImageData = (imageData) => {
    if (typeof imageData === 'string' && imageData.startsWith('data:image')) return imageData;
    if (imageData?.data) {
      const base64 = arrayBufferToBase64(imageData.data);
      return `data:image/jpeg;base64,${base64}`;
    }
    if (typeof imageData === 'string' && !imageData.startsWith('data:')) {
      return `data:image/jpeg;base64,${imageData}`;
    }
    if (typeof imageData === 'string' && imageData.includes('base64,')) {
      const base64Part = imageData.split('base64,')[1];
      return `data:image/jpeg;base64,${base64Part}`;
    }
    return null;
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = Object.values(student).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const studentStatus = student.amount === 'pending' ? 'unpaid' : student.amount;
    const matchesStatus = statusFilter === 'all' || studentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (checked) => {
    setSelected(checked ? paginatedStudents.map(s => s.student_id) : []);
  };

  const handleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => {
      showSnackbar(`Deleted ${selected.length} student(s)`, 'success');
      setSelected([]);
      setDeleteDialogOpen(false);
      setLoading(false);
      fetchStudents();
    }, 1000);
  };

  const handleActionMenuOpen = (event, student) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleActionMenuClose = () => {
    setActionAnchorEl(null);
    setSelectedStudent(null);
  };

  const handleView = () => {
    showSnackbar(`Viewing details for ${selectedStudent.firstName} ${selectedStudent.lastName}`, 'info');
    handleActionMenuClose();
  };

  const handleEdit = () => {
    showSnackbar(`Editing ${selectedStudent.firstName} ${selectedStudent.lastName}`, 'info');
    handleActionMenuClose();
  };

  const handleSingleDelete = () => {
    setSelected([selectedStudent.student_id]);
    setDeleteDialogOpen(true);
    handleActionMenuClose();
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  const handleFilterMenuOpen = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterMenuClose = () => setFilterAnchorEl(null);

  const renderStatusChip = (student) => {
    const displayStatus = student.amount === 'pending' ? 'unpaid' : student.amount;
    const chipColor = student.amount === 'paid' ? 'success' : 'error';
    return <Chip label={displayStatus} color={chipColor} size="small" />;
  };

  if (apiError && students.length === 0 && !loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 2, padding: 3 }}>
        <Typography variant="h6" color="error">Failed to load students data</Typography>
        <Typography variant="body2" color="textSecondary" textAlign="center">Error: {apiError}</Typography>
        <Box sx={{ mt: 2 }}>
          <button onClick={fetchStudents} style={{ padding: '8px 16px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
        </Box>
      </Box>
    );
  }

  return (
    <StudentTableStructure
      students={paginatedStudents}
      selected={selected}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      onSelectAll={handleSelectAll}
      onSelect={handleSelect}
      onSearch={setSearchTerm}
      onStatusFilterChange={setStatusFilter}
      onPageChange={setCurrentPage}
      onRefresh={handleRefresh}
      onDeleteSelected={() => setDeleteDialogOpen(true)}
      onActionMenuOpen={handleActionMenuOpen}
      onView={handleView}
      onEdit={handleEdit}
      onSingleDelete={handleSingleDelete}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={() => setDeleteDialogOpen(false)}
      deleteDialogOpen={deleteDialogOpen}
      actionAnchorEl={actionAnchorEl}
      filterAnchorEl={filterAnchorEl}
      snackbar={snackbar}
      onSnackbarClose={closeSnackbar}
      onFilterMenuOpen={handleFilterMenuOpen}
      onFilterMenuClose={handleFilterMenuClose}
      onActionMenuClose={handleActionMenuClose}
      renderStatusChip={renderStatusChip}
      rowsPerPage={rowsPerPage}
    />
  );
};

export default StudentList;
