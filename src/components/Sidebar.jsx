import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useShopData } from '../context/ShopDataContext';

export function Sidebar({ currentModule, onSelectModule, isRail, onToggleRail }) {
  const { currentUser, isShopkeeper, isStaff, switchRole, logout } = useAuth();
  const { products, customers } = useShopData();

  const overdueCount = customers.filter((c) => c.status === 'overdue' && c.currentBalance > 0).length;
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      allowedRoles: ['shopkeeper']
    },
    {
      id: 'pos',
      label: 'POS Billing',
      icon: 'point_of_sale',
      allowedRoles: ['shopkeeper', 'staff'],
      badge: 'F1',
      badgeClass: 'badge-teal'
    },
    {
      id: 'inventory',
      label: 'Products & Stock',
      icon: 'inventory_2',
      allowedRoles: ['shopkeeper', 'staff'],
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeClass: 'badge-red'
    },
    {
      id: 'khata',
      label: 'Customer Khata',
      icon: 'menu_book',
      allowedRoles: ['shopkeeper', 'staff'],
      badge: overdueCount > 0 ? `${overdueCount} due` : null,
      badgeClass: 'badge-amber'
    },
    {
      id: 'purchases',
      label: 'Stock-In Purchases',
      icon: 'local_shipping',
      allowedRoles: ['shopkeeper']
    },
    {
      id: 'suppliers',
      label: 'Suppliers Ledger',
      icon: 'badge',
      allowedRoles: ['shopkeeper']
    },
    {
      id: 'expenses',
      label: 'Expenses Tracker',
      icon: 'receipt_long',
      allowedRoles: ['shopkeeper']
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: 'category',
      allowedRoles: ['shopkeeper']
    },
    {
      id: 'units',
      label: 'Units & Conversion',
      icon: 'straighten',
      allowedRoles: ['shopkeeper']
    },
    {
      id: 'reports',
      label: 'Profit & Reports',
      icon: 'query_stats',
      allowedRoles: ['shopkeeper']
    },
    {
      id: 'staff_access',
      label: 'Cashier Access',
      icon: 'badge',
      allowedRoles: ['shopkeeper'],
      badge: 'Security',
      badgeClass: 'badge-teal'
    }
  ];

  const visibleItems = menuItems.filter((item) => {
    // 1. Must be allowed for the user's role
    if (!item.allowedRoles.includes(currentUser?.role)) {
      return false;
    }

    // 2. If user is Staff, strictly check their granular permissions
    if (currentUser?.role === 'staff') {
      if (item.id === 'pos') {
        return currentUser?.permissions?.pos !== false;
      }
      if (item.id === 'inventory') {
        return Boolean(currentUser?.permissions?.inventory);
      }
      if (item.id === 'khata') {
        return Boolean(currentUser?.permissions?.khata);
      }
      return false;
    }

    return true;
  });

  return (
    <aside
      className={`sidebar-container desktop-only ${isRail ? 'is-rail' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: isRail ? 'var(--sidebar-rail-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--nav-bg)',
        borderRight: '1px solid var(--nav-border)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none'
      }}
    >
      {/* Brand & Store Header */}
      <div
        style={{
          height: 'var(--header-height-desktop)',
          display: 'flex',
          alignItems: 'center',
          padding: isRail ? '0 12px' : '0 18px',
          borderBottom: '1px solid #1E293B',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#0F766E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(15, 118, 110, 0.4)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>storefront</span>
        </div>

        {!isRail && (
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '-0.3px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                DukaanKhata
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  backgroundColor: isShopkeeper ? '#0F766E' : '#2563EB',
                  color: '#FFFFFF',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}
              >
                {isShopkeeper ? 'PRO' : 'STAFF'}
              </span>
            </div>
            <p
              style={{
                color: '#94A3B8',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                margin: 0
              }}
            >
              {currentUser?.storeName || 'Al-Madina Super Store'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isRail ? '12px 8px' : '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        {visibleItems.map((item) => {
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              title={isRail ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isRail ? '10px 0' : '10px 14px',
                justifyContent: isRail ? 'center' : 'flex-start',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : '#94A3B8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                textAlign: 'left',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#1E293B';
                  e.currentTarget.style.color = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '20px',
                  color: isActive ? '#FFFFFF' : '#94A3B8'
                }}
              >
                {item.icon}
              </span>

              {!isRail && (
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}

              {!isRail && item.badge && (
                <span
                  className={`badge ${item.badgeClass || 'badge-neutral'}`}
                  style={{ fontSize: '10px', padding: '1px 6px' }}
                >
                  {item.badge}
                </span>
              )}

              {isRail && item.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: item.badgeClass === 'badge-red' ? '#DC2626' : '#D97706'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Role Switcher & Bottom Toolbar */}
      <div
        style={{
          padding: isRail ? '12px 8px' : '14px',
          borderTop: '1px solid #1E293B',
          backgroundColor: '#0B1120'
        }}
      >
        {!isRail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* User Info Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#1E293B'
              }}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectCover: 'cover'
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    color: '#F8FAFC',
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currentUser.name}
                </p>
                <span style={{ color: '#94A3B8', fontSize: '10.5px' }}>
                  {currentUser.roleTitle}
                </span>
              </div>
            </div>

            {/* Quick Role Toggle Button */}
            <button
              onClick={() => switchRole(isShopkeeper ? 'staff' : 'shopkeeper')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: '#1E293B',
                color: '#CBD5E1',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Click to test Shopkeeper vs Staff view restrictions"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#0F766E' }}>
                sync_alt
              </span>
              <span>Switch to {isShopkeeper ? 'Staff View' : 'Admin View'}</span>
            </button>

            {/* Collapse Rail Button */}
            <button
              onClick={onToggleRail}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>menu_open</span>
              <span>Collapse Sidebar</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onToggleRail}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#1E293B',
                border: 'none',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Expand Sidebar"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
