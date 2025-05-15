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
import DashboardRedirect from './components/common/DashboardRedirect';
import InventoryManagement from './pages/Inventory/InventoryManagement';
import LowStockItems from './pages/Inventory/LowStockItems';
import BatchManagement from './pages/Inventory/BatchManagement';
import StockMovementHistory from './pages/Inventory/StockMovementHistory';
import MarketingDashboard from './pages/Marketing/MarketingDashboard';
import EmailCampaigns from './pages/Marketing/EmailCampaigns';
import CampaignManagement from './pages/Marketing/CampaignManagement';
import LoyaltyProgram from './pages/Marketing/LoyaltyProgram';
import PromotionsManager from './pages/Marketing/PromotionsManager';
import MarketingAnalytics from './pages/Marketing/MarketingAnalytics';


// Keep only the ReturnsList import:
import ReturnsList from './pages/Returns/ReturnsList';

// Import the error components that already exist in your project
import NotFound from './components/common/NotFound';
import Unauthorized from './components/common/Unauthorized';

// Add these imports at the top of the file
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import SupplierForm from './pages/Suppliers/SupplierForm';

// Add this import for ProductsPage
import ProductsPage from './pages/Products/ProductsPage';

// Example check
const routes = [
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
  component: DashboardRedirect,
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
  component: CustomerManagement, // CORRECT: Component reference
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
  component: CustomerDetails, // CORRECT: Component reference
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
  {
    path: '/owner/inventory',
    component: InventoryManagement,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/owner/inventory/:id',
    component: InventoryItem,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/owner/inventory/add',
    component: AddInventoryItem,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/owner/inventory/low-stock',
    component: LowStockItems,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/owner/inventory/batch/:productId',
    component: BatchManagement,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/owner/inventory/stock-movement',
    component: StockMovementHistory,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  
  // Product routes
  {
    path: '/products/*',  // <-- Add wildcard to match all sub-paths
    component: ProductsPage,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  
  // Supplier routes
  {
    path: '/suppliers',
    component: SuppliersPage,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/suppliers/:id',
    component: SupplierDetail,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  {
    path: '/suppliers/add',
    component: SupplierForm,
    protected: true,
    allowedRoles: ['owner', 'manager']
  },
  {
    path: '/suppliers/edit/:id',
    component: SupplierForm,
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
  
  // Returns routes
  {
    path: '/owner/returns',
    component: ReturnsList,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager']
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
  },

  {
  path: '/marketing/dashboard',
  component: MarketingDashboard,
  exact: true,
  protected: true,
  allowedRoles: ['owner', 'manager']
},
{
  path: '/marketing/email',
  component: EmailCampaigns,
  exact: true,
  protected: true,
  allowedRoles: ['owner', 'manager']
},
{
  path: '/marketing/campaigns',
  component: CampaignManagement,
  exact: true,
  protected: true,
  allowedRoles: ['owner', 'manager']
},
{
  path: '/marketing/loyalty',
  component: LoyaltyProgram,
  exact: true,
  protected: true,
  allowedRoles: ['owner', 'manager']
},
{
  path: '/marketing/promotions',
  component: PromotionsManager,
  exact: true,
  protected: true,
  allowedRoles: ['owner', 'manager']
},


{
  path: '/marketing/analytics',
  component: MarketingAnalytics,
  exact: true,
  protected: true,
  allowedRoles: ['owner', 'manager']
}

];

// Add this validation
routes.forEach(route => {
  if (!route.component) {
    console.error(`Route configuration error: ${route.path} has no component defined`);
  }
});

export default routes;