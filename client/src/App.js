import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import routes from './routes';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StaffManagement from './pages/Staff/StaffManagement';
import OwnerDashboardPage from './pages/Owner/OwnerDashboardPage';
import DashboardRedirect from './components/common/DashboardRedirect';
import StaffDashboard from './pages/Staff/StaffDashboard';
import CustomerDetails from './pages/Customers/CustomerDetails';
import InventoryManagement from './pages/Inventory/InventoryManagement';
import InventoryItem from './pages/Inventory/InventoryItem';
import AddInventoryItem from './pages/Inventory/AddInventoryItem';
import LowStockItems from './pages/Inventory/LowStockItems';
import BatchManagement from './pages/Inventory/BatchManagement';
import StockMovementHistory from './pages/Inventory/StockMovementHistory';
import ReturnsList from './pages/Returns/ReturnsList';
import LoyaltyProgram from './pages/Marketing/LoyaltyProgram';
import CampaignManagement from './pages/Marketing/CampaignManagement';
import ControlCenter from './pages/Owner/ControlCenter';
import EmailCampaigns from './pages/Marketing/EmailCampaigns';
import PurchaseOrders from './pages/Inventory/PurchaseOrders';
import CreatePurchaseOrder from './pages/Inventory/CreatePurchaseOrder';

// Define error components as standalone components
const UnauthorizedPage = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Unauthorized Access</h1>
    <p>You don't have permission to access this resource.</p>
  </div>
);

const NotFoundPage = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

function App() {
  return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

// Debug logger component
const RouteDebugger = () => {
  const location = useLocation();
  const { currentUser, loading } = useAuth();
  
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Route changed:", {
        pathname: location.pathname,
        authState: { 
          user: currentUser ? {
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.role
          } : null, 
          isAuthenticated: !!currentUser,
          loading
        }
      });
    }
  }, [location, currentUser, loading]);
  
  return null;
};

// MainLayout component
const MainLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  // Create state for notifications at this level
  const [notifications, setNotifications] = useState([]);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  
  // Calculate unread notification count
  const unreadNotificationCount = notifications.filter(notif => !notif.read).length;
  
  // Toggle control center
  const toggleControlCenter = () => {
    setControlCenterOpen(!controlCenterOpen);
  };
  
  // Check if this is an auth page
  const isAuthPage = [
    '/', 
    '/owner-login', 
    '/staff-login',
    '/login',
    '/forgot-password'
  ].includes(location.pathname);
  
  // Use auth layout for login/register pages and when not authenticated
  if (isAuthPage || !currentUser) {
    return (
      <div className="auth-layout">
        {children}
      </div>
    );
  }
  
  // Use main layout for authenticated pages
  return (
    <div className="app-container">
      {/* StaffLayout now handles its own Navbar */}
      {!location.pathname.startsWith('/staff') && !location.pathname.startsWith('/inventory') && 
       !location.pathname.startsWith('/products') && !location.pathname.startsWith('/suppliers') && 
       !location.pathname.startsWith('/orders') && !location.pathname.startsWith('/marketing') &&
       !location.pathname.startsWith('/owner/returns') && !location.pathname.startsWith('/owner/inventory/purchase-orders') && (
        <Navbar 
          unreadNotificationCount={unreadNotificationCount}
          onControlCenterToggle={toggleControlCenter}
        />
      )}
      <div className="content-wrapper">
        {/* Only show sidebar on certain pages */}
        {!location.pathname.startsWith('/staff') && !location.pathname.startsWith('/inventory') &&
         !location.pathname.startsWith('/products') && !location.pathname.startsWith('/suppliers') && 
         !location.pathname.startsWith('/orders') && !location.pathname.startsWith('/marketing') &&
         !location.pathname.startsWith('/owner/returns') && !location.pathname.startsWith('/owner/inventory/purchase-orders') && (
          <Sidebar />
        )}
        <main className={location.pathname.startsWith('/staff') || 
                        location.pathname.startsWith('/inventory') ||
                        location.pathname.startsWith('/products') ||
                        location.pathname.startsWith('/suppliers') ||
                        location.pathname.startsWith('/orders') ||
                        location.pathname.startsWith('/marketing') ||
                        location.pathname.startsWith('/owner/returns') ||
                        location.pathname.startsWith('/owner/inventory/purchase-orders')
                        ? '' : 'main-content'}>
          {children}
        </main>
      </div>
    </div>
  );
};

// Function to recursively generate routes from route config
const generateRoutes = (routeConfig) => {
  return routeConfig.map((route) => {
    // Create the route element based on protection status
    const routeElement = route.protected ? (
      <ProtectedRoute
        allowedRoles={route.allowedRoles}
        fallbackPath={route.fallbackPath || '/unauthorized'}
      >
        <route.component />
      </ProtectedRoute>
    ) : (
      <route.component />
    );

    // If this route has children
    if (route.children && route.children.length > 0) {
      return (
        <Route
          key={`route-${route.path}`}
          path={route.path}
          element={routeElement}
        >
          {/* Recursively generate child routes */}
          {generateRoutes(route.children)}
        </Route>
      );
    }

    // Route with no children
    return (
      <Route
        key={`route-${route.path}`}
        path={route.path}
        element={routeElement}
        exact={route.exact}
      />
    );
  });
};

// App content with routes
const AppContent = () => {
  const { loading, currentUser } = useAuth();
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);
  
  // Force rerender when location changes
  useEffect(() => {
    setKey(location.pathname);
  }, [location.pathname]);
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }
  
  return (
    <>
      <RouteDebugger />
      <MainLayout>
        <Routes key={key}>
          {/* Fix for /login redirect */}
          <Route 
            path="/login" 
            element={
              currentUser ? 
                (currentUser.role === 'owner' ? 
                  <Navigate to="/owner/dashboard" replace /> : 
                  <Navigate to="/staff/dashboard" replace />) : 
                <Navigate to="/" replace />
            } 
          />
          
          {/* Generate routes from route config */}
          {generateRoutes(routes)}
          
          {/* Error routes - Using direct components instead of referencing the object */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
    </>
  );
};

export default App;