import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AllDepartments from './components/AllDepartments';
import AddDepartment from './components/AddDepartment';
import EditDepartment from './components/EditDepartment';
import { hasPermission } from "@/pages/Masters/Positions/components/hasPermissionService";

const Departments = () => {
  const canViewDepartment = hasPermission('masters.departments.read');
  const canEditDepartment = hasPermission('masters.departments.update');
  const canCreateDepartment = hasPermission('masters.departments.create');
  const canDeleteDepartment = hasPermission('masters.departments.delete');

  // If user doesn't have read permission, redirect to dashboard
  if (!canViewDepartment) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route 
        index 
        element={
          <AllDepartments 
            canEdit={canEditDepartment}
            canDelete={canDeleteDepartment}
            canCreate={canCreateDepartment}
          />
        } 
      />
      <Route 
        path="add" 
        element={
          canCreateDepartment ? (
            <AddDepartment />
          ) : (
            <Navigate to="/dashboard/departments" replace />
          )
        } 
      />
      <Route 
        path="edit/:id" 
        element={
          canEditDepartment ? (
            <EditDepartment canDelete={canDeleteDepartment} />
          ) : (
            <Navigate to="/dashboard/departments" replace />
          )
        } 
      />
    </Routes>
  );
};

export default Departments;