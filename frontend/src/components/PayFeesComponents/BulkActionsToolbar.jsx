// frontend\src\components\PayFeesComponents\BulkActionsToolbar.jsx

import { Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export const BulkActionsToolbar = ({ selected, openDeleteDialog, exportToCSV }) => (
  <Box sx={{ mb: 2 }}>
    <Button
      variant="contained"
      color="error"
      startIcon={<DeleteIcon />}
      onClick={openDeleteDialog}
      disabled={selected.length === 0}
    >
      Delete Selected
    </Button>
    <Button
      variant="outlined"
      color="primary"
      startIcon={<FileDownloadIcon />}
      onClick={exportToCSV}
      sx={{ ml: 2 }}
    >
      Export to CSV
    </Button>
  </Box>
);