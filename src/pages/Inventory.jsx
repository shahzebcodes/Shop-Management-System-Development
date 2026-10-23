import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShopData } from '../context/ShopDataContext';

export function Inventory({ onNavigateToPurchases }) {
  const { isShopkeeper, isStaff, canViewPurchaseCost, canViewProfits } = useAuth();
  const { products, categories, units, addProduct, editProduct, deleteProduct, showToast } = useShopData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'low' | 'out' | 'instock'

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery & Staples',
    brand: '',
    baseUnit: 'kg',
    purchasePrice: '',
    salePrice: '',
    currentStock: '',
    minStock: '10',
    barcode: '',
    image: ''
  });

  // Camera Barcode Scanner Simulation
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomBarcode = '896' + Math.floor(100000000 + Math.random() * 900000000);
      setFormData((prev) => ({ ...prev, barcode: randomBarcode }));
      setIsScanning(false);
      showToast('Barcode scanned successfully: ' + randomBarcode);
    }, 900);
  };

  // Profit Margin Live Calculation
  const cost = Number(formData.purchasePrice) || 0;
  const retail = Number(formData.salePrice) || 0;
  const liveMargin = retail > 0 && cost > 0 ? (((retail - cost) / retail) * 100).toFixed(1) : 0;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'low') {
      matchesStatus = p.currentStock > 0 && p.currentStock <= p.minStock;
    } else if (statusFilter === 'out') {
      matchesStatus = p.currentStock <= 0;
    } else if (statusFilter === 'instock') {
      matchesStatus = p.currentStock > p.minStock;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Valuation metrics (Shopkeeper Only)
  const totalPurchaseValue = products.reduce((sum, p) => sum + (p.purchasePrice || 0) * (p.currentStock || 0), 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.salePrice || 0) * (p.currentStock || 0), 0);
  const expectedProfit = totalRetailValue - totalPurchaseValue;
  const expectedRoi = totalPurchaseValue > 0 ? ((expectedProfit / totalPurchaseValue) * 100).toFixed(1) : 0;

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || 'Grocery & Staples',
      brand: '',
      baseUnit: 'kg',
      purchasePrice: '',
      salePrice: '',
      currentStock: '',
      minStock: '10',
      barcode: '896' + Math.floor(100000000 + Math.random() * 900000000),
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand || '',
      baseUnit: product.baseUnit,
      purchasePrice: product.purchasePrice || '',
      salePrice: product.salePrice,
      currentStock: product.currentStock,
      minStock: product.minStock,
      barcode: product.barcode,
      image: product.image
    });
    setIsModalOpen(true);
  };

  // Submit Product
  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.salePrice || formData.currentStock === '') {
      alert('Please fill in required fields');
      return;
    }

    if (editingProduct) {
      editProduct({
        ...editingProduct,
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        salePrice: Number(formData.salePrice),
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock)
      });
    } else {
      addProduct({
        ...formData,
        purchasePrice: Number(formData.purchasePrice || formData.salePrice * 0.8),
        salePrice: Number(formData.salePrice),
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock)
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="workspace-container">
      {/* Top Header Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Products & Live Inventory
              </h1>
              <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                {products.length} SKUs Tracked
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Real-time stock ledger with decimal fractional weights and barcode tracking
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isShopkeeper && onNavigateToPurchases && (
              <button
                onClick={() => onNavigateToPurchases()}
                className="btn btn-secondary"
                style={{ height: '40px', fontSize: '12.5px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--info)' }}>
                  local_shipping
                </span>
                <span>Wholesale Stock-In</span>
              </button>
            )}

            <button
              onClick={handleOpenAdd}
              className="btn btn-primary"
              style={{ height: '40px', padding: '0 16px', fontSize: '13px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
              <span>+ Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stock Valuation Strip (Hidden for Staff) */}
      {isShopkeeper && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
                account_balance_wallet
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Live Stock Valuation & Gross Margin Audit
              </span>
            </div>
            <span className="badge badge-teal" style={{ fontSize: '11px', fontWeight: 700 }}>
              Audit Mode
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Purchase Cost</span>
              <span className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)' }}>
                Rs. {totalPurchaseValue.toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                Inventory at cost
              </span>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F0FDFA', borderRadius: '8px', border: '1px solid #99F6E4' }}>
              <span style={{ fontSize: '11px', color: 'var(--primary)', display: 'block' }}>Realizable Retail Value</span>
              <span className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                Rs. {totalRetailValue.toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--primary)', display: 'block', marginTop: '2px' }}>
                Expected consumer revenue
              </span>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#DCFCE7', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: '11px', color: '#166534', display: 'block' }}>Net Expected Margin</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: '#16A34A' }}>
                  Rs. {expectedProfit.toLocaleString()}
                </span>
                <span className="badge badge-green" style={{ fontSize: '11px' }}>
                  +{expectedRoi}% ROI
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} className="material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: statusFilter === 'all' ? '#0F172A' : '#F1F5F9',
              color: statusFilter === 'all' ? '#FFFFFF' : 'var(--text-body)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Items ({products.length})
          </button>

          <button
            onClick={() => setStatusFilter('low')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: statusFilter === 'low' ? '#DC2626' : 'var(--danger-bg)',
              color: statusFilter === 'low' ? '#FFFFFF' : 'var(--danger-text)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span className="pulse-dot pulse-dot-red"></span>
            <span>Low Stock Alert ({products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length})</span>
          </button>

          <button
            onClick={() => setStatusFilter('out')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: statusFilter === 'out' ? '#991B1B' : '#FEE2E2',
              color: statusFilter === 'out' ? '#FFFFFF' : '#991B1B',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Out of Stock ({products.filter((p) => p.currentStock <= 0).length})
          </button>

          <button
            onClick={() => setStatusFilter('instock')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: statusFilter === 'instock' ? '#16A34A' : '#DCFCE7',
              color: statusFilter === 'instock' ? '#FFFFFF' : '#166534',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Healthy Stock ({products.filter((p) => p.currentStock > p.minStock).length})
          </button>
        </div>
      </div>

      {/* Desktop Responsive Table View */}
      <div className="card desktop-only" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
        <table className="responsive-table-view" style={{ borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>Product & Barcode</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>Current Stock</th>
              {isShopkeeper && (
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>Purchase Cost</th>
              )}
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>Sale Price</th>
              {isShopkeeper && (
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>Margin %</th>
              )}
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-heading)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const margin = p.salePrice > 0 && p.purchasePrice > 0 ? (((p.salePrice - p.purchasePrice) / p.salePrice) * 100).toFixed(1) : 0;
              const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;
              const isOut = p.currentStock <= 0;

              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: isOut ? '#FFF5F5' : isLow ? '#FFFBEB' : '#FFFFFF'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {p.brand ? `${p.brand} • ` : ''}Barcode: <span className="tabular-nums">{p.barcode}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', color: 'var(--text-body)' }}>
                    {p.category}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span
                      className="tabular-nums"
                      style={{
                        fontWeight: 700,
                        fontSize: '13.5px',
                        color: isOut ? 'var(--danger)' : isLow ? '#B45309' : 'var(--text-heading)'
                      }}
                    >
                      {p.currentStock} {p.baseUnit}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block' }}>
                      Min: {p.minStock} {p.baseUnit}
                    </span>
                  </td>

                  {isShopkeeper && (
                    <td style={{ padding: '12px 16px' }}>
                      <span className="tabular-nums" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        Rs. {p.purchasePrice}
                      </span>
                    </td>
                  )}

                  <td style={{ padding: '12px 16px' }}>
                    <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                      Rs. {p.salePrice}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> /{p.baseUnit}</span>
                  </td>

                  {isShopkeeper && (
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-green" style={{ fontSize: '11px' }}>
                        +{margin}%
                      </span>
                    </td>
                  )}

                  <td style={{ padding: '12px 16px' }}>
                    {isOut ? (
                      <span className="badge badge-red">Out of Stock</span>
                    ) : isLow ? (
                      <span className="badge badge-amber">Low Stock</span>
                    ) : (
                      <span className="badge badge-green">In Stock</span>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn-icon btn-secondary"
                        style={{ width: '32px', height: '32px' }}
                        title="Edit Product"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                      </button>
                      {isShopkeeper && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${p.name} from inventory?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="btn-icon btn-secondary"
                          style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
                          title="Delete Product"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Card Stack View */}
      <div className="responsive-card-view mobile-only" style={{ marginBottom: '1.5rem' }}>
        {filteredProducts.map((p) => {
          const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;
          const isOut = p.currentStock <= 0;

          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderLeft: isOut ? '4px solid var(--danger)' : isLow ? '4px solid var(--warning)' : '4px solid var(--success)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-heading)' }}>
                      {p.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {p.category}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                    Rs. {p.salePrice}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                    /{p.baseUnit}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '11.5px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Stock: </span>
                  <strong className="tabular-nums" style={{ color: isOut ? 'var(--danger)' : isLow ? '#B45309' : '#166534' }}>
                    {p.currentStock} {p.baseUnit}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}> (Min: {p.minStock})</span>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px', height: '28px' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--primary)' }}>
                  {editingProduct ? 'edit' : 'add_box'}
                </span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Inventory SKU'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Basmati Rice Super Kernel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Category & Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Base Unit *
                  </label>
                  <select
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.symbol}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purchase Cost & Sale Price & Margin Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: isShopkeeper ? '1fr 1fr 1fr' : '1fr', gap: '12px', alignItems: 'end' }}>
                {isShopkeeper && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Purchase Cost (Rs.)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Sale Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    required
                  />
                </div>

                {isShopkeeper && (
                  <div style={{ paddingBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Profit Margin
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '12px', padding: '4px 8px' }}>
                      {liveMargin}% Gross
                    </span>
                  </div>
                )}
              </div>

              {/* Barcode with camera trigger */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Barcode / SKU
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Scan or enter barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={simulateScan}
                    disabled={isScanning}
                    className="btn btn-secondary"
                    style={{ flexShrink: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                      qr_code_scanner
                    </span>
                    <span>{isScanning ? 'Scanning...' : 'Scan USB/Cam'}</span>
                  </button>
                </div>
              </div>

              {/* Current Stock (Decimal) & Min Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Current Stock (Decimal e.g. 48.5) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Minimum Stock Alert Level
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '44px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                  <span>{editingProduct ? 'Update Product' : 'Save & Register SKU'}</span>
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ height: '44px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
