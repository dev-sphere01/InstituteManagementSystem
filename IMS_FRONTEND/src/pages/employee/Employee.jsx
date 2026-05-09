import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store';
import useEmployeeStore from '../../store/useEmployeeStore';
import PermissionGuard from '../../components/PermissionGuard';
import EmployeeList from './components/EmployeeList';
import EmployeeProfile from './components/EmployeeProfile';
import CreateEmployee from './create/CreateEmployee';
import EditEmployee from './edit/EditEmployee';
import Departments from './masters/Departments';
import Positions from './masters/Positions';
import EmployeeTypes from './masters/EmployeeTypes';
import Branches from './masters/Branches';

const Employee = () => {
  const { view, id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const { fetchEmployees, fetchDepartments, fetchPositions, fetchEmployeeTypes, fetchLocations } = useEmployeeStore();

  // Derive current view from URL params
  const currentView = view || 'list';
  const selectedId = id ? parseInt(id) : null;

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
    fetchEmployeeTypes();
    fetchLocations();
  }, []);

  const goTo = (newView, empId = null) => {
    if (newView === 'list') navigate('/dashboard/employees');
    else if (empId) navigate(`/dashboard/employees/${newView}/${empId}`);
    else navigate(`/dashboard/employees/${newView}`);
  };

  const renderView = () => {
    switch (currentView) {
      case 'new':
        return (
          <PermissionGuard permissions={['employee.create']}>
            <CreateEmployee onBack={() => goTo('list')} onSuccess={() => goTo('list')} />
          </PermissionGuard>
        );
      case 'profile':
        return (
          <PermissionGuard permissions={['employee.read']}>
            <EmployeeProfile
              empId={selectedId}
              onBack={() => goTo('list')}
              onEdit={(id) => goTo('edit', id)}
            />
          </PermissionGuard>
        );
      case 'edit':
        return (
          <PermissionGuard permissions={['employee.update']}>
            <EditEmployee
              empId={selectedId}
              onBack={() => goTo('profile', selectedId)}
              onSuccess={() => goTo('profile', selectedId)}
            />
          </PermissionGuard>
        );
      case 'departments':
        return (
          <PermissionGuard permissions={['department.read']}>
            <Departments onBack={() => goTo('list')} />
          </PermissionGuard>
        );
      case 'positions':
        return (
          <PermissionGuard permissions={['department.read']}>
            <Positions onBack={() => goTo('list')} />
          </PermissionGuard>
        );
      case 'types':
        return (
          <PermissionGuard permissions={['department.read']}>
            <EmployeeTypes onBack={() => goTo('list')} />
          </PermissionGuard>
        );
      case 'branches':
        return (
          <PermissionGuard permissions={['department.read']}>
            <Branches onBack={() => goTo('list')} />
          </PermissionGuard>
        );
      default:
        return (
          <PermissionGuard permissions={['employee.read']}>
            <EmployeeList
              onAdd={() => goTo('new')}
              onView={(id) => goTo('profile', id)}
              onEdit={(id) => goTo('edit', id)}
              onMaster={(master) => goTo(master)}
            />
          </PermissionGuard>
        );
    }
  };

  return (
    <div className="p-0">
      {renderView()}
    </div>
  );
};

export default Employee;
