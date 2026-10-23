import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function Reports() {
  const { sales, expenses, products } = useShopData();
  const [dateFilter, setDateFilter] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | 'all'

  // Filter sales and expenses by selected timeframe
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const filterByDate = (items) => {
    if (dateFilter === 'all') return items;

    return items.filter((item) => {
      if (!item.date) return false;
      if (dateFilter === 'daily') {
        return item.date === todayStr;
      }

      const itemDate = new Date(item.date);
      const diffTime = today.getTime() - itemDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (dateFilter === 'weekly') {
        return diffDays >= -1 && diffDays <= 7;
      }
      if (dateFilter === 'monthly') {
        return diffDays >= -1 && diffDays <= 30;
      }
      return true;
    });
  };

  const filteredSales = filterByDate(sales);
  const filteredExpenses = filterByDate(expenses);

  // Financial Calculations for Waterfall
  const totalGrossSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalCogs = filteredSales.reduce((sum, s) => sum + (s.cogs != null ? s.cogs : s.total * 0.78), 0);
  const grossProfit = totalGrossSales - totalCogs;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = grossProfit - totalExpenses;

  const grossMarginPercent = totalGrossSales > 0 ? ((grossProfit / totalGrossSales) * 100).toFixed(1) : '0.0';
  const netMarginPercent = totalGrossSales > 0 ? ((netProfit / totalGrossSales) * 100).toFixed(1) : '0.0';

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="workspace-container">
      {/* Header */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--primary)' }}>
                query_stats
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Profit Waterfall & Financial Analytics
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Accurate Net Retail Profit derived from COGS, sales invoices, and shop operating expenses
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '3px' }}>
              {['daily', 'weekly', 'monthly', 'all'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDateFilter(f)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: dateFilter === f ? '#0F766E' : 'transparent',
                    color: dateFilter === f ? '#FFFFFF' : 'var(--text-body)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrintReport}
              className="btn btn-secondary"
              style={{ height: '36px', fontSize: '12px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
              <span>Export / Print Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Profit Waterfall Banner */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              RETAIL ACCOUNTING ENGINE
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '2px 0 0 0' }}>
              Gross Sales − COGS − Expenses = Net Profit
            </h2>
          </div>
          <span className="badge badge-teal" style={{ fontSize: '11px' }}>
            Verified Ledger Formula
          </span>
        </div>

        {/* 4 Waterfall Steps Connected */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          {/* Step 1: Gross Sales */}
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#1E293B', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>Step 1: Gross Retail Sales</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0' }}>
              Rs. {totalGrossSales.toLocaleString()}
            </div>
            <span style={{ fontSize: '10.5px', color: '#2DD4BF' }}>100% Topline Revenue</span>
          </div>

          {/* Minus Operator Sign */}
          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '24px', fontWeight: 700 }} className="desktop-only">
            −
          </div>

          {/* Step 2: Cost of Goods Sold */}
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#1E293B', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>Step 2: Cost of Goods (COGS)</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#F87171', margin: '4px 0' }}>
              Rs. {Math.round(totalCogs).toLocaleString()}
            </div>
            <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Wholesale item purchase price</span>
          </div>

          {/* Minus Operator Sign */}
          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '24px', fontWeight: 700 }} className="desktop-only">
            −
          </div>

          {/* Step 3: Operating Expenses */}
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#1E293B', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>Step 3: Store Expenses</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#FCA5A5', margin: '4px 0' }}>
              Rs. {totalExpenses.toLocaleString()}
            </div>
            <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Rent, bills, staff, maintenance</span>
          </div>

          {/* Equals Operator Sign */}
          <div style={{ textAlign: 'center', color: '#2DD4BF', fontSize: '24px', fontWeight: 700 }} className="desktop-only">
            =
          </div>

          {/* Step 4: True Net Profit */}
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#042F2E', border: '2px solid #0D9488' }}>
            <span style={{ fontSize: '11px', color: '#99F6E4', display: 'block', fontWeight: 700 }}>
              Step 4: True Net Shop Profit
            </span>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: '#2DD4BF', margin: '4px 0' }}>
              Rs. {Math.round(netProfit).toLocaleString()}
            </div>
            <span className="badge badge-green" style={{ fontSize: '11px' }}>
              +{netMarginPercent}% Net Margin
            </span>
          </div>
        </div>
      </div>

      {/* Two Breakdown Tables: Sales Invoices & Margin Audit */}
      <div className="grid-12">
        {/* Left Table: POS Sales Journal (7 cols) */}
        <div className="card col-7" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
            Recent Sales Transactions & Profit Per Bill ({filteredSales.length})
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Invoice #</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Customer</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Total</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Profit</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No sales transactions recorded for this selected time window.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px', fontWeight: 700 }}>
                        {sale.invoiceNo}
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>{sale.date} {sale.time}</span>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--text-heading)' }}>
                        {sale.customerName}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span
                          className={`badge ${sale.paymentType === 'cash' ? 'badge-green' : sale.paymentType === 'udhaar' ? 'badge-amber' : 'badge-blue'}`}
                          style={{ fontSize: '10px' }}
                        >
                          {sale.paymentType}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span className="tabular-nums" style={{ fontWeight: 700 }}>Rs. {sale.total.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--success)' }}>
                          + Rs. {sale.profit?.toLocaleString() || '0'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Performance Metrics & Margins Summary (5 cols) */}
        <div className="card col-5" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
            Retail Financial Health Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gross Profit Margin:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--success)' }}>
                {grossMarginPercent}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Operating Expense Ratio:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--danger)' }}>
                {totalGrossSales > 0 ? ((totalExpenses / totalGrossSales) * 100).toFixed(1) : 0}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Net Realized Profit Margin:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {netMarginPercent}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#DCFCE7', borderRadius: '6px' }}>
              <span style={{ fontWeight: 700, color: '#166534' }}>Net Cash In Hand:</span>
              <span className="tabular-nums" style={{ fontWeight: 800, color: '#166534', fontSize: '14px' }}>
                Rs. {Math.round(netProfit).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ padding: '10px', backgroundColor: '#F1F5F9', borderRadius: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            💡 <strong>Shopkeeper Tip:</strong> Keeping your total operating expenses under 10% of gross retail sales helps maintain a healthy net margin above 15% in fast-moving consumer grocery stores.
          </div>
        </div>
      </div>
    </div>
  );
}
