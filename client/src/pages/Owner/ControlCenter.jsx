import {
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Inventory as PackageIcon,
  LocalShipping as TruckIcon,
  AttachMoney as DollarSignIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';

const ControlCenter = ({ 
  isOpen,
  stats, 
  notifications, 
  onClose, 
  onMarkAllRead, 
  unreadNotificationCount 
}) => {
  return (
    <>
      <div 
        className={`control-center-overlay ${isOpen ? 'visible' : ''}`} 
        onClick={onClose}
      />
      <div className={`control-center-drawer ${isOpen ? 'open' : ''}`}>
        <div className="control-center-header">
          <h2 className="control-center-title">
            <DashboardIcon fontSize="small" />
            <span>Control Center</span>
          </h2>
          <button onClick={onClose} className="close-button">
            <CloseIcon />
          </button>
        </div>

        <h3 className="section-title">Quick Stats Overview</h3>

        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-card-header">
              <PeopleIcon fontSize="small" />
              <span>Staff Members</span>
            </div>
            <div className="stats-card-value">{stats.staffCount}</div>
            <div className="stats-card-change positive">
              <ArrowUpIcon fontSize="small" />
              <span>+2 this month</span>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-card-header">
              <PackageIcon fontSize="small" />
              <span>Active Products</span>
            </div>
            <div className="stats-card-value">{stats.activeProducts}</div>
            <div className="stats-card-change positive">
              <ArrowUpIcon fontSize="small" />
              <span>+15 this month</span>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-card-header">
              <TruckIcon fontSize="small" />
              <span>Pending Orders</span>
            </div>
            <div className="stats-card-value">{stats.pendingOrders}</div>
            <div className="stats-card-change negative">
              <ArrowDownIcon fontSize="small" />
              <span>-3 since yesterday</span>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-card-header">
              <DollarSignIcon fontSize="small" />
              <span>Monthly Revenue</span>
            </div>
            <div className="stats-card-value">${stats.revenue.toLocaleString()}</div>
            <div className="stats-card-change positive">
              <ArrowUpIcon fontSize="small" />
              <span>+12% vs last month</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        <div className="action-buttons">
          <button className="action-button">
            <TruckIcon fontSize="small" />
            <span>Process Orders</span>
          </button>
          <button className="action-button">
            <PackageIcon fontSize="small" />
            <span>Update Stock</span>
          </button>
          <button className="action-button">
            <BarChartIcon fontSize="small" />
            <span>View Reports</span>
          </button>
        </div>

        <div className="section-divider" />

        <div className="notification-section">
          <div className="notification-header">
            <h3 className="section-title">
              <NotificationsIcon fontSize="small" />
              <span>Notifications ({notifications.length})</span>
            </h3>
            <div className="notification-actions">
              <button 
                className="mark-read-button"
                onClick={onMarkAllRead} 
                disabled={unreadNotificationCount === 0}
              >
                Mark all read
              </button>
              <button className="icon-button">
                <RefreshIcon fontSize="small" />
              </button>
              <button className="icon-button">
                <SettingsIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.type}`}
              >
                <p className="notification-text">{notification.text}</p>
                <p className="notification-time">{notification.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ControlCenter;