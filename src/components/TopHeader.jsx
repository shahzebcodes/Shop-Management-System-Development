import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShopData } from '../context/ShopDataContext';

export function TopHeader({ onNavigate, onOpenExpenseModal, onToggleNotificationDrawer, unreadNotificationsCount }) {
  const { currentUser, isShopkeeper, switchRole, logout } = useAuth();
  const { resetToDefaultData, clearAllData } = useShopData();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header
      className="top-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)'
      }}
    >
      {/* Left: Store identity & Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Mobile Logo Mark */}
        <div
          className="mobile-only"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>storefront</span>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text-heading)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentUser?.storeName || 'Al-Madina Super Store'}
            </h2>
            <span
              className="badge badge-green"
              style={{ padding: '1px 6px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span className="pulse-dot pulse-dot-green"></span>
              Live
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_today</span>
              {todayFormatted}
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <button
              onClick={() => switchRole(isShopkeeper ? 'staff' : 'shopkeeper')}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: isShopkeeper ? '#0F766E' : '#2563EB',
                backgroundColor: isShopkeeper ? '#CCFBF1' : '#DBEAFE',
                border: 'none',
                borderRadius: '4px',
                padding: '1px 6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Click to switch role between Shopkeeper & Staff"
            >
              <span>{currentUser.roleTitle}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>swap_horiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions & Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* + Quick POS Sale CTA */}
        <button
          onClick={() => onNavigate('pos')}
          className="btn btn-primary"
          style={{
            height: '38px',
            padding: '0 12px',
            fontSize: '12.5px',
            boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)'
          }}
          title="Open Fast POS Billing Screen"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
          <span className="desktop-only">+ Quick POS Sale</span>
          <span className="mobile-only">POS</span>
        </button>

        {/* + Add Expense CTA (Shopkeeper Only) */}
        {isShopkeeper && (
          <button
            onClick={onOpenExpenseModal}
            className="btn btn-secondary desktop-flex"
            style={{ height: '38px', padding: '0 12px', fontSize: '12.5px' }}
            title="Record Shop Expense"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--danger)' }}>
              receipt_long
            </span>
            <span>+ Add Expense</span>
          </button>
        )}

        {/* Notification Bell with Red Badge */}
        <button
          onClick={onToggleNotificationDrawer}
          className="btn-icon btn-secondary"
          style={{ position: 'relative' }}
          aria-label="View urgent stock and udhaar notifications"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-body)' }}>
            notifications
          </span>
          {unreadNotificationsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                minWidth: '16px',
                height: '16px',
                borderRadius: '9999px',
                backgroundColor: 'var(--danger)',
                color: '#FFFFFF',
                fontSize: '9.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                border: '2px solid #FFFFFF'
              }}
            >
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              background: 'none',
              border: '2px solid var(--border-subtle)',
              borderRadius: '50%',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
            />
          </button>

          {profileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '240px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
                border: '1px solid var(--border-subtle)',
                padding: '8px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-heading)', fontSize: '13px' }}>
                  {currentUser.name}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {currentUser.roleTitle} ({currentUser.phone})
                </span>
              </div>

              <button
                onClick={() => {
                  switchRole(isShopkeeper ? 'staff' : 'shopkeeper');
                  setProfileDropdownOpen(false);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 8px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>
                  swap_horiz
                </span>
                <span>Switch to {isShopkeeper ? 'Staff Account' : 'Shopkeeper (Admin)'}</span>
              </button>

              <button
                onClick={() => {
                  resetToDefaultData();
                  setProfileDropdownOpen(false);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', padding: '6px 8px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--warning)' }}>
                  restart_alt
                </span>
                <span>Reset Demo Store Data</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data and start fresh from zero? All products, sales, customers, suppliers, and expenses will be emptied.')) {
                    clearAllData();
                    setProfileDropdownOpen(false);
                  }
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  fontSize: '12px',
                  padding: '6px 8px',
                  color: 'var(--danger)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--danger)' }}>
                  delete_sweep
                </span>
                <span>Start Fresh (Clear All Demo Data)</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setProfileDropdownOpen(false);
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  fontSize: '12px',
                  padding: '6px 8px',
                  color: 'var(--danger)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
