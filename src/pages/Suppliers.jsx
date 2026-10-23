import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function Suppliers() {
  const { suppliers, supplierLedger = [], paySupplier, showToast } = useShopData();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('Bank Transfer');
  const [payNote, setPayNote] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
  const supplierHistory = supplierLedger.filter((entry) => entry.supplierId === selectedSupplier?.id);

  const totalOwed = suppliers.reduce((sum, s) => sum + (s.balanceOwed || 0), 0);
  const totalPurchases = suppliers.reduce((sum, s) => sum + (s.totalPurchases || 0), 0);
  const totalPaid = suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0);

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      alert('Please enter valid payment amount');
      return;
    }

    paySupplier(selectedSupplier.id, Number(payAmount), payMode, payNote);
    setPayAmount('');
    setPayNote('');
    setPayModalOpen(false);
  };

  return (
    <div className="workspace-container">
      {/* Top Banner */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--info)' }}>
                badge
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Wholesale Suppliers Ledger
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Track distributor payables, invoice histories, and payment vouchers
            </p>
          </div>

          <span className="badge badge-blue" style={{ fontSize: '12px', padding: '4px 10px' }}>
            {suppliers.length} Authorized Wholesalers
          </span>
        </div>

        {/* Financial KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '1rem' }}>
          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Wholesale Purchases</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', marginTop: '2px' }}>
              Rs. {totalPurchases.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#DCFCE7', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Total Payments Cleared</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>
              Rs. {totalPaid.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>Total Balance Payable</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>
              Rs. {totalOwed.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Supplier Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {suppliers.map((s) => {
          const isSelected = selectedSupplier?.id === s.id;
          const hasBalance = s.balanceOwed > 0;

          return (
            <div
              key={s.id}
              className="card card-hover"
              onClick={() => setSelectedSupplierId(s.id)}
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--info)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>domain</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {s.name}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {s.company}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <div>📞 {s.phone}</div>
                  <div>📍 {s.address}</div>
                </div>
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Purchases:</span>
                  <span className="tabular-nums" style={{ fontWeight: 600 }}>Rs. {s.totalPurchases.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Balance Owed</span>
                    <span className="tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: hasBalance ? '#D97706' : '#16A34A' }}>
                      Rs. {s.balanceOwed.toLocaleString()}
                    </span>
                  </div>

                  {hasBalance && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSupplierId(s.id);
                        setPayModalOpen(true);
                      }}
                      className="btn btn-warning"
                      style={{ padding: '4px 10px', fontSize: '11.5px', height: '30px' }}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Supplier Detailed Statement */}
      {selectedSupplier && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Ledger Statement: {selectedSupplier.name}
              </h3>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Official wholesale account ID: {selectedSupplier.id}
              </span>
            </div>

            <button
              onClick={() => setPayModalOpen(true)}
              className="btn btn-primary"
              style={{ height: '36px', fontSize: '12.5px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
              <span>Record Payment to Supplier</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Type</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Description</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Wholesale Invoice</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Amount Paid</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Balance Status</th>
                </tr>
              </thead>
              <tbody>
                {supplierHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No ledger transactions recorded yet for this wholesale supplier.
                    </td>
                  </tr>
                ) : (
                  supplierHistory.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${entry.type === 'STOCK_IN' ? 'badge-blue' : 'badge-green'}`}>
                          {entry.type === 'STOCK_IN' ? 'Stock-In Batch' : 'Payment Voucher'}
                        </span>
                        <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {entry.date} {entry.time}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        <div style={{ color: 'var(--text-heading)' }}>{entry.note || 'Wholesale Transaction'}</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Ref #{entry.invoiceNo}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {entry.totalAmount > 0 ? (
                          <span className="tabular-nums" style={{ fontWeight: 700 }}>
                            Rs. {entry.totalAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {entry.amountPaid > 0 ? (
                          <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--success)' }}>
                            Rs. {entry.amountPaid.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          className="tabular-nums"
                          style={{
                            fontWeight: 800,
                            color: entry.runningBalance > 0 ? '#D97706' : 'var(--success)'
                          }}
                        >
                          Rs. {entry.runningBalance != null ? entry.runningBalance.toLocaleString() : 0} {entry.runningBalance > 0 ? 'Owed' : 'Cleared'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {payModalOpen && selectedSupplier && (
        <div className="modal-overlay" onClick={() => setPayModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--info)' }}>
                  payments
                </span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  Pay Wholesale Supplier
                </h3>
              </div>
              <button onClick={() => setPayModalOpen(false)} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paying Wholesaler:</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {selectedSupplier.name} ({selectedSupplier.company})
                </div>
                <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
                  Current Payable Balance: Rs. {selectedSupplier.balanceOwed.toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Payment Amount (Rs.) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedSupplier.balanceOwed}
                  placeholder={`e.g. ${selectedSupplier.balanceOwed}`}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Disbursement Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {['Bank Transfer', 'Cash', 'Cheque', 'EasyPaisa'].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setPayMode(mode)}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: payMode === mode ? 'var(--primary)' : 'var(--border-subtle)',
                        backgroundColor: payMode === mode ? 'var(--primary-light)' : '#FFFFFF',
                        color: payMode === mode ? 'var(--primary)' : 'var(--text-body)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Bank Trx ID / Cheque # / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. HBL Online Trx #98241"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '42px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                  <span>Confirm Payment</span>
                </button>
                <button type="button" onClick={() => setPayModalOpen(false)} className="btn btn-secondary">
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
