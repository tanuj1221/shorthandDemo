// // frontend\src\components\PayFeesComponents\StudentsRow.jsx

// import { TableRow, TableCell, Checkbox, Box, IconButton, Tooltip, Avatar } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';

// export const StudentsRow = ({ 
//   student, 
//   selected, 
//   handleSelect, 
//   handleEdit, 
//   setSelected, 
//   openDeleteDialog,
//   showSnackbar
// }) => (
//   <TableRow hover sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
//     <TableCell padding="checkbox">
//       <Checkbox
//         color="primary"
//         checked={selected.includes(student.id)}
//         onChange={() => handleSelect(student.id)}
//         disabled={student.amount === 'paid'}
//         sx={{ '&.Mui-checked': { color: 'primary.main' } }}
//       />
//     </TableCell>
//     <TableCell>
//       {student.image ? (
//         <Avatar 
//           src={student.image.startsWith('data:image') ? student.image : `data:image/jpeg;base64,${student.image}`}
//           sx={{ width: 40, height: 40 }}
//         />
//       ) : (
//         <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
//           {student.firstName?.[0]}{student.lastName?.[0]}
//         </Avatar>
//       )}
//     </TableCell>
//     <TableCell sx={{ fontWeight: 500 }}>{student.id}</TableCell>
//     <TableCell>{student.firstName}</TableCell>
//     <TableCell>{student.lastName}</TableCell>
//     <TableCell>
//       <Box sx={{ 
//         color: student.amount === 'paid' ? 'success.main' : 'error.main',
//         fontWeight: 'medium',
//         textTransform: 'capitalize'
//       }}>
//         {student.amount}
//       </Box>
//     </TableCell>
//     <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
//       {student.subjects}
//     </TableCell>
//     <TableCell>
//       <Tooltip title={student.amount === 'paid' ? "Cannot edit paid student" : "Edit student"}>
//         <IconButton
//           color="primary"
//           onClick={() => handleEdit(student.id)}
//           disabled={student.amount === 'paid'}
//           size="small"
//           sx={{ 
//             '&:hover': { 
//               backgroundColor: 'primary.light',
//               color: 'primary.contrastText' 
//             }
//           }}
//         >
//           <EditIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//     </TableCell>
//     <TableCell>
//       <Tooltip title={student.amount === 'paid' ? "Cannot delete paid student" : "Delete student"}>
//         <IconButton
//           color="error"
//           onClick={() => {
//             if (student.amount === 'paid') {
//               showSnackbar("Cannot delete student with paid fees", "warning");
//             } else {
//               setSelected([student.id]);
//               openDeleteDialog();
//             }
//           }}
//           disabled={student.amount === 'paid'}
//           size="small"
//           sx={{ 
//             '&:hover': { 
//               backgroundColor: 'error.light',
//               color: 'error.contrastText' 
//             }
//           }}
//         >
//           <DeleteIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//     </TableCell>
//   </TableRow>
// );

// frontend\src\components\PayFeesComponents\StudentsRow.jsx
import { TableRow, TableCell, Checkbox, Box, IconButton, Tooltip, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export const StudentsRow = ({ 
  student, 
  selected, 
  handleSelect, 
  handleEdit, 
  setSelected, 
  openDeleteDialog,
  showSnackbar
}) => (
  <TableRow hover sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
    <TableCell padding="checkbox">
      <Checkbox
        color="primary"
        checked={selected.includes(student.id)}
        onChange={() => handleSelect(student.id)}
        // **REMOVED: disabled={student.amount === 'paid'} since we only show pending students**
        sx={{ '&.Mui-checked': { color: 'primary.main' } }}
      />
    </TableCell>
    <TableCell>
      {student.image ? (
        <Avatar 
          src={student.image.startsWith('data:image') ? student.image : `data:image/jpeg;base64,${student.image}`}
          sx={{ width: 40, height: 40 }}
        />
      ) : (
        <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
          {student.firstName?.[0]}{student.lastName?.[0]}
        </Avatar>
      )}
    </TableCell>
    <TableCell sx={{ fontWeight: 500 }}>{student.id}</TableCell>
    <TableCell>{student.firstName}</TableCell>
    <TableCell>{student.lastName}</TableCell>
    <TableCell>
      <Box sx={{ 
        color: 'error.main', // Always red since we only show pending
        fontWeight: 'medium',
        textTransform: 'capitalize'
      }}>
        {student.amount || 'pending'}
      </Box>
    </TableCell>
    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {student.subjects}
    </TableCell>
    <TableCell>
      <Tooltip title="Edit student">
        <IconButton
          color="primary"
          onClick={() => handleEdit(student.id)}
          // **REMOVED: disabled={student.amount === 'paid'} since we only show pending students**
          size="small"
          sx={{ 
            '&:hover': { 
              backgroundColor: 'primary.light',
              color: 'primary.contrastText' 
            }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </TableCell>
    <TableCell>
      <Tooltip title="Delete student">
        <IconButton
          color="error"
          onClick={() => {
            setSelected([student.id]);
            openDeleteDialog();
          }}
          // **REMOVED: disabled and paid check since we only show pending students**
          size="small"
          sx={{ 
            '&:hover': { 
              backgroundColor: 'error.light',
              color: 'error.contrastText' 
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </TableCell>
  </TableRow>
);
