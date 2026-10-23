import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Login({ onLoginSuccess }) {
  const {
    login,
    registerStore,
    registeredOwner,
    verifyRecoveryEmail,
    resetPasswordByEmail
  } = useAuth();

  // Active View / Modal: null | 'signin' | 'create_store'
  // Initial default: if user clicks anywhere or by default on landing page, can trigger modal
  const [authModal, setAuthModal] = useState('signin'); // 'signin' | 'create_store' | null (modal open or inline)

  // Sign In Form State
  const [selectedRole, setSelectedRole] = useState('shopkeeper'); // 'shopkeeper' | 'staff'
  const [identifier, setIdentifier] = useState(registeredOwner?.username || 'admin');
  const [password, setPassword] = useState(registeredOwner?.password || 'admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signInSuccess, setSignInSuccess] = useState('');

  // Create Store Form State
  const [createStoreForm, setCreateStoreForm] = useState({
    storeName: '',
    storeType: 'Grocery & Supermarket',
    phone: '',
    storeAddress: '',
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createStoreError, setCreateStoreError] = useState('');

  // Forgot Password / OTP Recovery State
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1 = Email Input, 2 = OTP + New Password
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [simulatedEmailNotification, setSimulatedEmailNotification] = useState(null);

  // Switch Role inside Sign In
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSignInError('');
    setSignInSuccess('');
    if (role === 'staff') {
      setIdentifier('hamza');
      setPassword('staff123');
    } else {
      setIdentifier(registeredOwner?.username || 'admin');
      setPassword(registeredOwner?.password || 'admin123');
    }
  };

  // Sign In Form Submit
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setSignInError('');
    setSignInSuccess('');

    const res = login(identifier, password, selectedRole);
    if (res && res.success) {
      if (onLoginSuccess) {
        onLoginSuccess(selectedRole === 'staff' ? 'pos' : 'dashboard');
      }
    } else {
      setSignInError(res?.error || 'Incorrect username or password');
    }
  };

  // Create Store Form Submit
  const handleCreateStoreSubmit = (e) => {
    e.preventDefault();
    setCreateStoreError('');

    if (!createStoreForm.storeName.trim()) {
      setCreateStoreError('Store / Business Name is required.');
      return;
    }
    if (!createStoreForm.phone.trim()) {
      setCreateStoreError('Mobile / WhatsApp number is required.');
      return;
    }
    if (!createStoreForm.name.trim()) {
      setCreateStoreError('Owner full name is required.');
      return;
    }
    if (!createStoreForm.username.trim()) {
      setCreateStoreError('Login username is required.');
      return;
    }
    if (!createStoreForm.email.trim()) {
      setCreateStoreError('Owner email address is required for password recovery.');
      return;
    }
    if (!createStoreForm.password) {
      setCreateStoreError('Password is required.');
      return;
    }
    if (createStoreForm.password.length < 4) {
      setCreateStoreError('Password must be at least 4 characters.');
      return;
    }
    if (createStoreForm.password !== createStoreForm.confirmPassword) {
      setCreateStoreError('Password and Confirm Password do not match.');
      return;
    }

    const res = registerStore(createStoreForm);
    if (res && res.success) {
      if (onLoginSuccess) {
        onLoginSuccess('dashboard');
      }
    } else {
      setCreateStoreError(res?.error || 'Failed to create store account.');
    }
  };

  // Step 1: Send Recovery OTP
  const handleSendRecoveryOtp = (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    const verification = verifyRecoveryEmail(recoveryEmail);
    if (!verification.success) {
      setRecoveryError(verification.error);
      return;
    }

    // Generate random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setRecoveryStep(2);
    setSimulatedEmailNotification({
      to: verification.email,
      otp: otp
    });
    setRecoverySuccess(`Recovery OTP sent to ${verification.email}`);
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setRecoveryError('');

    if (enteredOtp.trim() !== generatedOtp) {
      setRecoveryError('Invalid 6-digit OTP code. Please enter the code shown in the simulation alert.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setRecoveryError('New password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setRecoveryError('New passwords do not match.');
      return;
    }

    const res = resetPasswordByEmail(recoveryEmail, newPassword);
    if (res && res.success) {
      setSignInSuccess('Password updated successfully! Please sign in with your new password.');
      setPassword(newPassword);
      setIdentifier(recoveryEmail);
      setIsForgotMode(false);
      setRecoveryStep(1);
      setSimulatedEmailNotification(null);
      setRecoveryEmail('');
      setEnteredOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setRecoveryError(res?.error || 'Could not update password.');
    }
  };

  const storeCategories = [
    'Grocery & Supermarket',
    'Dairy & Milk Shop',
    'Cosmetics & Beauty',
    'Bakery & Sweets',
    'Beverages & Cold Corner',
    'Pharmacy & Medical',
    'Departmental / FMCG',
    'General Retail Store'
  ];

  const ecosystemFeatures = [
    {
      icon: 'point_of_sale',
      color: '#0F766E',
      bg: '#F0FDFA',
      title: 'Fast POS & 80mm Receipts',
      desc: 'Sub-second barcode checkout, 3-way split payment (Cash, Udhaar, Partial), custom bill discounts, and thermal receipt printing.'
    },
    {
      icon: 'menu_book',
      color: '#2563EB',
      bg: '#EFF6FF',
      title: 'Digital Khata & Udhaar',
      desc: 'Customer credit limits, automated salary date reminders, 1-click WhatsApp payment reminders, and atomic cash recovery ledger.'
    },
    {
      icon: 'scale',
      color: '#D97706',
      bg: '#FEF3C7',
      title: 'Loose Decimal Inventory',
      desc: 'Sell in loose grams (0.250 kg), millilitres, packets, dozens, and cartons with automatic conversion. Zero floating-point error.'
    },
    {
      icon: 'local_shipping',
      color: '#7C3AED',
      bg: '#F5F3FF',
      title: 'Wholesale Stock-In Bills',
      desc: 'Log supplier shipments with automated Weighted Average Costing, purchase credit ledger, and vendor payable balance tracking.'
    },
    {
      icon: 'badge',
      color: '#059669',
      bg: '#ECFDF5',
      title: 'Cashier Access Control',
      desc: 'Create secure Cashier accounts with custom POS authority. Cashiers can never see purchase costs, margins, or net profit reports.'
    },
    {
      icon: 'query_stats',
      color: '#DC2626',
      bg: '#FEF2F2',
      title: 'Net Profit Waterfall',
      desc: 'Real-time profit tracking: Total Gross Sales minus snapshot COGS equals Gross Profit; minus shop expenses equals True Net Profit.'
    }
  ];

  const scrollToEcosystem = () => {
    const el = document.getElementById('retail-ecosystem-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: 'var(--text-body)', display: 'flex', flexDirection: 'column' }}>
      
      {/* ===================================================================== */}
      {/* 1. PUBLIC NAVBAR (Inspired by Dukan.pk)                                */}
      {/* ===================================================================== */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Brand Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#0F766E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>storefront</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                Dukaan<span style={{ color: '#0F766E' }}>Khata</span>
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  backgroundColor: '#CCFBF1',
                  color: '#0F766E',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase'
                }}
              >
                Retail OS
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
              Pakistan’s #1 Retail POS & Udhaar System
            </p>
          </div>
        </div>

        {/* Center Ecosystem Links */}
        <div
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: '#475569'
          }}
        >
          <button
            type="button"
            onClick={scrollToEcosystem}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }}
          >
            POS Billing
          </button>
          <button
            type="button"
            onClick={scrollToEcosystem}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }}
          >
            Digital Khata
          </button>
          <button
            type="button"
            onClick={scrollToEcosystem}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }}
          >
            Live Inventory
          </button>
          <button
            type="button"
            onClick={scrollToEcosystem}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }}
          >
            Cashier Control
          </button>
          <button
            type="button"
            onClick={scrollToEcosystem}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }}
          >
            Profit Waterfall
          </button>
        </div>

        {/* Right Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setAuthModal('signin');
              setIsForgotMode(false);
            }}
            className="btn"
            style={{
              padding: '8px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              backgroundColor: '#FFFFFF',
              color: '#0F766E',
              border: '1.5px solid #0F766E',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthModal('create_store');
              setIsForgotMode(false);
            }}
            className="btn"
            style={{
              padding: '8px 20px',
              fontSize: '13.5px',
              fontWeight: 700,
              backgroundColor: '#0F766E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(15, 118, 110, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_business</span>
            <span>Create Store</span>
          </button>
        </div>
      </nav>

      {/* ===================================================================== */}
      {/* 2. HERO BANNER SECTION (Inspired by Dukan.pk)                         */}
      {/* ===================================================================== */}
      <section
        style={{
          padding: '3.5rem 1.5rem 2.5rem 1.5rem',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          backgroundImage: 'radial-gradient(circle at 50% 10%, #1E293B 0%, #0F172A 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Tag Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(15, 118, 110, 0.25)',
              border: '1px solid rgba(45, 212, 191, 0.4)',
              color: '#5EEAD4',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '1.25rem',
              letterSpacing: '0.5px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>
            <span>PAKISTAN’S MOST ADVANCED RETAIL POS & DIGITAL UDHAAR OS</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.25,
              margin: '0 0 1.25rem 0',
              letterSpacing: '-1px'
            }}
          >
            Digitize Your Retail Shop, POS Billing & Customer Khata in{' '}
            <span style={{ color: '#2DD4BF', textDecoration: 'underline decoration-wavy decoration-[#0F766E]' }}>
              29 Seconds
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(14px, 1.8vw, 16.5px)',
              color: '#CBD5E1',
              lineHeight: 1.6,
              maxWidth: '750px',
              margin: '0 auto 2rem auto'
            }}
          >
            Built for Pakistani grocery stores, supermarkets, FMCG wholesale, and pharmacies. Sell loose decimal items (kg/gram/litre), print 80mm thermal bills, send WhatsApp salary-linked Udhaar reminders, and grant secure cashier access with zero floating-point errors.
          </p>

          {/* Dual Main CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setAuthModal('create_store');
                setIsForgotMode(false);
              }}
              className="btn"
              style={{
                height: '50px',
                padding: '0 26px',
                fontSize: '15px',
                fontWeight: 800,
                backgroundColor: '#0F766E',
                color: '#FFFFFF',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(15, 118, 110, 0.45)',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>rocket_launch</span>
              <span>Create Store (New Shop Owner)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthModal('signin');
                setIsForgotMode(false);
              }}
              className="btn"
              style={{
                height: '50px',
                padding: '0 24px',
                fontSize: '15px',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
              <span>Sign In to Existing Store</span>
            </button>
          </div>

          {/* Trust Value Badges Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              fontSize: '12.5px',
              color: '#94A3B8',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2DD4BF' }}>verified</span>
              <span>Rs. 0 Setup Fee</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2DD4BF' }}>wifi_off</span>
              <span>100% Counter Resilient</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2DD4BF' }}>calculate</span>
              <span>Zero Floating-Point Error</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2DD4BF' }}>receipt_long</span>
              <span>80mm Thermal Bills Ready</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2DD4BF' }}>chat</span>
              <span>WhatsApp Salary Reminders</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. AUTH MODAL / INTERACTIVE FORM OVERLAY                              */}
      {/* ===================================================================== */}
      {authModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            overflowY: 'auto'
          }}
          onClick={() => {
            // Can close if needed or keep sticky
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: authModal === 'create_store' ? '680px' : '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Top Close / Toggle Strip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#F1F5F9',
                  padding: '4px',
                  borderRadius: '10px',
                  gap: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthModal('signin');
                    setIsForgotMode(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: authModal === 'signin' ? '#0F766E' : 'transparent',
                    color: authModal === 'signin' ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModal('create_store');
                    setIsForgotMode(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: authModal === 'create_store' ? '#0F766E' : 'transparent',
                    color: authModal === 'create_store' ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Create Store
                </button>
              </div>

              <button
                type="button"
                onClick={() => setAuthModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                title="Close"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* A. CREATE STORE VIEW                                          */}
            {/* ------------------------------------------------------------- */}
            {authModal === 'create_store' && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Register Your Retail Store
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                    One-time registration. Creates your cloud database profile and Master Shopkeeper login.
                  </p>
                </div>

                {createStoreError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                    <span>{createStoreError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateStoreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {/* Store Name & Category */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Store / Business Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Al-Madina Super Store"
                        value={createStoreForm.storeName}
                        onChange={(e) => setCreateStoreForm({ ...createStoreForm, storeName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Business Category
                      </label>
                      <select
                        value={createStoreForm.storeType}
                        onChange={(e) => setCreateStoreForm({ ...createStoreForm, storeType: e.target.value })}
                      >
                        {storeCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mobile & Address */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Mobile / WhatsApp *
                      </label>
                      <input
                        type="text"
                        placeholder="0300-8451299"
                        value={createStoreForm.phone}
                        onChange={(e) => setCreateStoreForm({ ...createStoreForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Shop Address & City
                      </label>
                      <input
                        type="text"
                        placeholder="Main Commercial Market, Lahore"
                        value={createStoreForm.storeAddress}
                        onChange={(e) => setCreateStoreForm({ ...createStoreForm, storeAddress: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Owner Name & Username */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Owner Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Haji Muhammad Usman"
                        value={createStoreForm.name}
                        onChange={(e) => setCreateStoreForm({ ...createStoreForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Login Username *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. usman / admin"
                        value={createStoreForm.username}
                        onChange={(e) => setCreateStoreForm({ ...createStoreForm, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Owner Email (for OTP Recovery) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Owner Email Address (for Password OTP Recovery) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} className="material-symbols-outlined">
                        mail
                      </span>
                      <input
                        type="email"
                        placeholder="owner@yourshop.com"
                        value={createStoreForm.email}
                        onChange={(e) => setCreateStoreForm({ ...createStoreForm, email: e.target.value })}
                        style={{ paddingLeft: '36px' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Password *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCreatePassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={createStoreForm.password}
                          onChange={(e) => setCreateStoreForm({ ...createStoreForm, password: e.target.value })}
                          style={{ paddingRight: '36px' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCreatePassword(!showCreatePassword)}
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
                            {showCreatePassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Confirm Password *
                      </label>
                      <input
                        type={showCreatePassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={createStoreForm.confirmPassword}
                        onChange={(e) => setCreateStoreForm({ ...createStoreForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn"
                    style={{
                      height: '46px',
                      fontSize: '14.5px',
                      backgroundColor: '#0F766E',
                      color: '#FFFFFF',
                      marginTop: '0.5rem',
                      boxShadow: '0 4px 14px rgba(15, 118, 110, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 800
                    }}
                  >
                    <span className="material-symbols-outlined">rocket_launch</span>
                    <span>Create Store & Launch Dashboard</span>
                  </button>
                </form>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* B. FORGOT PASSWORD (OTP RECOVERY) VIEW                        */}
            {/* ------------------------------------------------------------- */}
            {authModal === 'signin' && isForgotMode && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false);
                        setRecoveryStep(1);
                        setRecoveryError('');
                        setSimulatedEmailNotification(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0F766E',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                    </button>
                    <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Reset Owner Password via Email OTP
                    </h2>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    {recoveryStep === 1
                      ? 'Enter your registered Shop Owner email to receive a 6-digit recovery OTP.'
                      : 'Step 2: Enter the 6-digit OTP and set your new password.'}
                  </p>
                </div>

                {recoveryError && (
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
                    <span>{recoveryError}</span>
                  </div>
                )}

                {/* Simulated Email OTP Green Alert Banner */}
                {simulatedEmailNotification && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #86EFAC',
                      color: '#166534',
                      fontSize: '12.5px',
                      marginBottom: '1.25rem',
                      boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16A34A' }}>mark_email_read</span>
                      <span>📧 Simulated Email Sent!</span>
                    </div>
                    <div>
                      Password Recovery OTP for <strong>{simulatedEmailNotification.to}</strong>:
                      <span
                        style={{
                          display: 'inline-block',
                          marginLeft: '8px',
                          padding: '3px 9px',
                          backgroundColor: '#DCFCE7',
                          border: '1px solid #4ADE80',
                          borderRadius: '6px',
                          fontWeight: 900,
                          letterSpacing: '2px',
                          fontSize: '15px',
                          color: '#15803D'
                        }}
                      >
                        {simulatedEmailNotification.otp}
                      </span>
                    </div>
                  </div>
                )}

                {recoveryStep === 1 && (
                  <form onSubmit={handleSendRecoveryOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Registered Shop Owner Email
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} className="material-symbols-outlined">
                          mail
                        </span>
                        <input
                          type="email"
                          placeholder="e.g. usman@dukaankhata.pk"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          style={{ paddingLeft: '36px' }}
                          required
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                        Registered email is: <code>{registeredOwner?.email || 'usman@dukaankhata.pk'}</code>
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      style={{
                        height: '46px',
                        fontSize: '14px',
                        backgroundColor: '#0F766E',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 700
                      }}
                    >
                      <span className="material-symbols-outlined">send</span>
                      <span>Send 6-Digit Recovery OTP</span>
                    </button>
                  </form>
                )}

                {recoveryStep === 2 && (
                  <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Enter 6-Digit OTP Code *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 849102"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        style={{ letterSpacing: '4px', fontSize: '17px', fontWeight: 800, textAlign: 'center' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        New Password *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{ paddingRight: '36px' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
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
                            {showNewPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Confirm New Password *
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      style={{
                        height: '46px',
                        fontSize: '14px',
                        backgroundColor: '#0F766E',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 700
                      }}
                    >
                      <span className="material-symbols-outlined">lock_reset</span>
                      <span>Verify OTP & Save Password</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* C. SIGN IN VIEW                                               */}
            {/* ------------------------------------------------------------- */}
            {authModal === 'signin' && !isForgotMode && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Sign In to Existing Store
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                    Access <strong style={{ color: '#0F766E' }}>{registeredOwner?.storeName || 'Al-Madina Super Store'}</strong>
                  </p>
                </div>

                {signInSuccess && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      color: '#15803D',
                      fontSize: '12.5px',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    <span>{signInSuccess}</span>
                  </div>
                )}

                {signInError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                    <span>{signInError}</span>
                  </div>
                )}

                {/* Role Switcher Tabs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '4px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '10px',
                    marginBottom: '1.25rem'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRoleChange('shopkeeper')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedRole === 'shopkeeper' ? '#0F766E' : 'transparent',
                      color: selectedRole === 'shopkeeper' ? '#FFFFFF' : '#475569',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                      <span>Shopkeeper</span>
                    </div>
                    <span style={{ fontSize: '10px', opacity: 0.85 }}>(Owner Access)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('staff')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedRole === 'staff' ? '#2563EB' : 'transparent',
                      color: selectedRole === 'staff' ? '#FFFFFF' : '#475569',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>point_of_sale</span>
                      <span>POS Staff</span>
                    </div>
                    <span style={{ fontSize: '10px', opacity: 0.85 }}>(Cashier Terminal)</span>
                  </button>
                </div>

                {/* Role Note */}
                <div
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: selectedRole === 'staff' ? '#EFF6FF' : '#F0FDFA',
                    border: `1px solid ${selectedRole === 'staff' ? '#BFDBFE' : '#99F6E4'}`,
                    marginBottom: '1.25rem',
                    fontSize: '11.5px',
                    color: selectedRole === 'staff' ? '#1E40AF' : '#0F766E',
                    lineHeight: 1.4
                  }}
                >
                  {selectedRole === 'staff' ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB', flexShrink: 0 }}>lock</span>
                      <span><strong>Staff Mode:</strong> Cashier login enforced. Purchase costs, profits, and reports are hidden.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0F766E', flexShrink: 0 }}>verified_user</span>
                      <span><strong>Owner Mode:</strong> Full access to Net Profit waterfall, cashier management, and analytics.</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Username, Email, or Phone
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} className="material-symbols-outlined">
                        person
                      </span>
                      <input
                        type="text"
                        placeholder="Username / Email / Phone"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        style={{ paddingLeft: '36px' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                        Password
                      </label>
                      {selectedRole === 'shopkeeper' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotMode(true);
                            setRecoveryStep(1);
                            setRecoveryEmail(registeredOwner?.email || '');
                            setRecoveryError('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0F766E',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} className="material-symbols-outlined">
                        lock
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ paddingLeft: '36px', paddingRight: '36px' }}
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

                  <button
                    type="submit"
                    className="btn"
                    style={{
                      height: '46px',
                      fontSize: '14.5px',
                      backgroundColor: selectedRole === 'staff' ? '#2563EB' : '#0F766E',
                      color: '#FFFFFF',
                      marginTop: '0.25rem',
                      boxShadow: selectedRole === 'staff' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : '0 4px 12px rgba(15, 118, 110, 0.3)',
                      fontWeight: 800
                    }}
                  >
                    <span className="material-symbols-outlined">login</span>
                    <span>Launch {selectedRole === 'staff' ? 'Staff POS' : 'Shopkeeper Console'}</span>
                  </button>
                </form>

                {/* Quick Demo Credentials */}
                <div style={{ marginTop: '1.25rem', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                  <span style={{ display: 'block', fontSize: '10.5px', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>
                    ⚡ 1-Tap Demo Switch:
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('shopkeeper');
                        setIdentifier(registeredOwner?.username || 'admin');
                        setPassword(registeredOwner?.password || 'admin123');
                        setSignInError('');
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#0F766E',
                        fontWeight: 700
                      }}
                    >
                      Owner ({registeredOwner?.username || 'admin'})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('staff');
                        setIdentifier('hamza');
                        setPassword('staff123');
                        setSignInError('');
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#2563EB',
                        fontWeight: 700
                      }}
                    >
                      Cashier (@hamza)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. "OUR RETAIL ECOSYSTEM" 6-CARD GRID (Inspired by Dukan.pk)          */}
      {/* ===================================================================== */}
      <section
        id="retail-ecosystem-section"
        style={{
          padding: '4rem 1.5rem',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#0F766E',
              backgroundColor: '#CCFBF1',
              padding: '4px 12px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            All-In-One Modern Retail OS
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0F172A', marginTop: '0.75rem', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
            Built for High-Velocity Pakistani Counters
          </h2>
          <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '620px', margin: '0 auto' }}>
            Everything your retail or wholesale store needs to operate efficiently from 8 AM to midnight.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {ecosystemFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: feat.bg,
                    color: feat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{feat.icon}</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: feat.color, textTransform: 'uppercase' }}>
                  Live in DukaanKhata
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: feat.color }}>
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. FOOTER                                                             */}
      {/* ===================================================================== */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: '#0F172A',
          color: '#94A3B8',
          padding: '2.5rem 1.5rem',
          borderTop: '1px solid #1E293B',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#2DD4BF', fontSize: '24px' }}>storefront</span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>DukaanKhata</span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', maxWidth: '600px', color: '#94A3B8' }}>
            DukaanKhata Retail Technologies • Designed for high-turnover Grocery, Supermarkets, FMCG Distributors & Pharmacies across Pakistan.
          </p>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            © 2026 DukaanKhata Retail OS • 100% Production Ready • Offline Resilient
          </div>
        </div>
      </footer>

    </div>
  );
}
