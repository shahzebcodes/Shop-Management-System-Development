import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShopData } from '../context/ShopDataContext';

export function MobileBottomNav({ currentModule, onSelectModule, onOpenExpenseModal }) {
  const { currentUser, isShopkeeper, switchRole, logout } = useAuth();
  const { customers, products } = useShopData();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  // Total Udhaar outstanding for Khata tab badge
  const totalUdhaar = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
  const udhaarBadge = totalUdhaar > 0 ? `Rs. ${(totalUdhaar / 1000).toFixed(0)}k` : null;

  const handleTabClick = (moduleId) => {
    if (moduleId === 'more') {
      setMoreDrawerOpen(true);
    } else {
      onSelectModule(moduleId);
      setMoreDrawerOpen(false);
    }
  };

  const moreMenuItems = [
    { id: 'purchases', label: 'Stock-In Purchases', icon: 'local_shipping', shopkeeperOnly: true },
    { id: 'suppliers', label: 'Suppliers Ledger', icon: 'badge', shopkeeperOnly: true },
    { id: 'expenses', label: 'Expenses Tracker', icon: 'receipt_long', shopkeeperOnly: true },
    { id: 'categories', label: 'Categories Manager', icon: 'category', shopkeeperOnly: true },
    { id: 'units', label: 'Units & Conversion', icon: 'straighten', shopkeeperOnly: true },
    { id: 'reports', label: 'Profit Waterfall & Reports', icon: 'query_stats', shopkeeperOnly: true }
  ];

  const visibleMoreItems = moreMenuItems.filter((item) =>
    item.shopkeeperOnly ? isShopkeeper : true
  );

  return (
    <>
      <nav
        className="mobile-bottom-nav mobile-only"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'var(--bottom-nav-height)',
          backgroundColor: 'var(--nav-bg)',
          borderTop: '1px solid #1E293B',
          zIndex: 50,
          boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 4px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {/* 1. Dashboard Tab */}
        <button
          onClick={() => handleTabClick(isShopkeeper ? 'dashboard' : 'pos')}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: currentModule === 'dashboard' ? 'var(--primary-light)' : '#94A3B8',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              color: currentModule === 'dashboard' ? '#14B8A6' : '#94A3B8'
            }}
          >
            dashboard
          </span>
          <span style={{ fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>
            {isShopkeeper ? 'Home' : 'POS'}
          </span>
        </button>

        {/* 2. POS Billing Tab (Elevated Center CTA) */}
        <button
          onClick={() => handleTabClick('pos')}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            marginTop: '-12px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: currentModule === 'pos' ? '#0F766E' : '#1E293B',
              border: '2px solid #0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>point_of_sale</span>
          </div>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              marginTop: '3px',
              color: currentModule === 'pos' ? '#14B8A6' : '#94A3B8'
            }}
          >
            POS
          </span>
        </button>

        {/* 3. Inventory Stock Tab */}
        <button
          onClick={() => handleTabClick('inventory')}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: currentModule === 'inventory' ? 'var(--primary-light)' : '#94A3B8',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              color: currentModule === 'inventory' ? '#14B8A6' : '#94A3B8'
            }}
          >
            inventory_2
          </span>
          <span style={{ fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>
            Stock
          </span>
        </button>

        {/* 4. Khata Ledger Tab */}
        <button
          onClick={() => handleTabClick('khata')}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: currentModule === 'khata' ? 'var(--primary-light)' : '#94A3B8',
            cursor: 'pointer',
            padding: '4px 0',
            position: 'relative'
          }}
        >
          <div style={{ position: 'relative' }}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '22px',
                color: currentModule === 'khata' ? '#14B8A6' : '#94A3B8'
              }}
            >
              menu_book
            </span>
            {udhaarBadge && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-14px',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {udhaarBadge}
              </span>
            )}
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>
            Khata
          </span>
        </button>

        {/* 5. More Hub Tab */}
        <button
          onClick={() => handleTabClick('more')}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: moreDrawerOpen ? 'var(--primary-light)' : '#94A3B8',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              color: moreDrawerOpen ? '#14B8A6' : '#94A3B8'
            }}
          >
            grid_view
          </span>
          <span style={{ fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>
            More
          </span>
        </button>
      </nav>

      {/* Slide-Up Mobile "More" Hub Drawer */}
      {moreDrawerOpen && (
        <div
          className="modal-overlay mobile-only"
          onClick={() => setMoreDrawerOpen(false)}
          style={{ alignItems: 'flex-end', padding: 0 }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              padding: '1.25rem',
              backgroundColor: '#FFFFFF',
              maxHeight: '85vh',
              animation: 'slideUpDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Grabber */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', backgroundColor: '#CBD5E1' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  Shop Management Hub
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Logged in as {currentUser.name} ({currentUser.roleTitle})
                </span>
              </div>
              <button
                onClick={() => setMoreDrawerOpen(false)}
                className="btn-icon btn-secondary"
                style={{ width: '32px', height: '32px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            {/* Quick Role Switcher Chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#F1F5F9',
                borderRadius: '10px',
                marginBottom: '1rem'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Active Role</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {currentUser.roleTitle}
                </span>
              </div>
              <button
                onClick={() => switchRole(isShopkeeper ? 'staff' : 'shopkeeper')}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                Switch to {isShopkeeper ? 'Staff' : 'Admin'}
              </button>
            </div>

            {/* Grid of Menu Modules */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '1rem' }}>
              {visibleMoreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectModule(item.id);
                    setMoreDrawerOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#F0FDFA',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Shopkeeper Add Expense trigger */}
            {isShopkeeper && (
              <button
                onClick={() => {
                  setMoreDrawerOpen(false);
                  onOpenExpenseModal();
                }}
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '0.75rem', padding: '10px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--danger)' }}>
                  receipt_long
                </span>
                <span>+ Record Shop Expense</span>
              </button>
            )}

            {/* Logout button */}
            <button
              onClick={() => {
                setMoreDrawerOpen(false);
                logout();
              }}
              className="btn btn-secondary"
              style={{ width: '100%', color: 'var(--danger)', padding: '10px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
