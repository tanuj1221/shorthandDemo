// // frontend\src\components\AudioPageComponent\AudioTable.jsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import AudioRow from './AudioRow';

const AudioTable = ({ 
  submissions = [], 
  onSelectSubmission, 
  onUpdateSubmission,
  onDeleteSubmission,
  disabled = false 
}) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRowExpand = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No audio submissions found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Actions</TableCell>
            <TableCell>Institute</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Recorded By</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Answer Preview</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission) => (
            <AudioRow
              key={submission.id}
              submission={submission}
              isExpanded={expandedRows.includes(submission.id)}
              onExpandToggle={toggleRowExpand}
              onSelect={onSelectSubmission}
              onUpdate={onUpdateSubmission}
              onDelete={onDeleteSubmission}
              disabled={disabled}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AudioTable;