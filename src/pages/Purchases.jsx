import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function Purchases({ defaultProductId }) {
  const { suppliers, products, stockInPurchase } = useShopData();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceNote, setInvoiceNote] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  // Multi-item purchase lines
  const [items, setItems] = useState(() => {
    const defaultProduct = defaultProductId
      ? products.find((p) => p.id === defaultProductId)
      : products[0];

    return [
      {
        productId: defaultProduct ? defaultProduct.id : products[0]?.id,
        qty: 10,
        purchasePrice: defaultProduct ? defaultProduct.purchasePrice : 200
      }
    ];
  });

  // Add line item
  const handleAddLine = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id,
        qty: 10,
        purchasePrice: products[0]?.purchasePrice || 100
      }
    ]);
  };

  // Remove line item
  const handleRemoveLine = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update line item
  const handleUpdateLine = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        updated[index] = {
          ...updated[index],
          productId: value,
          purchasePrice: prod ? prod.purchasePrice : updated[index].purchasePrice
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return updated;
    });
  };

  // Math calculations
  const totalCost = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.purchasePrice || 0), 0);
  const paidNow = Number(amountPaid) || 0;
  const balanceOwed = Math.max(0, totalCost - paidNow);

  // Submit invoice
  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0 || totalCost <= 0) {
      alert('Please add valid purchase items');
      return;
    }

    stockInPurchase({
      supplierId: selectedSupplierId,
      date: purchaseDate,
      items,
      amountPaid: paidNow,
      invoiceNote
    });

    // Reset lines
    setItems([
      {
        productId: products[0]?.id,
        qty: 10,
        purchasePrice: products[0]?.purchasePrice || 200
      }
    ]);
    setAmountPaid('');
    setInvoiceNote('');
  };

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  return (
    <div className="workspace-container">
      {/* Header */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--info)' }}>
                local_shipping
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Wholesale Purchases & Stock-In
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Restock inventory from authorized suppliers, record invoices, and track payables
            </p>
          </div>
          <span className="badge badge-blue" style={{ fontSize: '12px', padding: '4px 10px' }}>
            Live Stock Replenishment
          </span>
        </div>
      </div>

      <div className="grid-12">
        {/* Left Form: Multi-Item Invoice Screen (8 cols) */}
        <div className="col-8">
          <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
              New Wholesale Purchase Invoice
            </h3>

            {/* Top row: Supplier & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Select Wholesaler / Supplier *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  style={{ fontWeight: 600 }}
                  required
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.company})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Invoice Date *
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)', textTransform: 'uppercase' }}>
                  Restock Products List ({items.length} Lines)
                </span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11.5px', height: '30px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>
                    add
                  </span>
                  <span>+ Add Item Line</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((line, idx) => {
                  const prod = products.find((p) => p.id === line.productId) || products[0];
                  const currentStock = prod ? prod.currentStock : 0;
                  const addedQty = Number(line.qty) || 0;
                  const newStock = Number((currentStock + addedQty).toFixed(2));
                  const lineTotal = addedQty * (Number(line.purchasePrice) || 0);

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                        gap: '10px',
                        alignItems: 'center'
                      }}
                    >
                      {/* Product Selector */}
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Product SKU</label>
                        <select
                          value={line.productId}
                          onChange={(e) => handleUpdateLine(idx, 'productId', e.target.value)}
                          style={{ fontSize: '12.5px', fontWeight: 600 }}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.currentStock} {p.baseUnit} in stock)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Quantity ({prod?.baseUnit})</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={line.qty}
                          onChange={(e) => handleUpdateLine(idx, 'qty', e.target.value)}
                          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                          required
                        />
                      </div>

                      {/* Purchase Cost */}
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Cost / {prod?.baseUnit}</label>
                        <input
                          type="number"
                          value={line.purchasePrice}
                          onChange={(e) => handleUpdateLine(idx, 'purchasePrice', e.target.value)}
                          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                          required
                        />
                      </div>

                      {/* Live Stock Preview Badge */}
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Stock Preview</label>
                        <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column' }}>
                          <span className="badge badge-teal" style={{ fontSize: '10.5px' }}>
                            New: {newStock} {prod?.baseUnit}
                          </span>
                          <span className="tabular-nums" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
                            Rs. {lineTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Supplier Delivery Slip # / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Bilty #49201 / Van Delivery by Tariq"
                value={invoiceNote}
                onChange={(e) => setInvoiceNote(e.target.value)}
              />
            </div>

            {/* Financial Totals & Split */}
            <div style={{ backgroundColor: '#F1F5F9', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Total Wholesale Cost:</span>
                <span className="tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
                  Rs. {totalCost.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Cash Amount Paid Now (Rs.)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  />
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 700, display: 'block' }}>
                    Balance Owed to Wholesaler:
                  </span>
                  <span className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--danger)' }}>
                    Rs. {balanceOwed.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: '46px', fontSize: '14px', boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
              <span>Confirm Wholesale Stock-In & Update Inventory</span>
            </button>
          </form>
        </div>

        {/* Right Info: Selected Supplier Card & Statement (4 cols) */}
        <div className="col-4">
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>badge</span>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {selectedSupplier?.name}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {selectedSupplier?.phone}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Depot / Location:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right', maxWidth: '160px' }}>
                  {selectedSupplier?.address}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Purchases:</span>
                <span className="tabular-nums" style={{ fontWeight: 700 }}>
                  Rs. {selectedSupplier?.totalPurchases?.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Paid to Date:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--success)' }}>
                  Rs. {selectedSupplier?.totalPaid?.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', backgroundColor: '#FEF3C7', borderRadius: '6px', paddingLeft: '8px', paddingRight: '8px' }}>
                <span style={{ fontWeight: 700, color: '#92400E' }}>Outstanding Balance:</span>
                <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: '#92400E' }}>
                  Rs. {selectedSupplier?.balanceOwed?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Replenishment Guide */}
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#F0FDFA', border: '1px solid #99F6E4' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
              Stock Synchronization Note
            </h4>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#115E59', lineHeight: 1.5 }}>
              Confirming this purchase automatically increases the live stock count in the POS Terminal catalog. Decimal items (like Basmati rice) immediately reflect the fractional weight added.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
