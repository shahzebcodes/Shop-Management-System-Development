import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function Expenses() {
  const { expenses, addExpense } = useShopData();

  // Quick form inline
  const [category, setCategory] = useState('Commercial Electricity');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [note, setNote] = useState('');

  const [filterCategory, setFilterCategory] = useState('all');

  const categoriesList = [
    'Shop Rent',
    'Commercial Electricity',
    'Staff Salaries',
    'Maintenance',
    'Tea & Refreshment',
    'Other'
  ];

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) {
      alert('Please enter valid title and amount');
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

    setTitle('');
    setAmount('');
    setNote('');
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    return filterCategory === 'all' || e.category === filterCategory;
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Group by category for summary cards
  const categoryTotals = categoriesList.reduce((acc, cat) => {
    acc[cat] = expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0);
    return acc;
  }, {});

  return (
    <div className="workspace-container">
      {/* Top Banner */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--danger)' }}>
                receipt_long
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Shop Operating Expenses Tracker
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Log rent, commercial utilities, staff wages, and store upkeep for accurate net profit calculation
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Monthly Expenses</span>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--danger)' }}>
              Rs. {totalExpenseAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Category Breakdown Chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginTop: '1rem' }}>
          {categoriesList.map((cat) => (
            <div key={cat} style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{cat}</span>
              <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Rs. {(categoryTotals[cat] || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Entry Form Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '10px' }}>
          Quick Expense Entry
        </h3>

        <form onSubmit={handleQuickSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Category
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Expense Description *
            </label>
            <input
              type="text"
              placeholder="e.g. Generator Diesel 10 Litres"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Amount (Rs.) *
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Payment Mode
            </label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value="Cash">Cash</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ height: '38px', width: '100%' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Log Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
            Expense Transaction Journal ({filteredExpenses.length})
          </h3>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setFilterCategory('all')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filterCategory === 'all' ? '#0F172A' : '#F1F5F9',
                color: filterCategory === 'all' ? '#FFFFFF' : 'var(--text-body)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All
            </button>
            {categoriesList.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: filterCategory === c ? 'var(--primary)' : '#F1F5F9',
                  color: filterCategory === c ? '#FFFFFF' : 'var(--text-body)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {c.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Table View Desktop */}
        <div className="desktop-only" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Date</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Category</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Description / Title</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Paid Via</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                    {exp.date}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {exp.title}
                    {exp.note && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 'normal' }}>
                        Note: {exp.note}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-body)' }}>
                    {exp.paymentMode}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>
                      Rs. {exp.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card Stack */}
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredExpenses.map((exp) => (
            <div key={exp.id} style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-amber" style={{ fontSize: '10px', marginBottom: '4px' }}>{exp.category}</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>{exp.title}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.date} • {exp.paymentMode}</span>
                </div>
                <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--danger)' }}>
                  Rs. {exp.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
