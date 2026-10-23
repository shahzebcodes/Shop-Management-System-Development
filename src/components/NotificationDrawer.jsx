import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function NotificationDrawer({ isOpen, onClose, onNavigateToKhata, onNavigateToPurchases }) {
  const { customers, products } = useShopData();
  const [activeTab, setActiveTab] = useState('overdue'); // 'overdue' | 'lowstock'

  if (!isOpen) return null;

  const overdueCustomers = customers.filter(
    (c) => c.status === 'overdue' && c.currentBalance > 0
  );

  const lowStockItems = products.filter(
    (p) => p.currentStock <= p.minStock
  );

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--danger)' }}>
              notifications_active
            </span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>
              Action Alerts
            </h3>
            <span className="badge badge-red" style={{ fontSize: '11px' }}>
              {overdueCustomers.length + lowStockItems.length} Urgent
            </span>
          </div>
          <button onClick={onClose} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#F8FAFC' }}>
          <button
            onClick={() => setActiveTab('overdue')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              borderBottom: activeTab === 'overdue' ? '2px solid var(--warning)' : '2px solid transparent',
              backgroundColor: activeTab === 'overdue' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'overdue' ? 'var(--warning-text)' : 'var(--text-muted)',
              fontWeight: activeTab === 'overdue' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--warning)' }}>
              menu_book
            </span>
            <span>Overdue Udhaar ({overdueCustomers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lowstock')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              borderBottom: activeTab === 'lowstock' ? '2px solid var(--danger)' : '2px solid transparent',
              backgroundColor: activeTab === 'lowstock' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'lowstock' ? 'var(--danger-text)' : 'var(--text-muted)',
              fontWeight: activeTab === 'lowstock' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--danger)' }}>
              warning
            </span>
            <span>Low Stock ({lowStockItems.length})</span>
          </button>
        </div>

        {/* Alerts List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeTab === 'overdue' && (
            <>
              {overdueCustomers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--success)' }}>
                    check_circle
                  </span>
                  <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>All Udhaar accounts are currently on schedule!</p>
                </div>
              ) : (
                overdueCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="card"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderLeft: '4px solid var(--danger)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-heading)' }}>
                          {cust.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {cust.phone} • Salary Day: {cust.salaryDay}th
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>
                          Rs. {cust.currentBalance.toLocaleString()}
                        </span>
                        <span className="badge badge-red" style={{ fontSize: '9px', display: 'block', marginTop: '2px' }}>
                          Overdue
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Due date: {cust.dueDate || 'Past due'}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToKhata(cust.id);
                        }}
                        className="btn btn-warning"
                        style={{ padding: '4px 10px', fontSize: '11px', height: '28px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>payments</span>
                        <span>Receive Cash</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'lowstock' && (
            <>
              {lowStockItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--success)' }}>
                    check_circle
                  </span>
                  <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>All SKUs are above minimum threshold levels!</p>
                </div>
              ) : (
                lowStockItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="card"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderLeft: '4px solid var(--danger)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {prod.category} • SKU #{prod.barcode.slice(-4)}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          className="tabular-nums"
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: prod.currentStock === 0 ? 'var(--danger)' : '#B45309'
                          }}
                        >
                          {prod.currentStock} {prod.baseUnit}
                        </span>
                        <span
                          className={`badge ${prod.currentStock === 0 ? 'badge-red' : 'badge-amber'}`}
                          style={{ fontSize: '9px', display: 'block', marginTop: '2px' }}
                        >
                          {prod.currentStock === 0 ? 'Out of Stock' : `Min: ${prod.minStock}`}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Sale: Rs. {prod.salePrice} / {prod.baseUnit}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToPurchases(prod.id);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '11px', height: '28px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_shipping</span>
                        <span>+ Stock In</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer summary */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', backgroundColor: '#F8FAFC' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Al-Madina Store Inventory & Khata Notification Engine
          </p>
        </div>
      </div>
    </div>
  );
}
