import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function AddExpenseModal({ isOpen, onClose }) {
  const { addExpense } = useShopData();

  const [category, setCategory] = useState('Commercial Electricity');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const quickCategories = [
    { label: 'Shop Rent', icon: 'storefront' },
    { label: 'Commercial Electricity', icon: 'bolt' },
    { label: 'Staff Salaries', icon: 'payments' },
    { label: 'Maintenance', icon: 'build' },
    { label: 'Tea & Refreshment', icon: 'coffee' },
    { label: 'Other', icon: 'more_horiz' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) {
      alert('Please enter valid expense title and amount');
      return;
    }

    addExpense({
      category,
      title,
      amount: Number(amount),
      date,
      paymentMode,
      note
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--danger)' }}>
              receipt_long
            </span>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-heading)' }}>
              Record Shop Expense
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Category Chips */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Select Expense Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickCategories.map((c) => (
                <button
                  type="button"
                  key={c.label}
                  onClick={() => setCategory(c.label)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: category === c.label ? 'var(--primary)' : 'var(--border-subtle)',
                    backgroundColor: category === c.label ? 'var(--primary-light)' : '#FFFFFF',
                    color: category === c.label ? 'var(--primary)' : 'var(--text-body)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Expense Description */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Expense Title / Purpose *
            </label>
            <input
              type="text"
              placeholder="e.g. October Electricity WAPDA Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Amount & Date split */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Amount (Rs.) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '12px' }}>
                  Rs.
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ paddingLeft: '34px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Expense Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Paid Via
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {['Cash', 'EasyPaisa', 'JazzCash', 'Bank'].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: paymentMode === mode ? 'var(--primary)' : 'var(--border-subtle)',
                    backgroundColor: paymentMode === mode ? 'var(--primary-light)' : '#FFFFFF',
                    color: paymentMode === mode ? 'var(--primary)' : 'var(--text-heading)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Notes / Receipt Slip Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid to technician Naveed / Trx ID #83921"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '42px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
              <span>Save Expense</span>
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ height: '42px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
