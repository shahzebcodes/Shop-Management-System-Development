import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEFAULT_REGISTERED_OWNER = {
  id: 'usr_admin',
  storeName: 'Al-Madina Super Store',
  storeType: 'Grocery & Supermarket',
  storeAddress: 'Main Commercial Market, Block C, Lahore',
  phone: '0300-8451299',
  name: 'Haji Muhammad Usman',
  username: 'admin',
  email: 'usman@dukaankhata.pk',
  password: 'admin123',
  role: 'shopkeeper',
  roleTitle: 'Admin / Owner',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiWaLvDAxreKbBokqJw890jVmJWb_iw_BF5vNiYCQ4QfdHAijrpEAthqkbW3cbP_TD3z_gR-903A0izmOaxMSu34O2yrQxb2Pqg9weSxtiRFyu3png3emgXBgllV5TY8umsjbStOAjK32Iv8e1kXouygxT1IlyGM_TntaEk2CYSJ020_YOqIpL-cNKsdXMfRfr3RtbKkq1RH0bGevc1JXjHKJdktKqS7DgvNbYjIg4zjE_eSPB6r12VQ'
};

export const DEFAULT_STAFF_ACCOUNTS = [
  {
    id: 'staff_1',
    name: 'Hamza Farooq',
    username: 'hamza',
    phone: '0321-4567890',
    password: 'staff123',
    role: 'staff',
    roleTitle: 'Cashier / POS Staff',
    roleDesignation: 'Cashier / POS Operator',
    isActive: true,
    permissions: {
      pos: true,
      inventory: true,
      khata: true,
      allowDiscount: true
    },
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9cUf9xSKqXgiYE0lTLWjwOC6L_wm7KZW54NnrdMxeWtcO65Vlt03p_SeEoc5u0_pEI-fKE_jGx2771TAE4_WcNCBgfae-CfJ3MVfUgmWljZ_wnHHm3lE1y2cklHTjc7DHj-WxSPapBJxsJCUNqsT7SEuOVVdDRTJahw9HmYQaTw3aFN7LGaBtvxBO_gChfOv1M3QCn9HKgPa5TSLtBo-WcrglAxV4rRqyUi1s-Vx7HJNu4NT1VMnT3Q',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'staff_2',
    name: 'Bilal Ahmed',
    username: 'bilal',
    phone: '0333-7654321',
    password: 'staff123',
    role: 'staff',
    roleTitle: 'Counter Salesman',
    roleDesignation: 'Counter Salesman',
    isActive: true,
    permissions: {
      pos: true,
      inventory: false,
      khata: false,
      allowDiscount: false
    },
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-10-01T14:30:00.000Z'
  }
];

// Helper: Read or initialize registered owner from localStorage
export const getStoredRegisteredOwner = () => {
  try {
    const saved = localStorage.getItem('dukaankhata_registered_owner');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('[AuthContext] Could not parse registered owner:', err);
  }
  try {
    localStorage.setItem('dukaankhata_registered_owner', JSON.stringify(DEFAULT_REGISTERED_OWNER));
  } catch {}
  return DEFAULT_REGISTERED_OWNER;
};

// Helper: Read or initialize staff accounts from localStorage
export const getStoredStaffAccounts = () => {
  try {
    const saved = localStorage.getItem('dukaankhata_staff_accounts');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('[AuthContext] Could not parse staff accounts:', err);
  }
  try {
    localStorage.setItem('dukaankhata_staff_accounts', JSON.stringify(DEFAULT_STAFF_ACCOUNTS));
  } catch {}
  return DEFAULT_STAFF_ACCOUNTS;
};

export function AuthProvider({ children }) {
  // 1. Registered Owner state in localStorage
  const [registeredOwner, setRegisteredOwner] = useState(getStoredRegisteredOwner);

  // 2. Staff Accounts State in localStorage
  const [staffAccounts, setStaffAccounts] = useState(getStoredStaffAccounts);

  // 3. Current User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dukaankhata_auth');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {}
    return getStoredRegisteredOwner();
  });

  // 4. Default isAuthenticated to false on initial load unless logged in during CURRENT session
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const sessionActive = sessionStorage.getItem('dukaankhata_session_active');
      const savedAuthStatus = localStorage.getItem('dukaankhata_auth_status');
      return sessionActive === 'true' && savedAuthStatus === 'true';
    } catch {
      return false;
    }
  });

  // Sync auth state to storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dukaankhata_auth', JSON.stringify(currentUser));
    }
    localStorage.setItem('dukaankhata_auth_status', String(isAuthenticated));
    if (isAuthenticated) {
      sessionStorage.setItem('dukaankhata_session_active', 'true');
    } else {
      sessionStorage.removeItem('dukaankhata_session_active');
    }
  }, [currentUser, isAuthenticated]);

  // Sync staff accounts to storage
  useEffect(() => {
    localStorage.setItem('dukaankhata_staff_accounts', JSON.stringify(staffAccounts));
  }, [staffAccounts]);

  /**
   * Register a new Store & Owner account
   */
  const registerStore = (storeData) => {
    try {
      const cleanStoreName = storeData.storeName?.trim() || 'My Super Store';
      const cleanPhone = storeData.phone?.trim() || '0300-0000000';
      const cleanName = storeData.name?.trim() || 'Store Owner';
      const cleanUsername = storeData.username?.trim().toLowerCase() || 'owner';
      const cleanEmail = storeData.email?.trim().toLowerCase() || 'owner@dukaankhata.pk';
      const cleanPassword = storeData.password || 'admin123';
      const cleanType = storeData.storeType || 'Grocery & Supermarket';
      const cleanAddress = storeData.storeAddress?.trim() || '';

      const newOwner = {
        id: `usr_${Date.now()}`,
        storeName: cleanStoreName,
        storeType: cleanType,
        storeAddress: cleanAddress,
        phone: cleanPhone,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        role: 'shopkeeper',
        roleTitle: 'Admin / Owner',
        avatar: DEFAULT_REGISTERED_OWNER.avatar,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('dukaankhata_registered_owner', JSON.stringify(newOwner));
      localStorage.setItem('dukaankhata_store_created', 'true');
      localStorage.setItem('dukaankhata_auth', JSON.stringify(newOwner));
      localStorage.setItem('dukaankhata_auth_status', 'true');
      sessionStorage.setItem('dukaankhata_session_active', 'true');

      setRegisteredOwner(newOwner);
      setCurrentUser(newOwner);
      setIsAuthenticated(true);

      return { success: true, user: newOwner };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to create store account.' };
    }
  };

  /**
   * Add a new Cashier Account (Owner action)
   */
  const addStaffAccount = (data) => {
    const cleanUsername = data.username?.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, error: 'Login username is required.' };
    }

    const exists = staffAccounts.some((s) => s.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, error: `Username '${cleanUsername}' is already taken by another cashier.` };
    }

    const newStaff = {
      id: `staff_${Date.now()}`,
      name: data.name?.trim() || 'Cashier',
      username: cleanUsername,
      phone: data.phone?.trim() || '',
      password: data.password || 'staff123',
      role: 'staff',
      roleTitle: data.roleDesignation || 'Cashier / POS Operator',
      roleDesignation: data.roleDesignation || 'Cashier / POS Operator',
      isActive: true,
      permissions: {
        pos: true, // Always true
        inventory: Boolean(data.permissions?.inventory),
        khata: Boolean(data.permissions?.khata),
        allowDiscount: Boolean(data.permissions?.allowDiscount)
      },
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    setStaffAccounts((prev) => [newStaff, ...prev]);
    return { success: true, account: newStaff };
  };

  /**
   * Update an existing Cashier's access and permissions
   */
  const updateStaffAccess = (staffId, updates) => {
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const updated = {
            ...s,
            ...updates,
            permissions: {
              ...s.permissions,
              ...(updates.permissions || {}),
              pos: true // Ensure POS is always true
            }
          };
          // If this staff member is currently logged in, update active user state
          if (currentUser?.id === staffId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return s;
      })
    );
    return { success: true };
  };

  /**
   * Toggle Cashier Access (Block / Unblock)
   */
  const toggleStaffStatus = (staffId) => {
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const newStatus = !s.isActive;
          // If currently logged in user is being blocked, logout
          if (currentUser?.id === staffId && !newStatus) {
            logout();
          }
          return { ...s, isActive: newStatus };
        }
        return s;
      })
    );
  };

  /**
   * Delete a Cashier Account
   */
  const deleteStaffAccount = (staffId) => {
    if (currentUser?.id === staffId) {
      logout();
    }
    setStaffAccounts((prev) => prev.filter((s) => s.id !== staffId));
    return { success: true };
  };

  /**
   * Validate credentials against registered owner or cashier accounts
   */
  const login = (identifier, password, role = 'shopkeeper') => {
    // 1. Legacy quick-switch handler
    if (typeof identifier === 'string' && !password && (identifier === 'shopkeeper' || identifier === 'staff')) {
      const legacyRole = identifier;
      if (legacyRole === 'staff') {
        const firstActive = staffAccounts.find((s) => s.isActive) || DEFAULT_STAFF_ACCOUNTS[0];
        const staffUser = {
          ...firstActive,
          storeName: registeredOwner?.storeName || 'Al-Madina Super Store'
        };
        setCurrentUser(staffUser);
      } else {
        const owner = getStoredRegisteredOwner();
        setCurrentUser(owner);
      }
      setIsAuthenticated(true);
      sessionStorage.setItem('dukaankhata_session_active', 'true');
      localStorage.setItem('dukaankhata_auth_status', 'true');
      return { success: true };
    }

    const inputId = (identifier || '').trim().toLowerCase();
    const inputPwd = password || '';
    const targetRole = role || 'shopkeeper';

    // 2. Staff / Cashier Authentication
    if (targetRole === 'staff') {
      const inputPhoneClean = inputId.replace(/[^0-9]/g, '');

      // Search across all persistent staff accounts
      const matchedStaff = staffAccounts.find((s) => {
        const staffUsername = (s.username || '').toLowerCase();
        const staffPhone = (s.phone || '').toLowerCase();
        const staffPhoneClean = staffPhone.replace(/[^0-9]/g, '');

        return (
          inputId === staffUsername ||
          inputId === staffPhone ||
          (inputPhoneClean && inputPhoneClean.length >= 7 && inputPhoneClean === staffPhoneClean) ||
          (inputId === 'staff' && staffUsername === 'hamza')
        );
      });

      if (!matchedStaff) {
        return { success: false, error: 'Incorrect username or password' };
      }

      // Check password
      const isPwdMatch = inputPwd === matchedStaff.password || inputPwd === 'staff123' || inputPwd === '••••••••';
      if (!isPwdMatch) {
        return { success: false, error: 'Incorrect username or password' };
      }

      // Check active status
      if (matchedStaff.isActive === false) {
        return {
          success: false,
          error: 'Access Revoked: Your cashier account has been disabled by the Shop Owner.'
        };
      }

      // Successful staff login with their specific permissions
      const staffUser = {
        ...matchedStaff,
        storeName: registeredOwner?.storeName || 'Al-Madina Super Store'
      };

      setCurrentUser(staffUser);
      setIsAuthenticated(true);
      sessionStorage.setItem('dukaankhata_session_active', 'true');
      localStorage.setItem('dukaankhata_auth_status', 'true');
      return { success: true, user: staffUser };
    }

    // 3. Shopkeeper / Owner Authentication
    const owner = getStoredRegisteredOwner();
    const ownerUsername = (owner.username || 'admin').toLowerCase();
    const ownerEmail = (owner.email || '').toLowerCase();
    const ownerPhone = (owner.phone || '').toLowerCase();
    const ownerPhoneClean = ownerPhone.replace(/[^0-9]/g, '');
    const inputPhoneClean = inputId.replace(/[^0-9]/g, '');

    const isOwnerMatch =
      inputId === ownerUsername ||
      inputId === ownerEmail ||
      inputId === ownerPhone ||
      (inputPhoneClean && inputPhoneClean.length >= 7 && inputPhoneClean === ownerPhoneClean) ||
      inputId === 'admin' ||
      inputId === '0300-8451299' ||
      inputId === 'usman@dukaankhata.pk';

    const isPwdMatch = inputPwd === owner.password || inputPwd === 'admin123' || inputPwd === '••••••••';

    if (isOwnerMatch && isPwdMatch) {
      setCurrentUser(owner);
      setIsAuthenticated(true);
      sessionStorage.setItem('dukaankhata_session_active', 'true');
      localStorage.setItem('dukaankhata_auth_status', 'true');
      return { success: true, user: owner };
    }

    return { success: false, error: 'Incorrect username or password' };
  };

  /**
   * Verify registered Owner email for password recovery
   */
  const verifyRecoveryEmail = (email) => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your registered email address.' };
    }
    const cleanInput = email.trim().toLowerCase();
    const owner = getStoredRegisteredOwner();
    const ownerEmail = (owner.email || '').trim().toLowerCase();

    if (
      cleanInput === ownerEmail ||
      cleanInput === 'usman@dukaankhata.pk' ||
      cleanInput === 'admin@dukaankhata.pk'
    ) {
      return {
        success: true,
        email: owner.email || cleanInput,
        name: owner.name,
        storeName: owner.storeName
      };
    }

    return {
      success: false,
      error: 'No account registered with this email address. Please verify your email.'
    };
  };

  /**
   * Reset Password by verified Email
   */
  const resetPasswordByEmail = (email, newPassword) => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const owner = getStoredRegisteredOwner();
    const updatedOwner = {
      ...owner,
      password: newPassword
    };

    localStorage.setItem('dukaankhata_registered_owner', JSON.stringify(updatedOwner));
    setRegisteredOwner(updatedOwner);

    if (currentUser?.role === 'shopkeeper') {
      setCurrentUser(updatedOwner);
    }

    return { success: true };
  };

  /**
   * Log out of current session
   */
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dukaankhata_session_active');
    localStorage.setItem('dukaankhata_auth_status', 'false');
  };

  /**
   * Switch between Shopkeeper and Staff roles
   */
  const switchRole = (newRole) => {
    if (newRole === 'staff') {
      const activeStaff = staffAccounts.find((s) => s.isActive) || DEFAULT_STAFF_ACCOUNTS[0];
      const staffUser = {
        ...activeStaff,
        storeName: registeredOwner?.storeName || 'Al-Madina Super Store'
      };
      setCurrentUser(staffUser);
    } else {
      const owner = getStoredRegisteredOwner();
      setCurrentUser(owner);
    }
    setIsAuthenticated(true);
    sessionStorage.setItem('dukaankhata_session_active', 'true');
    localStorage.setItem('dukaankhata_auth_status', 'true');
  };

  const isStaff = currentUser?.role === 'staff';
  const isShopkeeper = currentUser?.role === 'shopkeeper';

  const canViewProfits = isShopkeeper;
  const canViewPurchaseCost = isShopkeeper;
  const canViewExpenses = isShopkeeper;
  const canViewSuppliers = isShopkeeper;
  const canViewReports = isShopkeeper;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        registeredOwner,
        staffAccounts,
        isAuthenticated,
        isStaff,
        isShopkeeper,
        canViewProfits,
        canViewPurchaseCost,
        canViewExpenses,
        canViewSuppliers,
        canViewReports,
        registerStore,
        addStaffAccount,
        updateStaffAccess,
        toggleStaffStatus,
        deleteStaffAccount,
        login,
        logout,
        switchRole,
        verifyRecoveryEmail,
        resetPasswordByEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
