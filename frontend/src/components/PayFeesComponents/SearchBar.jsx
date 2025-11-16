// frontend\src\components\PayFeesComponents\SearchBar.jsx

import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <TextField
    fullWidth
    placeholder="Search"
    variant="outlined"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    sx={{ mb: 3 }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon color="action" />
        </InputAdornment>
      ),
    }}
  />
);