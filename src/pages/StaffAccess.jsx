import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShopData } from '../context/ShopDataContext';

export function StaffAccess() {
  const {
    staffAccounts,
    addStaffAccount,
    updateStaffAccess,
    toggleStaffStatus,
    deleteStaffAccount
  } = useAuth();
  const { showToast } = useShopData();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null); // null = Add new, string = Edit existing

  // Form State
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    roleDesignation: 'Cashier / POS Operator',
    permissions: {
      pos: true,
      inventory: true,
      khata: true,
      allowDiscount: true
    }
  });

  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Stats calculation
  const totalCashiers = staffAccounts.length;
  const activeCashiers = staffAccounts.filter((s) => s.isActive).length;
  const blockedCashiers = staffAccounts.filter((s) => !s.isActive).length;
  const discountAllowed = staffAccounts.filter((s) => s.permissions?.allowDiscount).length;

  const openAddModal = () => {
    setEditingStaffId(null);
    setForm({
      name: '',
      username: '',
      password: '',
      phone: '',
      roleDesignation: 'Cashier / POS Operator',
      permissions: {
        pos: true,
        inventory: true,
        khata: true,
        allowDiscount: true
      }
    });
    setFormError('');
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaffId(staff.id);
    setForm({
      name: staff.name,
      username: staff.username,
      password: staff.password,
      phone: staff.phone || '',
      roleDesignation: staff.roleDesignation || 'Cashier / POS Operator',
      permissions: {
        pos: true,
        inventory: Boolean(staff.permissions?.inventory),
        khata: Boolean(staff.permissions?.khata),
        allowDiscount: Boolean(staff.permissions?.allowDiscount)
      }
    });
    setFormError('');
    setShowPassword(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingStaffId(null);
    setFormError('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Cashier full name is required.');
      return;
    }
    if (!form.username.trim()) {
      setFormError('Login username is required.');
      return;
    }
    if (!form.password || form.password.length < 4) {
      setFormError('Password must be at least 4 characters long.');
      return;
    }

    if (editingStaffId) {
      // Update
      const res = updateStaffAccess(editingStaffId, {
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        roleDesignation: form.roleDesignation,
        permissions: form.permissions
      });
      if (res && res.success) {
        showToast?.(`Permissions updated for ${form.name}`, 'success');
        closeModal();
      } else {
        setFormError(res?.error || 'Failed to update cashier account.');
      }
    } else {
      // Add
      const res = addStaffAccount(form);
      if (res && res.success) {
        showToast?.(`Cashier account created for ${form.name}`, 'success');
        closeModal();
      } else {
        setFormError(res?.error || 'Failed to create cashier account.');
      }
    }
  };

  const handleToggleStatus = (staff) => {
    toggleStaffStatus(staff.id);
    const action = staff.isActive ? 'suspended' : 'activated';
    showToast?.(`Cashier ${staff.name} has been ${action}.`, staff.isActive ? 'warning' : 'success');
  };

  const handleDeleteStaff = (staff) => {
    if (window.confirm(`Are you sure you want to permanently delete cashier account '${staff.name}'?`)) {
      deleteStaffAccount(staff.id);
      showToast?.(`Cashier account '${staff.name}' deleted.`, 'danger');
    }
  };

  const roleDesignations = [
    'Cashier / POS Operator',
    'Counter Salesman',
    'Night Shift Cashier',
    'Store Trainee',
    'Floor Supervisor'
  ];

  return (
    <div className="module-container" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundImage: 'linear-gradient(to right, #FFFFFF, #F0FDFA)',
          borderLeft: '4px solid #0F766E'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#0F766E' }}>
              badge
            </span>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Cashier Access Control & Multi-Terminal Security
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            Create cashier logins, set granular module permissions, enable POS discounts, and block or unblock terminals in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn"
          style={{
            backgroundColor: '#0F766E',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>person_add</span>
          <span>Add New Cashier</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>group</span>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)' }}>{totalCashiers}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Cashier Accounts</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#16A34A' }}>{activeCashiers}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Terminals</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>block</span>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#DC2626' }}>{blockedCashiers}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Suspended Accounts</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>percent</span>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#D97706' }}>{discountAllowed}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Discount Privileges</div>
          </div>
        </div>
      </div>

      {/* Staff Accounts Grid */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            Registered Cashiers & Operators
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Staff cannot see Purchase Costs, Margins, Expenses, or Reports
          </span>
        </div>

        {staffAccounts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '8px' }}>
              person_off
            </span>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No cashier accounts registered yet.</p>
            <p style={{ margin: '4px 0 1rem 0', fontSize: '12px' }}>Click "Add New Cashier" above to create an account for your counter staff.</p>
            <button type="button" onClick={openAddModal} className="btn btn-primary">
              Add First Cashier
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {staffAccounts.map((staff) => (
              <div
                key={staff.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: staff.isActive ? '#FFFFFF' : '#F8FAFC',
                  border: `1px solid ${staff.isActive ? 'var(--border-subtle)' : '#FECACA'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {/* Left: Avatar & Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
                  <img
                    src={staff.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                    alt={staff.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `2px solid ${staff.isActive ? '#0F766E' : '#94A3B8'}`,
                      opacity: staff.isActive ? 1 : 0.65
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: staff.isActive ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                        {staff.name}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          padding: '1px 7px',
                          borderRadius: '6px'
                        }}
                      >
                        @{staff.username}
                      </span>
                      {staff.isActive ? (
                        <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          <span className="pulse-dot pulse-dot-green"></span>
                          Active
                        </span>
                      ) : (
                        <span className="badge badge-red" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          Blocked
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{staff.roleDesignation || 'Cashier / POS Operator'}</span>
                      {staff.phone && (
                        <>
                          <span>•</span>
                          <span>{staff.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: Permissions Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                    POS Terminal
                  </span>

                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      backgroundColor: staff.permissions?.inventory ? '#EFF6FF' : '#F1F5F9',
                      color: staff.permissions?.inventory ? '#1D4ED8' : '#94A3B8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {staff.permissions?.inventory ? 'check' : 'close'}
                    </span>
                    Live Inventory
                  </span>

                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      backgroundColor: staff.permissions?.khata ? '#FEF3C7' : '#F1F5F9',
                      color: staff.permissions?.khata ? '#B45309' : '#94A3B8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {staff.permissions?.khata ? 'check' : 'close'}
                    </span>
                    Customer Khata
                  </span>

                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      backgroundColor: staff.permissions?.allowDiscount ? '#F3E8FF' : '#F1F5F9',
                      color: staff.permissions?.allowDiscount ? '#7E22CE' : '#94A3B8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {staff.permissions?.allowDiscount ? 'check' : 'close'}
                    </span>
                    POS Discounts
                  </span>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(staff)}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(staff)}
                    className="btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: staff.isActive ? '#FEF2F2' : '#F0FDF4',
                      border: `1px solid ${staff.isActive ? '#FECACA' : '#BBF7D0'}`,
                      color: staff.isActive ? '#DC2626' : '#16A34A',
                      fontWeight: 700
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      {staff.isActive ? 'block' : 'lock_open'}
                    </span>
                    <span>{staff.isActive ? 'Block Access' : 'Unblock Access'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteStaff(staff)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '6px'
                    }}
                    title="Delete cashier account"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#EF4444' }}>
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Cashier Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '1.75rem', borderRadius: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                  {editingStaffId ? 'Edit Cashier Access & Permissions' : 'Create New Cashier Account'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Configure login credentials and POS authority
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '12px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Cashier Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Cashier Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hamza Farooq"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Login Username & Mobile Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Login Username *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. hamza"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Mobile / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0321-4567890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Password / PIN & Role Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Password / PIN *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      style={{ paddingRight: '36px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Role Designation
                  </label>
                  <select
                    value={form.roleDesignation}
                    onChange={(e) => setForm({ ...form, roleDesignation: e.target.value })}
                  >
                    {roleDesignations.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div style={{ marginTop: '0.25rem', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-heading)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Granular Terminal Permissions
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* POS Permission (Always Locked) */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-body)', cursor: 'not-allowed', opacity: 0.9 }}>
                    <input type="checkbox" checked disabled />
                    <span><strong>POS Billing & Receipt Printing</strong> (Always enabled for counter cashier)</span>
                  </label>

                  {/* Inventory Permission */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-body)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.permissions.inventory}
                      onChange={(e) => setForm({
                        ...form,
                        permissions: { ...form.permissions, inventory: e.target.checked }
                      })}
                    />
                    <span><strong>Live Inventory:</strong> Allow viewing stock quantities & search (Cost & margins stay hidden)</span>
                  </label>

                  {/* Customer Khata Permission */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-body)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.permissions.khata}
                      onChange={(e) => setForm({
                        ...form,
                        permissions: { ...form.permissions, khata: e.target.checked }
                      })}
                    />
                    <span><strong>Customer Khata:</strong> Allow searching Udhaar balances & recording cash recovery</span>
                  </label>

                  {/* Discount Permission */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-body)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.permissions.allowDiscount}
                      onChange={(e) => setForm({
                        ...form,
                        permissions: { ...form.permissions, allowDiscount: e.target.checked }
                      })}
                    />
                    <span><strong>POS Discounts:</strong> Allow cashier to apply custom bill discounts</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.75rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    backgroundColor: '#0F766E',
                    color: '#FFFFFF',
                    padding: '8px 20px',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
                  }}
                >
                  {editingStaffId ? 'Save Changes' : 'Create Cashier Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
