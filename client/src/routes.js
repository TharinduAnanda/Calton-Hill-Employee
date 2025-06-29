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
import FinancialDashboard from './pages/Reports/FinancialDashboard';
import CustomerManagement from './pages/Customers/CustomerManagement';
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
import PurchaseOrders from './pages/Inventory/PurchaseOrders';
import CreatePurchaseOrder from './pages/Inventory/CreatePurchaseOrder';
import ReturnsList from './pages/Returns/ReturnsList';
import NotFound from './components/common/NotFound';
import Unauthorized from './components/common/Unauthorized';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import SupplierForm from './pages/Suppliers/SupplierForm';
import ProductsPage from './pages/Products/ProductsPage';
import StaffLayout from './layouts/StaffLayout';
import OwnerLayout from './layouts/OwnerLayout';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import TurnoverReportPage from './pages/Reports/TurnoverReportPage';

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
    path: '/staff',
    component: StaffLayout,
    protected: true,
    allowedRoles: ['manager', 'staff'],
    children: [
      {
        path: 'dashboard',
        component: StaffDashboard,
        exact: true,
        protected: true,
        allowedRoles: ['manager', 'staff']
      },
      {
        path: 'management',
        component: StaffManagement,
        exact: true, 
        protected: true,
        allowedRoles: ['owner', 'manager']
      },
      {
        path: 'settings',
        component: StaffDashboard,
        exact: true,
        protected: true,
        allowedRoles: ['manager']
      },
      {
        path: 'tasks',
        component: StaffDashboard,
        exact: true,
        protected: true,
        allowedRoles: ['manager', 'staff']
      },
      {
        path: 'marketing',
        component: StaffDashboard,
        exact: true,
        protected: true,
        allowedRoles: ['manager']
      }
    ]
  },
  
  {
    path: '/owner/customers',
    component: CustomerManagement,
    exact: true, 
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/customers/:id',
    component: CustomerDetails,
    exact: true,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff']
  },
  
  {
    path: '/inventory',
    component: StaffLayout,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff'],
    children: [
      {
        path: '',
        component: InventoryList,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager', 'staff']
      },
      {
        path: 'add',
        component: AddInventoryItem,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager']
      },
      {
        path: ':id',
        component: InventoryItem,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager', 'staff']
      },
      {
        path: 'low-stock',
        component: LowStockItems,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager']
      }
    ]
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
    component: StaffLayout,
    protected: true,
    allowedRoles: ['owner', 'manager'],
    children: [
      {
        path: '',
        component: LowStockItems,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager']
      }
    ]
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
  
  {
    path: '/owner/inventory/purchase-orders',
    component: OwnerLayout,
    protected: true,
    allowedRoles: ['owner', 'manager'],
    children: [
      {
        path: '',
        component: PurchaseOrders,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager']
      },
      {
        path: 'create',
        component: CreatePurchaseOrder,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager']
      },
      {
        path: ':id',
        component: CreatePurchaseOrder,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager']
      }
    ]
  },
  
  {
    path: '/products/*',
    component: StaffLayout,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff'],
    children: [
      {
        path: '*',
        component: ProductsPage,
        protected: true,
        allowedRoles: ['owner', 'manager', 'staff']
      }
    ]
  },
  
  {
    path: '/suppliers',
    component: StaffLayout,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff'],
    children: [
      {
        path: '',
        component: SuppliersPage,
        protected: true,
        allowedRoles: ['owner', 'manager', 'staff']
      },
      {
        path: ':id',
        component: SupplierDetail,
        protected: true,
        allowedRoles: ['owner', 'manager', 'staff']
      },
      {
        path: 'add',
        component: SupplierForm,
        protected: true,
        allowedRoles: ['owner', 'manager']
      },
      {
        path: 'edit/:id',
        component: SupplierForm,
        protected: true,
        allowedRoles: ['owner', 'manager']
      }
    ]
  },
  
  {
    path: '/orders',
    component: StaffLayout,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff'],
    children: [
      {
        path: '',
        component: OrderList,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager', 'staff']
      },
      {
        path: ':id',
        component: OrderDetail,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager', 'staff']
      }
    ]
  },
  
  {
    path: '/sales',
    component: StaffLayout,
    protected: true,
    allowedRoles: ['owner', 'manager', 'staff'],
    children: [
      {
        path: '',
        component: OrderList,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager', 'staff']
      }
    ]
  },
  
  {
    path: '/owner/returns',
    component: StaffLayout,
    protected: true,
    allowedRoles: ['owner', 'manager'],
    children: [
      {
        path: '',
        component: ReturnsList,
        exact: true,
        protected: true,
        allowedRoles: ['owner', 'manager']
      }
    ]
  },
  
  {
    path: '/marketing',
    component: StaffLayout,
    protected: true,
    allowedRoles: ['manager'],
    children: [
      {
        path: 'dashboard',
        component: MarketingDashboard,
        exact: true,
        protected: true,
        allowedRoles: ['manager']
      },
      {
        path: 'email',
        component: EmailCampaigns,
        exact: true,
        protected: true,
        allowedRoles: ['manager']
      },
      {
        path: 'campaigns',
        component: CampaignManagement,
        exact: true,
        protected: true,
        allowedRoles: ['manager']
      },
      {
        path: 'loyalty',
        component: LoyaltyProgram,
        exact: true,
        protected: true,
        allowedRoles: ['manager']
      },
      {
        path: 'promotions',
        component: PromotionsManager,
        exact: true,
        protected: true,
        allowedRoles: ['manager']
      },
      {
        path: 'analytics',
        component: MarketingAnalytics,
        exact: true,
        protected: true,
        allowedRoles: ['manager']
      }
    ]
  },
  
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
    component: OwnerLayout,
    protected: true,
    allowedRoles: ['owner'],
    children: [
      {
        path: '',
        component: FinancialDashboard,
        exact: true,
        protected: true,
        allowedRoles: ['owner']
      }
    ]
  },
  
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

  // Owner-specific marketing routes - these will preserve owner navigation context
  {
    path: '/owner/marketing',
    component: OwnerLayout,
    protected: true,
    allowedRoles: ['owner'],
    children: [
      {
        path: 'dashboard',
        component: MarketingDashboard,
        exact: true,
        protected: true,
        allowedRoles: ['owner']
      },
      {
        path: 'email',
        component: EmailCampaigns,
        exact: true,
        protected: true,
        allowedRoles: ['owner']
      },
      {
        path: 'campaigns',
        component: CampaignManagement,
        exact: true,
        protected: true,
        allowedRoles: ['owner']
      },
      {
        path: 'loyalty',
        component: LoyaltyProgram,
        exact: true,
        protected: true,
        allowedRoles: ['owner']
      },
      {
        path: 'promotions',
        component: PromotionsManager,
        exact: true,
        protected: true,
        allowedRoles: ['owner']
      },
      {
        path: 'analytics',
        component: MarketingAnalytics,
        exact: true,
        protected: true,
        allowedRoles: ['owner']
      }
    ]
  },

  // Add Reports routes
  {
    path: '/owner/reports',
    component: ReportsDashboard,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/owner/reports/turnover',
    component: TurnoverReportPage,
    exact: true,
    protected: true,
    allowedRoles: ['owner']
  },
  {
    path: '/owner/reports/financial',
    component: OwnerLayout,
    protected: true,
    allowedRoles: ['owner'],
    children: [
      {
        path: '',
        component: FinancialDashboard,
        exact: true,
        protected: true,
        allowedRoles: ['owner']
      }
    ]
  },
];

routes.forEach(route => {
  if (!route.component) {
    console.error(`Route configuration error: ${route.path} has no component defined`);
  }
});

export default routes;