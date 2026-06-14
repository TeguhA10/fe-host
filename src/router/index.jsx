import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Guard
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import Login from '../pages/auth/Login';
import MainDashboard from '../pages/dashboard/MainDashboard';
import NotFound from '../pages/errors/NotFound';
import Forbidden from '../pages/errors/Forbidden';

// HRIS Pages
import HrisDashboard from '../pages/hris/hrisDashboard';
import EmployeeList from '../pages/hris/employees/EmployeeList';
import EmployeeForm from '../pages/hris/employees/EmployeeForm';
import EmployeeDetail from '../pages/hris/employees/EmployeeDetail';
import BranchTree from '../pages/hris/branches/BranchTree';
import PositionTree from '../pages/hris/positions/PositionTree';
import UserList from '../pages/hris/users/UserList';

// Purchasing Pages
import PurchasingDashboard from '../pages/purchasing/purchasingDashboard';
import VendorList from '../pages/purchasing/vendors/VendorList';
import VendorForm from '../pages/purchasing/vendors/VendorForm';
import VendorDetail from '../pages/purchasing/vendors/VendorDetail';
import ItemList from '../pages/purchasing/items/ItemList';
import ItemForm from '../pages/purchasing/items/ItemForm';
import PurchaseOrderList from '../pages/purchasing/purchase-orders/PurchaseOrderList';
import PurchaseOrderForm from '../pages/purchasing/purchase-orders/PurchaseOrderForm';
import PurchaseOrderDetail from '../pages/purchasing/purchase-orders/PurchaseOrderDetail';

export const router = createBrowserRouter([
  // Public Auth Route
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> }
    ]
  },

  // Private Dashboard Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <MainDashboard /> },

      // HRIS Submodule
      {
        path: 'hris',
        children: [
          { index: true, element: <HrisDashboard /> },
          { path: 'employees', element: <EmployeeList /> },
          { path: 'employees/new', element: <EmployeeForm /> },
          { path: 'employees/:id', element: <EmployeeDetail /> },
          { path: 'employees/:id/edit', element: <EmployeeForm /> },
          { path: 'branches', element: <BranchTree /> },
          { path: 'positions', element: <PositionTree /> },
          {
            path: 'users',
            element: (
              <ProtectedRoute allowedRoles={['superadmin']}>
                <UserList />
              </ProtectedRoute>
            )
          }
        ]
      },

      // Purchasing Submodule
      {
        path: 'purchasing',
        children: [
          { index: true, element: <PurchasingDashboard /> },
          { path: 'vendors', element: <VendorList /> },
          { path: 'vendors/new', element: <VendorForm /> },
          { path: 'vendors/:id', element: <VendorDetail /> },
          { path: 'vendors/:id/edit', element: <VendorForm /> },
          { path: 'items', element: <ItemList /> },
          { path: 'items/new', element: <ItemForm /> },
          { path: 'items/:id/edit', element: <ItemForm /> },
          { path: 'purchase-orders', element: <PurchaseOrderList /> },
          { path: 'purchase-orders/new', element: <PurchaseOrderForm /> },
          { path: 'purchase-orders/:id', element: <PurchaseOrderDetail /> },
          { path: 'purchase-orders/:id/edit', element: <PurchaseOrderForm /> }
        ]
      }
    ]
  },

  // Fallbacks and Error routes
  { path: '403', element: <Forbidden /> },
  { path: '404', element: <NotFound /> },
  { path: '*', element: <Navigate to="/404" replace /> }
]);
export default router;
