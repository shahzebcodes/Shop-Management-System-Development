import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_LEDGER,
  INITIAL_SUPPLIERS,
  INITIAL_EXPENSES,
  INITIAL_SALES,
  INITIAL_SUPPLIER_LEDGER
} from '../data/initialData';
import { playBeep, playCashSuccess } from '../utils/sound';

const ShopDataContext = createContext();

export function ShopDataProvider({ children }) {
  // 1. Persistent Storage Helpers
  const loadState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`dukaan_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [categories, setCategories] = useState(() => loadState('categories', INITIAL_CATEGORIES));
  const [units, setUnits] = useState(() => loadState('units', INITIAL_UNITS));
  const [products, setProducts] = useState(() => loadState('products', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState(() => loadState('customers', INITIAL_CUSTOMERS));
  const [customerLedger, setCustomerLedger] = useState(() => loadState('ledger', INITIAL_CUSTOMER_LEDGER));
  const [suppliers, setSuppliers] = useState(() => loadState('suppliers', INITIAL_SUPPLIERS));
  const [supplierLedger, setSupplierLedger] = useState(() => loadState('supplier_ledger', INITIAL_SUPPLIER_LEDGER));
  const [expenses, setExpenses] = useState(() => loadState('expenses', INITIAL_EXPENSES));
  const [sales, setSales] = useState(() => loadState('sales', INITIAL_SALES));

  // 2. Active POS Cart State - Starts completely empty by default
  const [cart, setCart] = useState(() => loadState('cart', []));
  const [cartCustomer, setCartCustomer] = useState(null); // Walk-in Cash Customer by default
  const [cartDiscount, setCartDiscount] = useState(0);
  const [cartPaymentType, setCartPaymentType] = useState('cash'); // 'cash' | 'udhaar' | 'split'
  const [cartTendered, setCartTendered] = useState(0);
  const [cartSplitCash, setCartSplitCash] = useState(0);
  const [cartDueDate, setCartDueDate] = useState('');

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('dukaan_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('dukaan_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('dukaan_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dukaan_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dukaan_ledger', JSON.stringify(customerLedger));
  }, [customerLedger]);

  useEffect(() => {
    localStorage.setItem('dukaan_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('dukaan_supplier_ledger', JSON.stringify(supplierLedger));
  }, [supplierLedger]);

  useEffect(() => {
    localStorage.setItem('dukaan_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('dukaan_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('dukaan_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart Management Functions
  const addToCart = (product, qtyToAdd = 1) => {
    playBeep();
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const existing = updated[existingIndex];
        const newQty = Number((existing.qty + qtyToAdd).toFixed(3));
        const newTotal = Number((newQty * existing.price).toFixed(2));
        updated[existingIndex] = {
          ...existing,
          qty: newQty,
          total: newTotal
        };
        return updated;
      } else {
        const itemQty = Number(qtyToAdd);
        const itemPrice = product.salePrice;
        return [
          ...prevCart,
          {
            product,
            qty: itemQty,
            unit: product.baseUnit,
            price: itemPrice,
            total: Number((itemQty * itemPrice).toFixed(2))
          }
        ];
      }
    });
    showToast(`${product.name} added to cart`);
  };

  const updateCartItemQty = (productId, newQty) => {
    const validQty = Math.max(0, Number(newQty));
    if (validQty === 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const roundedQty = Number(validQty.toFixed(3));
          return {
            ...item,
            qty: roundedQty,
            total: Number((roundedQty * item.price).toFixed(2))
          };
        }
        return item;
      })
    );
  };

  const updateCartItemUnit = (productId, newUnit) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          let adjustedPrice = item.product.salePrice;
          let adjustedQty = item.qty;

          if (item.unit === 'kg' && newUnit === 'g') {
            adjustedPrice = item.product.salePrice / 1000;
            adjustedQty = item.qty * 1000;
          } else if (item.unit === 'g' && newUnit === 'kg') {
            adjustedPrice = item.product.salePrice;
            adjustedQty = item.qty / 1000;
          }

          return {
            ...item,
            unit: newUnit,
            price: adjustedPrice,
            qty: adjustedQty,
            total: Number((adjustedQty * adjustedPrice).toFixed(2))
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscount(0);
    setCartCustomer(null);
    setCartTendered(0);
    setCartSplitCash(0);
    setCartDueDate('');
    localStorage.removeItem('dukaan_cart');
  };

  // Cart Totals Calculation
  const cartSubtotal = Number(cart.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  const cartGrandTotal = Math.max(0, Number((cartSubtotal - cartDiscount).toFixed(2)));

  // Checkout Execution
  const checkoutOrder = (cashierName = 'Haji Muhammad Usman') => {
    if (cart.length === 0) {
      showToast('Cart is empty!', 'danger');
      return null;
    }

    if ((cartPaymentType === 'udhaar' || cartPaymentType === 'split') && !cartCustomer) {
      showToast('Please select a customer for Udhaar credit bill!', 'warning');
      return null;
    }

    const invoiceNo = `INV-${Math.floor(4800 + sales.length + 1)}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let totalCogs = 0;
    cart.forEach((item) => {
      const costPerUnit = item.product.purchasePrice || (item.price * 0.8);
      totalCogs += costPerUnit * item.qty;
    });

    const netProfit = Number((cartGrandTotal - totalCogs).toFixed(2));

    let cashReceived = 0;
    let udhaarPortion = 0;
    let changeReturn = 0;

    if (cartPaymentType === 'cash') {
      cashReceived = cartTendered >= cartGrandTotal ? cartTendered : cartGrandTotal;
      changeReturn = Number((cashReceived - cartGrandTotal).toFixed(2));
    } else if (cartPaymentType === 'udhaar') {
      udhaarPortion = cartGrandTotal;
      cashReceived = 0;
      changeReturn = 0;
    } else if (cartPaymentType === 'split') {
      cashReceived = Math.min(cartSplitCash, cartGrandTotal);
      udhaarPortion = Number((cartGrandTotal - cashReceived).toFixed(2));
      changeReturn = 0;
    }

    const newSale = {
      id: `sale_${Date.now()}`,
      invoiceNo,
      date: dateStr,
      time: timeStr,
      customerType: cartCustomer ? 'khata' : 'walkin',
      customerId: cartCustomer ? cartCustomer.id : null,
      customerName: cartCustomer ? cartCustomer.name : 'Walk-in Cash Customer',
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        qty: item.qty,
        unit: item.unit,
        price: item.price,
        total: item.total
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      total: cartGrandTotal,
      paymentType: cartPaymentType,
      cashTendered: cashReceived,
      changeReturn,
      udhaarAmount: udhaarPortion,
      dueDate: (cartPaymentType !== 'cash' && cartDueDate) ? cartDueDate : null,
      cogs: Number(totalCogs.toFixed(2)),
      profit: netProfit,
      cashier: cashierName
    };

    // 1. Deduct Product Live Stock
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatch = cart.find((c) => c.product.id === prod.id);
        if (cartMatch) {
          const newStock = Math.max(0, Number((prod.currentStock - cartMatch.qty).toFixed(3)));
          return {
            ...prod,
            currentStock: newStock
          };
        }
        return prod;
      })
    );

    // 2. If Udhaar/Split, Update Customer Ledger & Balance
    if (udhaarPortion > 0 && cartCustomer) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === cartCustomer.id) {
            const newBal = c.currentBalance + udhaarPortion;
            return {
              ...c,
              currentBalance: newBal,
              status: 'due_soon',
              dueDate: cartDueDate || c.dueDate
            };
          }
          return c;
        })
      );

      const newLedgerEntry = {
        id: `led_${Date.now()}`,
        customerId: cartCustomer.id,
        customerName: cartCustomer.name,
        date: dateStr,
        time: timeStr,
        type: 'DEBIT_BILL',
        invoiceNo,
        amount: udhaarPortion,
        runningBalance: (cartCustomer.currentBalance || 0) + udhaarPortion,
        description: `POS Bill #${invoiceNo} (${cartPaymentType === 'split' ? `Split: Rs. ${cashReceived} Cash + Rs. ${udhaarPortion} Udhaar` : 'Full Udhaar Credit'})`,
        items: cart.map((i) => ({
          name: i.product.name,
          qty: `${i.qty} ${i.unit}`,
          total: i.total
        }))
      };

      setCustomerLedger((prev) => [newLedgerEntry, ...prev]);
    }

    // 3. Record Sale
    setSales((prev) => [newSale, ...prev]);

    // 4. Play Cash Chime
    playCashSuccess();

    // 5. Reset Cart & Show Notice
    clearCart();
    showToast(`Invoice ${invoiceNo} charged successfully! Total: Rs. ${cartGrandTotal.toLocaleString()}`);

    return newSale;
  };

  // Customer Management
  const receiveCustomerPayment = (customerId, amount, paymentMode = 'Cash', note = 'Payment received') => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    const newBalance = Math.max(0, cust.currentBalance - numAmount);
    const newStatus = newBalance === 0 ? 'settled' : 'due_soon';

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            currentBalance: newBalance,
            status: newStatus,
            lastPaymentDate: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      })
    );

    const now = new Date();
    const newEntry = {
      id: `led_rec_${Date.now()}`,
      customerId,
      customerName: cust.name,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'CREDIT_PAYMENT',
      invoiceNo: `REC-${Math.floor(100 + Math.random() * 900)}`,
      amount: numAmount,
      runningBalance: newBalance,
      description: `${paymentMode} payment received: ${note}`,
      items: []
    };

    setCustomerLedger((prev) => [newEntry, ...prev]);
    playCashSuccess();
    showToast(`Received Rs. ${numAmount.toLocaleString()} from ${cust.name}! Remaining balance: Rs. ${newBalance.toLocaleString()}`);
  };

  const addCustomer = (customerData) => {
    const newCust = {
      id: `cust_${Date.now()}`,
      ...customerData,
      currentBalance: Number(customerData.currentBalance || 0),
      status: Number(customerData.currentBalance || 0) > 0 ? 'due_soon' : 'settled',
      avatar: customerData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    setCustomers((prev) => [...prev, newCust]);
    showToast(`Customer ${newCust.name} added successfully!`);
    return newCust;
  };

  // Stock-In Purchase Management
  const stockInPurchase = ({ supplierId, date, items, amountPaid = 0, invoiceNote = '' }) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    let totalCost = 0;

    items.forEach((item) => {
      totalCost += Number(item.qty) * Number(item.purchasePrice);
    });

    const numPaid = Number(amountPaid);
    const balanceOwed = Math.max(0, totalCost - numPaid);

    // 1. Update Product Live Stock & Cost
    setProducts((prev) =>
      prev.map((prod) => {
        const itemMatch = items.find((it) => it.productId === prod.id);
        if (itemMatch) {
          const addedQty = Number(itemMatch.qty);
          return {
            ...prod,
            currentStock: Number((prod.currentStock + addedQty).toFixed(3)),
            purchasePrice: Number(itemMatch.purchasePrice) || prod.purchasePrice
          };
        }
        return prod;
      })
    );

    // 2. Update Supplier Balance
    if (supplier) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === supplierId) {
            return {
              ...s,
              totalPurchases: s.totalPurchases + totalCost,
              totalPaid: s.totalPaid + numPaid,
              balanceOwed: s.balanceOwed + balanceOwed
            };
          }
          return s;
        })
      );
    }

    // 3. Record Supplier Ledger Entry
    const now = new Date();
    const invoiceNo = invoiceNote || `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLedgerEntry = {
      id: `sup_led_${Date.now()}`,
      supplierId,
      supplierName: supplier ? supplier.name : 'Wholesale Supplier',
      date: date || now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'STOCK_IN',
      invoiceNo,
      totalAmount: totalCost,
      amountPaid: numPaid,
      balanceChange: balanceOwed,
      runningBalance: supplier ? supplier.balanceOwed + balanceOwed : balanceOwed,
      note: invoiceNote ? `Stock-In: ${invoiceNote}` : `Stock-In Batch (${items.length} items replenished)`,
      items: items.map((it) => {
        const p = products.find((prod) => prod.id === it.productId);
        return {
          name: p ? p.name : it.productId,
          qty: it.qty,
          purchasePrice: it.purchasePrice,
          total: Number(it.qty) * Number(it.purchasePrice)
        };
      })
    };
    setSupplierLedger((prev) => [newLedgerEntry, ...prev]);

    playCashSuccess();
    showToast(`Stock In verified! ${items.length} items replenished. Total: Rs. ${totalCost.toLocaleString()}`);
  };

  const paySupplier = (supplierId, amount, paymentMode = 'Cash', note = 'Payment to supplier') => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    const newBalance = Math.max(0, supplier.balanceOwed - numAmount);
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          return {
            ...s,
            totalPaid: s.totalPaid + numAmount,
            balanceOwed: newBalance
          };
        }
        return s;
      })
    );

    // Record Payment Voucher in Supplier Ledger
    const now = new Date();
    const newEntry = {
      id: `sup_pay_${Date.now()}`,
      supplierId,
      supplierName: supplier.name,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'PAYMENT',
      invoiceNo: `PAY-${Math.floor(100 + Math.random() * 900)}`,
      totalAmount: 0,
      amountPaid: numAmount,
      balanceChange: -numAmount,
      runningBalance: newBalance,
      note: `${paymentMode} Payment: ${note || 'Settlement'}`,
      items: []
    };
    setSupplierLedger((prev) => [newEntry, ...prev]);

    playCashSuccess();
    showToast(`Paid Rs. ${numAmount.toLocaleString()} to ${supplier.name}. Balance remaining: Rs. ${newBalance.toLocaleString()}`);
  };

  // Expense Management
  const addExpense = (expenseData) => {
    const newExp = {
      id: `exp_${Date.now()}`,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      category: expenseData.category,
      title: expenseData.title,
      amount: Number(expenseData.amount),
      paymentMode: expenseData.paymentMode || 'Cash',
      note: expenseData.note || ''
    };
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Expense added: ${newExp.title} (Rs. ${newExp.amount.toLocaleString()})`);
  };

  // Product CRUD
  const addProduct = (productData) => {
    const newProd = {
      id: `prod_${Date.now()}`,
      ...productData,
      purchasePrice: Number(productData.purchasePrice),
      salePrice: Number(productData.salePrice),
      currentStock: Number(productData.currentStock),
      minStock: Number(productData.minStock || 5),
      image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Product "${newProd.name}" added to inventory!`);
  };

  const editProduct = (productData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productData.id ? { ...p, ...productData } : p))
    );
    showToast(`Product "${productData.name}" updated!`);
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from inventory', 'info');
  };

  // Category & Unit Management
  const addCategory = (name, color = '#0F766E', icon = 'category') => {
    const id = `cat_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const exists = categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      showToast('Category already exists!', 'warning');
      return;
    }
    const newCat = { id, name, icon, color };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${name}" created!`);
  };

  const addUnit = (unitData) => {
    const newUnit = {
      id: `u_${Date.now()}`,
      ...unitData
    };
    setUnits((prev) => [...prev, newUnit]);
    showToast(`Unit "${newUnit.name} (${newUnit.symbol})" added!`);
  };

  const resetToDefaultData = () => {
    setCategories(INITIAL_CATEGORIES);
    setUnits(INITIAL_UNITS);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setCustomerLedger(INITIAL_CUSTOMER_LEDGER);
    setSuppliers(INITIAL_SUPPLIERS);
    setSupplierLedger(INITIAL_SUPPLIER_LEDGER);
    setExpenses(INITIAL_EXPENSES);
    setSales(INITIAL_SALES);
    clearCart();
    localStorage.clear();
    showToast('Demo store data reset to factory initial state!');
  };

  // Start Fresh - Empty all dynamic shop data for clean zero testing
  const clearAllData = () => {
    setProducts([]);
    setCustomers([]);
    setCustomerLedger([]);
    setSuppliers([]);
    setSupplierLedger([]);
    setExpenses([]);
    setSales([]);
    clearCart();
    localStorage.setItem('dukaan_products', JSON.stringify([]));
    localStorage.setItem('dukaan_customers', JSON.stringify([]));
    localStorage.setItem('dukaan_ledger', JSON.stringify([]));
    localStorage.setItem('dukaan_suppliers', JSON.stringify([]));
    localStorage.setItem('dukaan_supplier_ledger', JSON.stringify([]));
    localStorage.setItem('dukaan_expenses', JSON.stringify([]));
    localStorage.setItem('dukaan_sales', JSON.stringify([]));
    localStorage.setItem('dukaan_cart', JSON.stringify([]));
    showToast('Store reset to blank! All demo products, sales, customers, suppliers & expenses cleared.');
  };

  return (
    <ShopDataContext.Provider
      value={{
        categories,
        units,
        products,
        customers,
        customerLedger,
        suppliers,
        supplierLedger,
        expenses,
        sales,
        cart,
        cartCustomer,
        setCartCustomer,
        cartDiscount,
        setCartDiscount,
        cartPaymentType,
        setCartPaymentType,
        cartTendered,
        setCartTendered,
        cartSplitCash,
        setCartSplitCash,
        cartDueDate,
        setCartDueDate,
        cartSubtotal,
        cartGrandTotal,
        addToCart,
        updateCartItemQty,
        updateCartItemUnit,
        removeFromCart,
        clearCart,
        checkoutOrder,
        receiveCustomerPayment,
        addCustomer,
        stockInPurchase,
        paySupplier,
        addExpense,
        addProduct,
        editProduct,
        deleteProduct,
        addCategory,
        addUnit,
        resetToDefaultData,
        clearAllData,
        toast,
        showToast
      }}
    >
      {children}
    </ShopDataContext.Provider>
  );
}

export function useShopData() {
  const context = useContext(ShopDataContext);
  if (!context) {
    throw new Error('useShopData must be used within a ShopDataProvider');
  }
  return context;
}
