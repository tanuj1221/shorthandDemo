// // frontend\src\components\PayFeesComponents\StudentsTable.jsx
// import { 
//   TableContainer, 
//   Table, 
//   TableHead, 
//   TableBody, 
//   TableRow, 
//   TableCell, 
//   Checkbox,
//   Typography,
//   useTheme
// } from '@mui/material';
// import { StudentsRow } from './StudentsRow';

// export const StudentsTable = ({ 
//   students, 
//   selected, 
//   handleSelectAll, 
//   handleSelect, 
//   handleEdit, 
//   setSelected, 
//   openDeleteDialog,
//   showSnackbar
// }) => {
//   const theme = useTheme();

//   return (
//     <TableContainer sx={{ 
//       borderRadius: 2,
//       border: `1px solid ${theme.palette.divider}`,
//       maxHeight: 'calc(100vh - 300px)',
//       overflow: 'auto'
//     }}>
//       <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
//         <TableHead>
//           <TableRow sx={{ '& th': { backgroundColor: theme.palette.background.paper } }}>
//             <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 2 }}>
//               <Checkbox
//                 color="primary"
//                 indeterminate={selected.length > 0 && selected.length < students.length}
//                 checked={students.length > 0 && selected.length === students.length}
//                 onChange={handleSelectAll}
//                 sx={{ '&.Mui-checked': { color: 'primary.main' } }}
//               />
//             </TableCell>
//             <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Image</TableCell>
//             <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>ID</TableCell>
//             <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>First Name</TableCell>
//             <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Last Name</TableCell>
//             <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Status</TableCell>
//             <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Subject</TableCell>
//             <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Edit</TableCell>
//             <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Delete</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {students.length > 0 ? (
//             students.map((student) => (
//               <StudentsRow
//                 key={student.id}
//                 student={student}
//                 selected={selected}
//                 handleSelect={handleSelect}
//                 handleEdit={handleEdit}
//                 setSelected={setSelected}
//                 openDeleteDialog={openDeleteDialog}
//                 showSnackbar={showSnackbar}
//               />
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
//                 <Typography variant="body1" color="textSecondary">
//                   No students found
//                 </Typography>
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// frontend\src\components\PayFeesComponents\StudentsTable.jsx
import { 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Checkbox,
  Typography,
  useTheme
} from '@mui/material';
import { StudentsRow } from './StudentsRow';

export const StudentsTable = ({ 
  students, 
  selected, 
  handleSelectAll, 
  handleSelect, 
  handleEdit, 
  setSelected, 
  openDeleteDialog,
  showSnackbar
}) => {
  const theme = useTheme();

  // **UPDATED: Since we only show pending students, all can be selected**
  const selectableStudents = students; // All students are selectable since none are paid

  return (
    <TableContainer sx={{ 
      borderRadius: 2,
      border: `1px solid ${theme.palette.divider}`,
      maxHeight: 'calc(100vh - 300px)',
      overflow: 'auto'
    }}>
      <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow sx={{ '& th': { backgroundColor: theme.palette.background.paper } }}>
            <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 2 }}>
              <Checkbox
                color="primary"
                indeterminate={selected.length > 0 && selected.length < selectableStudents.length}
                checked={selectableStudents.length > 0 && selected.length === selectableStudents.length}
                onChange={handleSelectAll}
                sx={{ '&.Mui-checked': { color: 'primary.main' } }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Image</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>First Name</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Last Name</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Subject</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Edit</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.length > 0 ? (
            students.map((student) => (
              <StudentsRow
                key={student.id}
                student={student}
                selected={selected}
                handleSelect={handleSelect}
                handleEdit={handleEdit}
                setSelected={setSelected}
                openDeleteDialog={openDeleteDialog}
                showSnackbar={showSnackbar}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="textSecondary">
                  No pending students found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};