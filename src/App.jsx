import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopDataProvider, useShopData } from './context/ShopDataContext';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AddExpenseModal } from './components/AddExpenseModal';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Khata } from './pages/Khata';
import { Purchases } from './pages/Purchases';
import { Suppliers } from './pages/Suppliers';
import { Expenses } from './pages/Expenses';
import { Categories } from './pages/Categories';
import { Units } from './pages/Units';
import { Reports } from './pages/Reports';
import { StaffAccess } from './pages/StaffAccess';

function AppContent() {
  const { isAuthenticated, isShopkeeper, isStaff, currentUser } = useAuth();
  const { toast, customers, products } = useShopData();

  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isSidebarRail, setIsSidebarRail] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Cross-module linking state
  const [activeKhataCustId, setActiveKhataCustId] = useState(null);
  const [activePurchaseProdId, setActivePurchaseProdId] = useState(null);

  // If user is Staff, restrict access to their specifically allowed modules
  useEffect(() => {
    if (isStaff) {
      const allowed = ['pos'];
      if (currentUser?.permissions?.inventory) allowed.push('inventory');
      if (currentUser?.permissions?.khata) allowed.push('khata');
      if (!allowed.includes(currentModule)) {
        setCurrentModule('pos');
      }
    }
  }, [isStaff, currentModule, currentUser]);

  // When switching to POS screen on desktop, auto-collapse sidebar to 72px rail for countertop view
  useEffect(() => {
    if (currentModule === 'pos') {
      setIsSidebarRail(true);
    } else {
      setIsSidebarRail(false);
    }
  }, [currentModule]);

  // Total urgent notifications count (Overdue customers + Low stock items)
  const overdueCount = customers.filter((c) => c.status === 'overdue' && c.currentBalance > 0).length;
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;
  const totalAlertsCount = overdueCount + lowStockCount;

  // Cross-module navigation helpers
  const handleNavigateToKhata = (customerId = null) => {
    if (customerId) setActiveKhataCustId(customerId);
    setCurrentModule('khata');
    setNotificationDrawerOpen(false);
  };

  const handleNavigateToPurchases = (productId = null) => {
    if (productId) setActivePurchaseProdId(productId);
    setCurrentModule('purchases');
    setNotificationDrawerOpen(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={(target) => setCurrentModule(target)} />;
  }

  return (
    <div className="app-shell">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="toast-notice" style={{ borderLeft: `4px solid ${toast.type === 'danger' ? 'var(--danger)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}` }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: toast.type === 'danger' ? '#F87171' : toast.type === 'warning' ? '#FBBF24' : '#2DD4BF' }}>
            {toast.type === 'danger' ? 'error' : toast.type === 'warning' ? 'warning' : 'check_circle'}
          </span>
          <span style={{ fontSize: '13px' }}>{toast.message}</span>
        </div>
      )}

      {/* Desktop Fixed Collapsible Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        isRail={isSidebarRail}
        onToggleRail={() => setIsSidebarRail(!isSidebarRail)}
      />

      {/* Main Content Workspace */}
      <div className={`main-content-wrapper ${isSidebarRail ? 'with-sidebar-rail' : 'with-sidebar'}`}>
        {/* Sticky Top Header */}
        <TopHeader
          onNavigate={(mod) => setCurrentModule(mod)}
          onOpenExpenseModal={() => setExpenseModalOpen(true)}
          onToggleNotificationDrawer={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
          unreadNotificationsCount={totalAlertsCount}
        />

        {/* Workspace Views */}
        <main style={{ flex: 1, position: 'relative' }}>
          {currentModule === 'dashboard' && isShopkeeper && (
            <Dashboard
              onNavigate={(mod) => setCurrentModule(mod)}
              onOpenExpenseModal={() => setExpenseModalOpen(true)}
              onNavigateToKhata={handleNavigateToKhata}
              onNavigateToPurchases={handleNavigateToPurchases}
            />
          )}

          {currentModule === 'pos' && (
            <POS onNavigateToKhata={() => setCurrentModule('khata')} />
          )}

          {currentModule === 'inventory' && (
            <Inventory onNavigateToPurchases={handleNavigateToPurchases} />
          )}

          {currentModule === 'khata' && (
            <Khata initialCustomerId={activeKhataCustId} />
          )}

          {currentModule === 'purchases' && isShopkeeper && (
            <Purchases defaultProductId={activePurchaseProdId} />
          )}

          {currentModule === 'suppliers' && isShopkeeper && (
            <Suppliers />
          )}

          {currentModule === 'expenses' && isShopkeeper && (
            <Expenses />
          )}

          {currentModule === 'categories' && isShopkeeper && (
            <Categories />
          )}

          {currentModule === 'units' && isShopkeeper && (
            <Units />
          )}

          {currentModule === 'reports' && isShopkeeper && (
            <Reports />
          )}

          {currentModule === 'staff_access' && isShopkeeper && (
            <StaffAccess />
          )}
        </main>

        {/* Desktop Keyboard Shortcuts Helper Strip */}
        <div
          className="desktop-only desktop-shortcut-bar"
          style={{
            padding: '6px 1.5rem',
            backgroundColor: '#0F172A',
            color: '#94A3B8',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #1E293B',
            marginTop: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span><strong>Keyboard Shortcuts:</strong></span>
            <span><span className="kbd-chip">F2</span> Focus Search / Barcode</span>
            <span><span className="kbd-chip">F4</span> Cash Checkout</span>
            <span><span className="kbd-chip">F8</span> Udhaar Credit</span>
            <span><span className="kbd-chip">Ctrl+P</span> Print Thermal Bill</span>
          </div>
          <div>
            <span>DukaanKhata Retail v2.4 • {currentUser?.storeName || 'Al-Madina Super Store'}</span>
          </div>
        </div>

        {/* Mobile 5-Tab Bottom Navigation */}
        <MobileBottomNav
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
          onOpenExpenseModal={() => setExpenseModalOpen(true)}
        />
      </div>

      {/* Action Notification Drawer (Overdue Udhaar & Low Stock Replenishment) */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onNavigateToKhata={handleNavigateToKhata}
        onNavigateToPurchases={handleNavigateToPurchases}
      />

      {/* Global Add Expense Modal */}
      <AddExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ShopDataProvider>
        <AppContent />
      </ShopDataProvider>
    </AuthProvider>
  );
}
