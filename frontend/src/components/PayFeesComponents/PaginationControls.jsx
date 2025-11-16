// frontend\src\components\PayFeesComponents\PaginationControls.jsx

import { Button, Typography, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

export const PaginationControls = ({ 
  currentPage, 
  setCurrentPage, 
  rowsPerPage,
  setRowsPerPage,
  totalItems 
}) => {
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  return (
    <Box sx={{ 
      mt: 2, 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2
    }}>
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel>Rows per page</InputLabel>
        <Select
          value={rowsPerPage}
          label="Rows per page"
          onChange={handleRowsPerPageChange}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          variant="outlined"
        >
          Previous
        </Button>
        <Typography sx={{ mx: 2, alignSelf: 'center' }}>
          Page {currentPage} of {Math.ceil(totalItems / rowsPerPage)}
        </Typography>
        <Button
          disabled={currentPage * rowsPerPage >= totalItems}
          onClick={() => setCurrentPage(prev => prev + 1)}
          variant="outlined"
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};