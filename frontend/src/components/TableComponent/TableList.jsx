// src/components/TableComponent/TableList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  IconButton,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import TableViewIcon from '@mui/icons-material/TableView';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

axios.defaults.withCredentials = true;

function TableList({ onSelect }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const tablesPerPage = 15; // 3 columns × 5 tables = 15 tables per slide
  const totalPages = Math.ceil(tables.length / tablesPerPage);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:3001/tables');
        setTables(response.data.tables);
        setLoading(false);
      } catch (err) {
        setError('⚠ Failed to fetch tables: ' + err.message);
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const getCurrentPageTables = () => {
    const startIndex = currentPage * tablesPerPage;
    const endIndex = startIndex + tablesPerPage;
    return tables.slice(startIndex, endIndex);
  };

  // Split tables into 3 columns of 5 tables each
  const getColumnsData = () => {
    const currentTables = getCurrentPageTables();
    const columns = [[], [], []];
    
    currentTables.forEach((table, index) => {
      const columnIndex = Math.floor(index / 5); // 0-4 go to column 0, 5-9 to column 1, 10-14 to column 2
      if (columnIndex < 3) {
        columns[columnIndex].push(table);
      }
    });
    
    return columns;
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Typography color="error" variant="body1" sx={{ p: 2, textAlign: 'center' }}>
      {error}
    </Typography>
  );

  if (tables.length === 0) return (
    <Typography variant="body1" sx={{ p: 4, textAlign: 'center' }}>
      No tables available
    </Typography>
  );

  const columnsData = getColumnsData();

  return (
    <Card sx={{ 
      maxWidth: '100%', 
      mx: 'auto', 
      mt: 4, 
      boxShadow: 3,
      overflow: 'hidden'
    }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          fontWeight: 600
        }}>
          <TableViewIcon sx={{ mr: 1.5, color: 'primary.main' }} /> 
          Available Tables
        </Typography>

        {/* Navigation Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          px: 1
        }}>
          <IconButton 
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Typography variant="body2" sx={{ 
            fontWeight: 500,
            color: 'text.secondary'
          }}>
            Page {currentPage + 1} of {totalPages} 
            <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem' }}>
              ({tables.length} total tables)
            </Typography>
          </Typography>

          <IconButton 
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        {/* 3 Column Grid Layout */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
          <Box sx={{ 
            display: isSmallScreen ? 'block' : 'flex',
            gap: 4,
            maxWidth: '1000px',
            width: '100%'
          }}>
            {columnsData.map((columnTables, columnIndex) => (
              <Box 
                key={columnIndex}
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mb: isSmallScreen ? 3 : 0
                }}
              >
                {columnTables.map((table, tableIndex) => (
                  <Button
                    key={`${currentPage}-${columnIndex}-${tableIndex}`}
                    variant="outlined"
                    onClick={() => onSelect(table)}
                    sx={{
                      width: '100%',
                      height: '50px',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      border: '2px solid',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      backgroundColor: 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                      }}
                    >
                      {table}
                    </Typography>
                  </Button>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Page Dots Indicator */}
        {totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 3,
            gap: 1
          }}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentPage(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === currentPage ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: index === currentPage ? 'primary.dark' : 'grey.400',
                    transform: 'scale(1.2)'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default TableList;


