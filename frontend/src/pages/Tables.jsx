// src/pages/TablePage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TableList from '../components/TableComponent/TableList';
import DataTable from '../components/TableComponent/DataTable';
import { Container } from '@mui/material';

const TablePage = () => {
  const { tableName } = useParams();
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {!tableName ? (
        <TableList onSelect={(table) => navigate(`/admin/tables/${table}`)} />
      ) : (
        <DataTable tableName={tableName} />
      )}
    </Container>
  );
};

export default TablePage;
