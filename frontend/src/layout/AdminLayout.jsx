// src/layouts/AdminLayout.jsx
import React from 'react';
import AdminNavbar from '../components/AdminComponent/AdminNavbar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <>
      <AdminNavbar />
      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
};

export default AdminLayout;
