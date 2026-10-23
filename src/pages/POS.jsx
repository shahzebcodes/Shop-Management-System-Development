import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShopData } from '../context/ShopDataContext';
import { playBeep } from '../utils/sound';
import { ThermalReceiptModal } from '../components/ThermalReceiptModal';

export function POS({ onNavigateToKhata }) {
  const { currentUser } = useAuth();
  const {
    products,
    categories,
    customers,
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
    showToast
  } = useShopData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [recentReceipt, setRecentReceipt] = useState(null);

  const searchInputRef = useRef(null);

  // Focus search input on mount and F2 keypress
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setCartPaymentType('cash');
        showToast('Switched to Cash payment mode [F4]', 'info');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setCartPaymentType('udhaar');
        showToast('Switched to Udhaar credit mode [F8]', 'warning');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter Catalog
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =
      selectedCategory === 'all' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCat;
  });

  // Camera Barcode Scanner Simulation
  const handleBarcodeScan = () => {
    if (soundEnabled) playBeep();
    // Simulate finding a random item or basmati rice
    const sampleProduct = products[Math.floor(Math.random() * products.length)];
    addToCart(sampleProduct, 1);
    showToast(`Scanned Barcode: ${sampleProduct.name} (${sampleProduct.barcode})`);
  };

  // Quick weight button helper (+250g, +500g, +1kg)
  const handleQuickWeight = (productId, currentQty, addedWeightKg) => {
    const newQty = Number((Number(currentQty) + addedWeightKg).toFixed(3));
    updateCartItemQty(productId, newQty);
  };

  // Change returned in Cash Mode
  const cashChangeReturn = Math.max(0, Number((cartTendered - cartGrandTotal).toFixed(2)));

  // Master Checkout execution
  const handleExecuteCheckout = () => {
    const receipt = checkoutOrder(currentUser.name);
    if (receipt) {
      setRecentReceipt(receipt);
    }
  };

  return (
    <div className="workspace-container" style={{ paddingBottom: '2rem' }}>
      {/* POS 60/40 Split Desktop Layout */}
      <div className="pos-split-layout">
        {/* =========================================================
            LEFT 60%: CATALOG & BARCODE SEARCH
           ========================================================= */}
        <div className="pos-catalog-panel">
          {/* Top Barcode Search Bar & Shortcuts */}
          <div className="card" style={{ padding: '0.875rem', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                  className="material-symbols-outlined"
                >
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Scan barcode or search item by name... [F2]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '45px',
                    height: '44px',
                    fontSize: '14.5px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC'
                  }}
                />
                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  className="kbd-chip"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  F2
                </button>
              </div>

              {/* Audio Beeper Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playBeep();
                }}
                className={`btn-icon ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '44px', height: '44px', flexShrink: 0 }}
                title={soundEnabled ? 'Barcode Sound Feedback Active' : 'Sound Muted'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>

              {/* Scan Barcode Camera Trigger */}
              <button
                type="button"
                onClick={handleBarcodeScan}
                className="btn btn-secondary"
                style={{
                  height: '44px',
                  backgroundColor: '#0F172A',
                  color: '#2DD4BF',
                  border: 'none',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Trigger Barcode Scanner"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>qr_code_scanner</span>
                <span className="desktop-only" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>SCAN</span>
              </button>
            </div>

            {/* Category Pills Carousel */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingTop: '10px',
                paddingBottom: '2px',
                whiteSpace: 'nowrap'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: selectedCategory === 'all' ? '#0F766E' : '#F1F5F9',
                  color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: selectedCategory === 'all' ? '0 2px 4px rgba(15, 118, 110, 0.3)' : 'none'
                }}
              >
                All Items ({products.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: selectedCategory === cat.name ? '#0F766E' : '#F1F5F9',
                    color: selectedCategory === cat.name ? '#FFFFFF' : 'var(--text-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '10px',
              paddingBottom: '1rem'
            }}
          >
            {filteredProducts.map((p) => {
              const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;
              const isOut = p.currentStock <= 0;

              return (
                <div
                  key={p.id}
                  className="card card-hover"
                  style={{
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: isOut ? 'not-allowed' : 'pointer',
                    opacity: isOut ? 0.6 : 1,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => {
                    if (!isOut) addToCart(p, 1);
                  }}
                >
                  <div>
                    <div style={{ position: 'relative', height: '110px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', backgroundColor: '#F1F5F9' }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span
                        className={`badge ${isOut ? 'badge-red' : isLow ? 'badge-amber' : 'badge-green'}`}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          fontSize: '10px',
                          padding: '2px 6px'
                        }}
                      >
                        {isOut ? 'Out of Stock' : `${p.currentStock} ${p.baseUnit}`}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--text-heading)',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {p.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {p.category}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '8px',
                      paddingTop: '6px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <span className="tabular-nums" style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-heading)' }}>
                        Rs. {p.salePrice}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>/{p.baseUnit}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isOut}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOut) addToCart(p, 1);
                      }}
                      className="btn-icon btn-primary"
                      style={{ width: '32px', height: '32px' }}
                      title="Add to Bill"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            RIGHT 40%: STICKY LIVE BILL CART & PAYMENT SETTLEMENT
           ========================================================= */}
        <div className="pos-cart-panel">
          <div
            className="card"
            style={{
              padding: '0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
              border: '1px solid #CBD5E1'
            }}
          >
            {/* Cart Header */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--primary)' }}>
                  shopping_cart
                </span>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-heading)' }}>
                  Current Order
                </h3>
                <span className="badge badge-teal" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {cart.length} Items
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete_sweep</span>
                  <span>Clear Bill</span>
                </button>
              )}
            </div>

            {/* Customer Selector Strip (Walk-in vs Khata Customer) */}
            <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Customer Ledger Type
                </span>
                {cartCustomer && (
                  <span className="badge badge-amber" style={{ fontSize: '10.5px' }}>
                    Credit Cap: Rs. {cartCustomer.creditLimit?.toLocaleString()}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCartCustomer(null)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: !cartCustomer ? 'var(--primary)' : 'var(--border-subtle)',
                    backgroundColor: !cartCustomer ? 'var(--primary-light)' : '#FFFFFF',
                    color: !cartCustomer ? 'var(--primary)' : 'var(--text-body)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Walk-in Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(true)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: cartCustomer ? '#D97706' : 'var(--border-subtle)',
                    backgroundColor: cartCustomer ? '#FEF3C7' : '#FFFFFF',
                    color: cartCustomer ? '#92400E' : 'var(--text-body)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_search</span>
                  <span>{cartCustomer ? 'Change Khata' : 'Khata Customer'}</span>
                </button>
              </div>

              {/* Selected Customer Active Pill */}
              {cartCustomer && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 10px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '6px',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={cartCustomer.avatar}
                      alt={cartCustomer.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-heading)', display: 'block' }}>
                        {cartCustomer.name}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        Prev Khata Balance: <strong style={{ color: '#D97706' }}>Rs. {cartCustomer.currentBalance.toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCartCustomer(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items List Tape */}
            <div
              style={{
                flex: 1,
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#CBD5E1' }}>
                    shopping_basket
                  </span>
                  <p style={{ margin: '6px 0 0 0', fontWeight: 600, fontSize: '13px' }}>
                    Bill is empty. Scan barcode or tap items on left!
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const isWeightItem = item.unit === 'kg' || item.unit === 'g';

                  return (
                    <div
                      key={item.product.id}
                      style={{
                        padding: '10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>
                            {item.product.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span className="tabular-nums" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Rs. {item.price}/{item.unit}
                            </span>
                            {/* Unit Switcher if kg/g */}
                            {isWeightItem && (
                              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '4px', padding: '1px' }}>
                                <button
                                  type="button"
                                  onClick={() => updateCartItemUnit(item.product.id, 'kg')}
                                  style={{
                                    border: 'none',
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    backgroundColor: item.unit === 'kg' ? '#0F766E' : 'transparent',
                                    color: item.unit === 'kg' ? '#FFFFFF' : 'var(--text-muted)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  KG
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateCartItemUnit(item.product.id, 'g')}
                                  style={{
                                    border: 'none',
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    backgroundColor: item.unit === 'g' ? '#0F766E' : 'transparent',
                                    color: item.unit === 'g' ? '#FFFFFF' : 'var(--text-muted)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  G
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-heading)' }}>
                            Rs. {item.total?.toFixed ? item.total.toFixed(2) : item.total}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                          </button>
                        </div>
                      </div>

                      {/* Stepper + Quick Weight Shortcuts */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(item.product.id, item.qty - (isWeightItem ? 0.25 : 1))}
                            style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step={isWeightItem ? '0.05' : '1'}
                            value={item.qty}
                            onChange={(e) => updateCartItemQty(item.product.id, e.target.value)}
                            style={{ width: '60px', height: '26px', textAlign: 'center', padding: '0 4px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                          />
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(item.product.id, item.qty + (isWeightItem ? 0.25 : 1))}
                            style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                          >
                            +
                          </button>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '2px' }}>
                            {item.unit}
                          </span>
                        </div>

                        {/* Quick Weight Chips (+250g, +500g, +1kg) */}
                        {isWeightItem && (
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <button
                              type="button"
                              onClick={() => handleQuickWeight(item.product.id, item.qty, 0.25)}
                              style={{ padding: '2px 5px', fontSize: '10px', fontWeight: 700, backgroundColor: '#E2E8F0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              +250g
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickWeight(item.product.id, item.qty, 0.5)}
                              style={{ padding: '2px 5px', fontSize: '10px', fontWeight: 700, backgroundColor: '#E2E8F0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              +500g
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickWeight(item.product.id, item.qty, 1.0)}
                              style={{ padding: '2px 5px', fontSize: '10px', fontWeight: 700, backgroundColor: '#E2E8F0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              +1kg
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Subtotal, Discount & Grand Total Banner */}
            <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Items Subtotal:</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                  Rs. {cartSubtotal.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shop Discount:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>- Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={cartDiscount}
                    onChange={(e) => setCartDiscount(Number(e.target.value) || 0)}
                    style={{ width: '70px', height: '26px', fontSize: '12px', textAlign: 'right', fontWeight: 700, padding: '2px 6px' }}
                  />
                </div>
              </div>
            </div>

            {/* Grand Total Monospace Banner */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.5px', display: 'block' }}>
                  Net Total Payable
                </span>
                <span style={{ fontSize: '11px', color: '#2DD4BF' }}>GST Inclusive (0%)</span>
              </div>
              <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: '#2DD4BF', letterSpacing: '-0.5px' }}>
                Rs. {cartGrandTotal.toLocaleString()}
              </div>
            </div>

            {/* 3-Way Payment Settlement Box */}
            <div style={{ padding: '12px 14px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                {/* Cash Tab */}
                <button
                  type="button"
                  onClick={() => setCartPaymentType('cash')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: cartPaymentType === 'cash' ? '#16A34A' : '#E2E8F0',
                    backgroundColor: cartPaymentType === 'cash' ? '#DCFCE7' : '#F8FAFC',
                    color: cartPaymentType === 'cash' ? '#166534' : 'var(--text-body)',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                  <span>Cash [F4]</span>
                </button>

                {/* Udhaar Tab */}
                <button
                  type="button"
                  onClick={() => setCartPaymentType('udhaar')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: cartPaymentType === 'udhaar' ? '#D97706' : '#E2E8F0',
                    backgroundColor: cartPaymentType === 'udhaar' ? '#FEF3C7' : '#F8FAFC',
                    color: cartPaymentType === 'udhaar' ? '#92400E' : 'var(--text-body)',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>menu_book</span>
                  <span>Full Udhaar [F8]</span>
                </button>

                {/* Split Tab */}
                <button
                  type="button"
                  onClick={() => setCartPaymentType('split')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: cartPaymentType === 'split' ? 'var(--primary)' : '#E2E8F0',
                    backgroundColor: cartPaymentType === 'split' ? 'var(--primary-light)' : '#F8FAFC',
                    color: cartPaymentType === 'split' ? 'var(--primary)' : 'var(--text-body)',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call_split</span>
                  <span>Split Pay</span>
                </button>
              </div>

              {/* Mode 1: Cash Return Change Calculator */}
              {cartPaymentType === 'cash' && (
                <div style={{ padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tendered Cash:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Rs.</span>
                      <input
                        type="number"
                        value={cartTendered}
                        onChange={(e) => setCartTendered(Number(e.target.value) || 0)}
                        style={{ width: '90px', height: '28px', fontSize: '13px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>

                  {/* Quick Tender Currency Notes */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setCartTendered(cartGrandTotal)}
                      style={{ flex: 1, padding: '3px', fontSize: '10px', fontWeight: 700, backgroundColor: '#E2E8F0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Exact
                    </button>
                    {[500, 1000, 5000].map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setCartTendered(note)}
                        style={{ flex: 1, padding: '3px', fontSize: '10px', fontWeight: 700, backgroundColor: '#E2E8F0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Rs.{note}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)' }}>Return Change:</span>
                    <span className="tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)' }}>
                      Rs. {cashChangeReturn.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Mode 2: Full Udhaar Panel */}
              {cartPaymentType === 'udhaar' && (
                <div style={{ padding: '8px 10px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11.5px', color: '#92400E' }}>Ledger Customer:</span>
                    <strong style={{ fontSize: '12px', color: '#92400E' }}>
                      {cartCustomer ? cartCustomer.name : 'No Customer Selected!'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', color: '#92400E' }}>Promised Due Date:</span>
                    <input
                      type="date"
                      value={cartDueDate}
                      onChange={(e) => setCartDueDate(e.target.value)}
                      style={{ width: '130px', height: '28px', fontSize: '11px', fontWeight: 600 }}
                    />
                  </div>
                </div>
              )}

              {/* Mode 3: Split Payment Panel */}
              {cartPaymentType === 'split' && (
                <div style={{ padding: '8px 10px', backgroundColor: '#F0FDFA', borderRadius: '8px', border: '1px solid #99F6E4', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11.5px', color: '#115E59' }}>Cash Paid Now:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11.5px' }}>Rs.</span>
                      <input
                        type="number"
                        value={cartSplitCash}
                        onChange={(e) => setCartSplitCash(Number(e.target.value) || 0)}
                        style={{ width: '85px', height: '28px', fontSize: '12.5px', textAlign: 'right', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', color: '#D97706', fontWeight: 700 }}>Add to Udhaar:</span>
                    <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: '#D97706' }}>
                      Rs. {Math.max(0, cartGrandTotal - cartSplitCash).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Master Checkout & Print CTA */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleExecuteCheckout}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '14px',
                  boxShadow: '0 4px 14px rgba(15, 118, 110, 0.4)',
                  opacity: cart.length === 0 ? 0.5 : 1
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>receipt_long</span>
                <span>Charge & Print Bill (80mm)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Khata Customer Selection Modal */}
      {customerModalOpen && (
        <div className="modal-overlay" onClick={() => setCustomerModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Select Udhaar Customer
              </h3>
              <button onClick={() => setCustomerModalOpen(false)} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCartCustomer(c);
                    setCustomerModalOpen(false);
                    showToast(`Selected customer: ${c.name}`);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: cartCustomer?.id === c.id ? '#F0FDFA' : '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={c.avatar}
                      alt={c.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {c.name}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {c.phone} • Salary Day: {c.salaryDay}th
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="tabular-nums" style={{ fontSize: '13.5px', fontWeight: 800, color: c.currentBalance > 0 ? '#D97706' : 'var(--success)' }}>
                      Rs. {c.currentBalance.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                      Balance
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => {
                  setCustomerModalOpen(false);
                  if (onNavigateToKhata) onNavigateToKhata();
                }}
                className="btn btn-secondary"
                style={{ fontSize: '12px' }}
              >
                + Register New Customer in Khata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 80mm Thermal Receipt Modal Preview & Print */}
      {recentReceipt && (
        <ThermalReceiptModal
          receipt={recentReceipt}
          onClose={() => setRecentReceipt(null)}
        />
      )}
    </div>
  );
}
