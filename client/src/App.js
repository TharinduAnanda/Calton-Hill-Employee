import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import routes from './routes';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/common/Sidebar';
import ThemeProviderWrapper from './components/ThemeProvider/ThemeProviderWrapper';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ErrorComponents = {
  Unauthorized: () => (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Unauthorized Access</h1>
      <p>You don't have permission to access this resource.</p>
    </div>
  ),
  NotFound: () => (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  )
};

// Removed the unused RootRedirect component

function App() {
  return (
    <ThemeProviderWrapper>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProviderWrapper>
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
  
  // Check if this is an auth page
  const isAuthPage = [
    '/', 
    '/owner-login', 
    '/staff-login',
    '/login', // Added '/login' to the auth pages
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
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// App content with routes
const AppContent = () => {
  const { loading, currentUser } = useAuth();
  
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
        <Routes>
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
          
          {/* Public routes */}
          {routes
            .filter(route => !route.protected)
            .map((route, index) => (
              <Route
                key={`public-${index}`}
                path={route.path}
                element={<route.component />}
              />
            ))}
          
          {/* Protected routes */}
          {routes
            .filter(route => route.protected)
            .map((route, index) => (
              <Route
                key={`protected-${index}`}
                path={route.path}
                element={
                  <ProtectedRoute 
                    allowedRoles={route.allowedRoles}
                    fallbackPath={route.fallbackPath || '/unauthorized'}
                  >
                    <route.component />
                  </ProtectedRoute>
                }
              />
            ))}
          
          {/* Error routes */}
          <Route path="/unauthorized" element={<ErrorComponents.Unauthorized />} />
          <Route path="*" element={<ErrorComponents.NotFound />} />
        </Routes>
      </MainLayout>
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
};

export default App;