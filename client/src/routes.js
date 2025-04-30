import UserTypeSelection from './pages/Auth/UserTypeSelection';
import OwnerLogin from './pages/Auth/OwnerLogin';
import StaffLogin from './pages/Auth/StaffLogin';
import StaffDashboard from './pages/Staff/StaffDashboard';
import OwnerDashboardPage from './pages/Owner/OwnerDashboardPage';
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
import StoreSettings from './pages/Owner/StoreSettings';
import OwnerAccountSettings from './pages/Owner/OwnerAccountSettings';
import StaffManagement from './pages/Staff/StaffManagement';
import FinancialDashboard from './pages/Financial/FinancialDashboard';
import CustomerManagement from './pages/Customers/CustomerManagement'; // Add this import
// import CustomerList from './pages/Customers/CustomerList';
import CustomerDetails from './pages/Customers/CustomerDetails';

// Import the error components that already exist in your project
import NotFound from './components/common/NotFound';
import Unauthorized from './components/common/Unauthorized';

/**
 * Routes configuration object
 * Each route defines a path, component, and permissions
 */
const routes = [
  // Auth routes
  {
    path: '/',
    component: UserTypeSelection,
    exact: true,
    protected: false
  },
  {
    path: '/owner-login',
    component: OwnerLogin,
    exact: true,
    protected: false
  },
  {
    path: '/staff-login',
    component: StaffLogin,
    exact: true,
    protected: false
  },
  {
    path: '/forgot-password',
    component: ForgotPassword,
    exact: true,
    protected: false
  },
  
  // Dashboard routes
  {
    path: '/dashboard',
    component: null, // This will be handled by the DashboardRedirect component
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/owner/dashboard',
    component: OwnerDashboardPage,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/staff/dashboard',
    component: StaffDashboard,
    exact: true, 
    protected: true,
    allowedRoles: ['manager', 'staff']
  },

  // Customer management routes
   {
    path: '/owner/customers',
    component: <CustomerManagement />,
    exact: true, 
    protected: true,
    allowedRoles: ['owner']
  },
  // {
  //   path: '/customers',
  //   component: <CustomerList />,
  //   exact: true,
  //   protected: true,
  //   allowedRoles: ['owner', 'manager', 'staff']
  // },
  {
    path: '/customers/:id',
    component: <CustomerDetails />,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  
  // Staff management routes
  {
    path: '/staff/management',
    component: StaffManagement,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager']
  },
  
  // Inventory routes
  {
    path: '/inventory',
    component: InventoryList,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/inventory/add',
    component: AddInventoryItem,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager']
  },
  {
    path: '/inventory/:id',
    component: InventoryItem,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  
  // Product routes
  {
    path: '/products',
    component: ProductList,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/products/:id',
    component: ProductDetails,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  
  // Supplier routes
  {
    path: '/suppliers',
    component: SupplierList,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager']
  },
  {
    path: '/suppliers/:id',
    component: SupplierDetail,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager']
  },
  
  // Order routes
  {
    path: '/orders',
    component: OrderList,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/orders/:id',
    component: OrderDetail,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  
  // Settings routes
  {
    path: '/settings',
    component: StoreSettings,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/account-settings',
    component: OwnerAccountSettings,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/owner/financial',
    component: FinancialDashboard,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  
  // Error routes
  {
    path: '/unauthorized',
    component: Unauthorized,
    exact: true,
    protected: false
  },
  {
    path: '*',
    component: NotFound,
    protected: false
  }
];

export default routes;