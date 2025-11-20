import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import StudentTableStructure from '../components/StudentTableStructure';
import { Box, Typography, Chip } from '@mui/material';

const StudentTableData = () => {
  // State management
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
  const [studentsData, setStudentsData] = React.useState([]);
  const rowsPerPage = 5;

  // Fetch students from backend
  React.useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://www.shorthandexam.in/paystudents', {
          withCredentials: true,
        });
        console.log('Fetched students data:', response.data);
        setStudentsData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setSnackbar({
          open: true,
          message: err.response?.data || 'Failed to fetch student data',
          severity: 'error',
        });
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fixed helper function to use backend payment_status field
  const getPaymentStatus = (student) => {
    // Check amount field first
    if (student.amount === 'paid') {
      return 'paid';
    } else if (student.amount === 'waiting') {
      return 'waiting';
    } else if (student.amount === 'pending' || !student.amount) {
      return 'unpaid';
    }
    
    // Use payment_status field as fallback
    if (student.payment_status) {
      return student.payment_status;
    }
    
    // Default to unpaid
    return 'unpaid';
  };

  // Filter students based on search term and status filter
  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = Object.values(student).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Updated status filtering logic
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const paymentStatus = getPaymentStatus(student);
      matchesStatus = paymentStatus === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelected(paginatedStudents.map(student => student.student_id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = () => {
    setLoading(true);
    // TODO: Implement actual API call for deletion
    setTimeout(() => {
      showSnackbar(`Deleted ${selected.length} student(s)`, 'success');
      setSelected([]);
      setDeleteDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const renderImage = (student) => {
    if (!student.image) {
      return (
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            No Image
          </Typography>
        </Box>
      );
    }
    
    try {
      const imageSrc = student.image.startsWith('data:') 
        ? student.image 
        : `data:image/jpeg;base64,${student.image}`;
      
      return (
        <Box
          component="img"
          src={imageSrc}
          alt="Student"
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid',
            borderColor: 'divider'
          }}
        />
      );
    } catch (e) {
      return (
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="caption" color="error">
            Invalid
          </Typography>
        </Box>
      );
    }
  };

  // Fixed renderStatusChip function
  const renderStatusChip = (student) => {
    const paymentStatus = getPaymentStatus(student);
    
    let label, color;
    if (paymentStatus === 'paid') {
      label = 'Paid';
      color = 'success';
    } else if (paymentStatus === 'waiting') {
      label = 'Waiting Approval';
      color = 'warning';
    } else {
      label = 'Unpaid';
      color = 'error';
    }
    
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        variant="filled"
      />
    );
  };

  const downloadPDF = () => {
    setLoading(true);
    const doc = new jsPDF();
    doc.text('Student List', 14, 15);
    
    const tableData = filteredStudents.map(student => {
      const status = getPaymentStatus(student);
      let statusText = 'Unpaid';
      if (status === 'paid') statusText = 'Paid';
      else if (status === 'waiting') statusText = 'Waiting Approval';
      
      return [
        student.student_id,
        `${student.firstName} ${student.lastName}`,
        student.motherName,
        statusText,
        student.batchStartDate || '-',
        student.batchEndDate || '-',
        student.subjects || 'No Subjects',
        student.batch_year
      ];
    });
    
    doc.autoTable({
      head: [['ID', 'Name', "Mother's Name", 'Status', 'Start Date', 'Expiry Date', 'Subject', 'Batch Year']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 15 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
        7: { cellWidth: 20 }    
      }
    });
    
    doc.save('student_list.pdf');
    setLoading(false);
    showSnackbar('PDF downloaded successfully', 'success');
  };

  const downloadExcel = () => {
    setLoading(true);
    
    // Prepare data with proper status formatting
    const excelData = filteredStudents.map(student => {
      const status = getPaymentStatus(student);
      let statusText = 'Unpaid';
      if (status === 'paid') statusText = 'Paid';
      else if (status === 'waiting') statusText = 'Waiting Approval';
      
      return {
        'Student ID': student.student_id,
        'First Name': student.firstName,
        'Last Name': student.lastName,
        'Mother Name': student.motherName,
        'Payment Status': statusText,
        'Start Date': student.batchStartDate || '-',
        'Expiry Date': student.batchEndDate || '-',
        'Subjects': student.subjects || 'No Subjects',
        'Batch Year': student.batch_year
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "student_list.xlsx");
    setLoading(false);
    showSnackbar('Excel file downloaded successfully', 'success');
  };

  const handleRefresh = () => {
    setLoading(true);
    const fetchStudents = async () => {
      try {
        const response = await axios.get('https://www.shorthandexam.in/paystudents', {
          withCredentials: true,
        });
        console.log('Refreshed students data:', response.data);
        setStudentsData(response.data);
        showSnackbar('Data refreshed successfully', 'success');
        setLoading(false);
      } catch (err) {
        console.error('Error refreshing students:', err);
        showSnackbar(err.response?.data || 'Failed to refresh student data', 'error');
        setLoading(false);
      }
    };
    fetchStudents();
  };

  const handleView = () => {
    showSnackbar(`Viewing details for ${selectedStudent.firstName} ${selectedStudent.lastName}`, 'info');
    setActionAnchorEl(null);
  };

  const handleEdit = () => {
    showSnackbar(`Editing ${selectedStudent.firstName} ${selectedStudent.lastName}`, 'info');
    setActionAnchorEl(null);
  };

  const handleSingleDelete = () => {
    setSelected([selectedStudent.student_id]);
    setDeleteDialogOpen(true);
    setActionAnchorEl(null);
  };

  return (
    <StudentTableStructure
      // Data props
      students={paginatedStudents}
      selected={selected}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      
      // Handler props
      onSelectAll={handleSelectAll}
      onSelect={handleSelect}
      onSearch={setSearchTerm}
      onStatusFilterChange={setStatusFilter}
      onPageChange={setCurrentPage}
      onRefresh={handleRefresh}
      onDownloadPDF={downloadPDF}
      onDownloadExcel={downloadExcel}
      onDeleteSelected={() => setDeleteDialogOpen(true)}
      onActionMenuOpen={(e, student) => {
        setActionAnchorEl(e.currentTarget);
        setSelectedStudent(student);
      }}
      onView={handleView}
      onEdit={handleEdit}
      onSingleDelete={handleSingleDelete}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={() => setDeleteDialogOpen(false)}
      
      // UI state props
      deleteDialogOpen={deleteDialogOpen}
      actionAnchorEl={actionAnchorEl}
      filterAnchorEl={filterAnchorEl}
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar({...snackbar, open: false})}
      onFilterMenuOpen={(e) => setFilterAnchorEl(e.currentTarget)}
      onFilterMenuClose={() => setFilterAnchorEl(null)}
      onActionMenuClose={() => setActionAnchorEl(null)}
      
      // Custom renderers
      renderImage={renderImage}
      renderStatusChip={renderStatusChip}
      rowsPerPage={rowsPerPage}
    />
  );
};

export default StudentTableData;
