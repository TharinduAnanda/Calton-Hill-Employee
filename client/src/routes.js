import React from 'react';
import UserTypeSelection from './pages/Auth/UserTypeSelection';
import OwnerLogin from './pages/Auth/OwnerLogin';
import StaffLogin from './pages/Auth/StaffLogin';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductDetails from './pages/Products/ProductDetails';
import InventoryList from './pages/Inventory/InventoryList';
import InventoryItem from './pages/Inventory/InventoryItem';
import AddInventoryItem from './pages/Inventory/AddInventoryItem';
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierDetail from './pages/Suppliers/SupplierDetail';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import ForgotPassword from './pages/Auth/ForgotPassword';
import OwnerDashboardPage from './pages/Owner/OwnerDashboardPage';
import StaffManagement from './pages/Owner/StaffManagement';
import StoreSettings from './pages/Owner/StoreSettings';
import OwnerAccountSettings from './pages/Owner/OwnerAccountSettings';
import StaffDashboard from './pages/Staff/StaffDashboard';
import ProductForm from './pages/Products/ProductForm';
import SupplierForm from './pages/Suppliers/SupplierForm';
import CreateOrderForm from './pages/Orders/CreateOrderForm';

// Error components
const NotFound = () => (
  <div className="error-page">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

const Unauthorized = () => (
  <div className="error-page">
    <h1>403 - Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
  </div>
);

// Route configuration
const routeConfig = {
  public: [
    {
      path: '/',
      component: UserTypeSelection,
      exact: true
    },
    {
      path: '/owner-login',
      component: OwnerLogin
    },
    {
      path: '/staff-login',
      component: StaffLogin
    },
    {
      path: '/forgot-password',
      component: ForgotPassword
    }
  ],
  
  owner: [
    {
      path: '/owner/dashboard',
      component: OwnerDashboardPage,
      exact: true,
      allowedRoles: ['owner']
    },
    {
      path: '/staff',
      component: StaffManagement,
      protected: true,
      allowedRoles: ['owner'],
      exact: true
    },
    {
      path: '/owner/settings',
      component: StoreSettings,
      allowedRoles: ['owner']
    },
    {
      path: '/owner/account',
      component: OwnerAccountSettings,
      allowedRoles: ['owner']
    }
  ],
  
  staff: [
    {
      path: '/staff/dashboard',
      component: StaffDashboard,
      exact: true,
      allowedRoles: ['staff', 'manager']
    },
    {
      path: '/manager/dashboard',
      component: StaffDashboard,
      allowedRoles: ['manager']
    }
  ],
  
  shared: [
    {
      path: '/dashboard',
      component: Dashboard,
      allowedRoles: ['owner', 'manager', 'staff']
    },
    {
      path: '/products',
      component: ProductList,
      exact: true,
      allowedRoles: ['owner', 'manager', 'staff']
    },
    {
      path: '/products/add',
      component: ProductForm,
      allowedRoles: ['owner', 'manager']
    },
    {
      path: '/products/:id',
      component: ProductDetails,
      allowedRoles: ['owner', 'manager', 'staff']
    },
    {
      path: '/inventory',
      component: InventoryList,
      exact: true,
      allowedRoles: ['owner', 'manager', 'staff']
    },
    {
      path: '/inventory/add',
      component: AddInventoryItem,
      allowedRoles: ['owner', 'manager']
    },
    {
      path: '/inventory/:id',
      component: InventoryItem,
      allowedRoles: ['owner', 'manager', 'staff']
    },
    {
      path: '/suppliers',
      component: SupplierList,
      exact: true,
      allowedRoles: ['owner', 'manager']
    },
    {
      path: '/suppliers/add',
      component: SupplierForm,
      allowedRoles: ['owner', 'manager']
    },
    {
      path: '/suppliers/:id',
      component: SupplierDetail,
      allowedRoles: ['owner', 'manager']
    },
    {
      path: '/orders',
      component: OrderList,
      exact: true,
      allowedRoles: ['owner', 'manager', 'staff']
    },
    {
      path: '/orders/create',
      component: CreateOrderForm,
      allowedRoles: ['owner', 'manager', 'staff']
    },
    {
      path: '/orders/:id',
      component: OrderDetail,
      allowedRoles: ['owner', 'manager', 'staff']
    }
  ],
  
  errors: [
    {
      path: '/unauthorized',
      component: Unauthorized
    },
    {
      path: '*',
      component: NotFound
    }
  ]
};

// Combine all routes
const routes = [
  ...routeConfig.public,
  ...routeConfig.owner,
  ...routeConfig.staff,
  ...routeConfig.shared,
  ...routeConfig.errors
].map(route => ({
  ...route,
  protected: route.allowedRoles !== undefined,
  exact: route.exact || false
}));

export default routes;