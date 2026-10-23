import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShopData } from '../context/ShopDataContext';

export function Dashboard({ onNavigate, onOpenExpenseModal, onNavigateToKhata, onNavigateToPurchases }) {
  const { currentUser, isShopkeeper } = useAuth();
  const { sales, expenses, suppliers, customers, products } = useShopData();

  const [chartTimeframe, setChartTimeframe] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  // Calculations for Row 1 KPI Cards
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesList = sales.filter((s) => s.date === todayStr);

  const todayTotalSales = todaySalesList.reduce((sum, s) => sum + s.total, 0);
  const todayCashSales = todaySalesList.reduce(
    (sum, s) => sum + (s.paymentType === 'cash' ? s.total : s.paymentType === 'split' ? (s.cashTendered || 0) : 0),
    0
  );
  const todayUdhaarSales = todaySalesList.reduce(
    (sum, s) => sum + (s.paymentType === 'udhaar' ? s.total : s.paymentType === 'split' ? (s.udhaarAmount || 0) : 0),
    0
  );

  const todayGrossProfit = todaySalesList.reduce((sum, s) => sum + (s.profit || 0), 0);
  const todayExpenses = expenses.filter((e) => e.date === todayStr).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const todayNetProfit = todayGrossProfit - todayExpenses;
  const profitMarginPercent = todayTotalSales > 0 ? ((todayNetProfit / todayTotalSales) * 100).toFixed(1) : '0.0';

  const totalMarketUdhaar = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
  const overdueCustomers = customers.filter((c) => c.status === 'overdue' && c.currentBalance > 0);
  const overdueCount = overdueCustomers.length;

  const totalPurchasesBalance = suppliers.reduce((sum, s) => sum + (s.balanceOwed || 0), 0);

  // Category breakdown for Row 2 Right Chart - dynamically computed from actual sales
  const categorySalesMap = {};
  sales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const prod = products.find((p) => p.id === item.id || p.name === item.name);
      const cat = prod?.category || 'Grocery & Staples';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.total || 0);
    });
  });

  const totalCatSales = Object.values(categorySalesMap).reduce((a, b) => a + b, 0);

  // Interactive Chart Data for Row 2 Left Chart - dynamically computed from sales & expenses
  const getSaleHour = (s) => {
    if (!s.time) return 12;
    const timeStr = s.time.toLowerCase();
    const isPM = timeStr.includes('pm');
    const isAM = timeStr.includes('am');
    const match = timeStr.match(/(\d+):(\d+)/);
    if (!match) return 12;
    let h = parseInt(match[1], 10);
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h;
  };

  const dailySlots = [
    { label: '8 AM', startHour: 0, endHour: 9 },
    { label: '10 AM', startHour: 9, endHour: 11 },
    { label: '12 PM', startHour: 11, endHour: 13 },
    { label: '2 PM', startHour: 13, endHour: 15 },
    { label: '4 PM', startHour: 15, endHour: 17 },
    { label: '6 PM', startHour: 17, endHour: 19 },
    { label: '8 PM', startHour: 19, endHour: 24 }
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyBars = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];

    const daySales = sales.filter((s) => s.date === dateStr);
    const dayExpenses = expenses.filter((e) => e.date === dateStr);

    weeklyBars.push({
      label: dayLabel,
      sales: daySales.reduce((sum, s) => sum + s.total, 0),
      profit: daySales.reduce((sum, s) => sum + (s.profit || 0), 0),
      expenses: dayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    });
  }

  const monthlyBars = [
    { label: 'Week 1', daysBackStart: 28, daysBackEnd: 21 },
    { label: 'Week 2', daysBackStart: 21, daysBackEnd: 14 },
    { label: 'Week 3', daysBackStart: 14, daysBackEnd: 7 },
    { label: 'Week 4', daysBackStart: 7, daysBackEnd: 0 }
  ].map(({ label, daysBackStart, daysBackEnd }) => {
    const nowMs = new Date().getTime();
    const startMs = nowMs - daysBackStart * 24 * 60 * 60 * 1000;
    const endMs = nowMs - daysBackEnd * 24 * 60 * 60 * 1000;

    const weekSales = sales.filter((s) => {
      const t = new Date(s.date).getTime();
      return t >= startMs && t <= endMs;
    });
    const weekExpenses = expenses.filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= startMs && t <= endMs;
    });

    return {
      label,
      sales: weekSales.reduce((sum, s) => sum + s.total, 0),
      profit: weekSales.reduce((sum, s) => sum + (s.profit || 0), 0),
      expenses: weekExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    };
  });

  const chartData = {
    daily: dailySlots.map((slot) => {
      const slotSales = todaySalesList.filter((s) => {
        const h = getSaleHour(s);
        return h >= slot.startHour && h < slot.endHour;
      });
      return {
        label: slot.label,
        sales: slotSales.reduce((sum, s) => sum + s.total, 0),
        profit: slotSales.reduce((sum, s) => sum + (s.profit || 0), 0),
        expenses: todayExpenses > 0 ? Math.round(todayExpenses / dailySlots.length) : 0
      };
    }),
    weekly: weeklyBars,
    monthly: monthlyBars
  };

  const currentChartBars = chartData[chartTimeframe] || [];
  const maxSaleValue = Math.max(
    ...currentChartBars.map((b) => Math.max(b.sales, b.profit, b.expenses)),
    100
  );

  // Low stock products for Row 3
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock);

  return (
    <div className="workspace-container">
      {/* Top Action Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundImage: 'linear-gradient(to right, #FFFFFF, #F8FAFC)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                {currentUser?.storeName || 'Al-Madina Super Store'}
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#DBEAFE',
                  color: '#1E40AF',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}
              >
                {currentUser.roleTitle}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
              <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>•</span>
              <span className="pulse-dot pulse-dot-green"></span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active Terminal Sync</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onNavigate('pos')}
              className="btn btn-primary"
              style={{
                height: '42px',
                padding: '0 16px',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
              <span>+ Quick POS Sale</span>
            </button>

            {isShopkeeper && (
              <button
                onClick={onOpenExpenseModal}
                className="btn btn-secondary"
                style={{ height: '42px', padding: '0 14px', fontSize: '13px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--danger)' }}>
                  receipt_long
                </span>
                <span>+ Add Expense</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards (4 cols desktop, 2x2 grid mobile) */}
      <div className="grid-12" style={{ marginBottom: '1.25rem' }}>
        {/* KPI 1: Today's Total Sales */}
        <div className="card col-3 mobile-kpi-col" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Today's Total Sales</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#CCFBF1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
              </div>
            </div>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>
              Rs. {todayTotalSales.toLocaleString()}
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cash Sales:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--success)' }}>
                Rs. {todayCashSales.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--warning-bg)' }}>
              <span style={{ color: 'var(--warning-text)' }}>Udhaar Credit:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--warning-text)' }}>
                Rs. {todayUdhaarSales.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Today's Net Profit */}
        <div className="card col-3 mobile-kpi-col" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Today's Net Profit</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
              </div>
            </div>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.5px' }}>
              Rs. {todayNetProfit.toLocaleString()}
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <span
              className="badge badge-green"
              style={{ fontSize: '11.5px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>
              <span>+{profitMarginPercent}% Margin</span>
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              After Rs. {todayExpenses.toLocaleString()} expenses
            </span>
          </div>
        </div>

        {/* KPI 3: Total Market Udhaar Receivable */}
        <div className="card col-3 mobile-kpi-col" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Market Udhaar (Khata)</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>menu_book</span>
              </div>
            </div>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: '#D97706', letterSpacing: '-0.5px' }}>
              Rs. {totalMarketUdhaar.toLocaleString()}
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <span
              className="badge badge-amber"
              style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>warning</span>
              <span>{overdueCount} Overdue Accounts</span>
            </span>
            <button
              onClick={() => (onNavigateToKhata ? onNavigateToKhata() : onNavigate('khata'))}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'block',
                marginTop: '4px',
                padding: 0
              }}
            >
              View Khata Ledger →
            </button>
          </div>
        </div>

        {/* KPI 4: Today's Purchases / Payables */}
        <div className="card col-3 mobile-kpi-col" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Supplier Payables</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>local_shipping</span>
              </div>
            </div>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB', letterSpacing: '-0.5px' }}>
              Rs. {totalPurchasesBalance.toLocaleString()}
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <span
              className="badge badge-blue"
              style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>inventory</span>
              <span>{suppliers.length} Verified Wholesalers</span>
            </span>
            <button
              onClick={() => onNavigate('suppliers')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'block',
                marginTop: '4px',
                padding: 0
              }}
            >
              Manage Suppliers →
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (8-col / 4-col split) */}
      <div className="grid-12" style={{ marginBottom: '1.25rem' }}>
        {/* Left Chart (8-col): Interactive Bar Chart with Daily | Weekly | Monthly */}
        <div className="card col-8" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Sales vs Net Profit vs Expenses
              </h3>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Real-time performance comparison
              </span>
            </div>

            {/* Timeframe Tabs */}
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '3px', gap: '2px' }}>
              {['daily', 'weekly', 'monthly'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: chartTimeframe === tf ? '#FFFFFF' : 'transparent',
                    color: chartTimeframe === tf ? 'var(--text-heading)' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: chartTimeframe === tf ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingTop: '20px', paddingBottom: '10px' }}>
            {currentChartBars.map((bar, i) => {
              const salesHeight = bar.sales > 0 ? Math.max(8, (bar.sales / maxSaleValue) * 180) : 0;
              const profitHeight = bar.profit > 0 ? Math.max(6, (bar.profit / maxSaleValue) * 180) : 0;
              const expHeight = bar.expenses > 0 ? Math.max(4, (bar.expenses / maxSaleValue) * 180) : 0;

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                  {/* Bars Group */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center' }}>
                    {/* Sales Bar */}
                    <div
                      style={{
                        width: '35%',
                        height: `${salesHeight}px`,
                        backgroundColor: '#0F766E',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                      title={`Sales: Rs. ${bar.sales.toLocaleString()}`}
                    />
                    {/* Profit Bar */}
                    <div
                      style={{
                        width: '35%',
                        height: `${profitHeight}px`,
                        backgroundColor: '#16A34A',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                      title={`Profit: Rs. ${bar.profit.toLocaleString()}`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{
                        width: '25%',
                        height: `${expHeight}px`,
                        backgroundColor: '#DC2626',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                      title={`Expense: Rs. ${bar.expenses.toLocaleString()}`}
                    />
                  </div>

                  {/* Label */}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legends */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#0F766E' }} />
              <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Gross Sales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#16A34A' }} />
              <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Net Profit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#DC2626' }} />
              <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Operating Expenses</span>
            </div>
          </div>
        </div>

        {/* Right Card (4-col): Category-Wise Sales Progress Chart */}
        <div className="card col-4" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Category Sales Split
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                100% Tracked
              </span>
            </div>
            <p style={{ margin: '0 0 1rem 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Top revenue generating categories
            </p>

            {totalCatSales === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  donut_large
                </span>
                No sales recorded yet. Checkout POS sales to see live category split.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(categorySalesMap).map(([catName, amount]) => {
                  const pct = totalCatSales > 0 ? Math.round((amount / totalCatSales) * 100) : 0;
                  return (
                    <div key={catName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{catName}</span>
                        <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                          Rs. {amount.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor:
                              catName.includes('Grocery') ? '#0F766E' :
                              catName.includes('Dairy') ? '#2563EB' :
                              catName.includes('Beverages') ? '#7C3AED' :
                              catName.includes('Pulses') ? '#D97706' : '#EA580C',
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('categories')}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '1rem', fontSize: '12px', padding: '6px 12px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>category</span>
            <span>Manage Categories</span>
          </button>
        </div>
      </div>

      {/* Row 3: Action Alerts (6-col / 6-col split) */}
      <div className="grid-12">
        {/* Left Panel (6-col): Low-Stock Products with + Stock In button */}
        <div className="card col-6" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--danger)' }}>
                warning
              </span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Low-Stock Products Alert
              </h3>
            </div>
            <span className="badge badge-red" style={{ fontSize: '11px' }}>
              {lowStockProducts.length} Items Below Min
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {lowStockProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#FFF5F5',
                  border: '1px solid #FECACA',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-heading)' }}>{p.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Current Stock: <strong style={{ color: p.currentStock === 0 ? 'var(--danger)' : '#B45309' }}>{p.currentStock} {p.baseUnit}</strong> (Min: {p.minStock})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => (onNavigateToPurchases ? onNavigateToPurchases(p.id) : onNavigate('purchases'))}
                  className="btn btn-primary"
                  style={{ height: '32px', padding: '0 10px', fontSize: '11.5px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>local_shipping</span>
                  <span>+ Stock In</span>
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
            <button
              onClick={() => onNavigate('inventory')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View Full Live Inventory ({products.length} SKUs) →
            </button>
          </div>
        </div>

        {/* Right Panel (6-col): Overdue Customer Udhaar with Receive Cash button */}
        <div className="card col-6" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--warning)' }}>
                menu_book
              </span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Overdue Customer Udhaar
              </h3>
            </div>
            <span className="badge badge-amber" style={{ fontSize: '11px' }}>
              Past Salary Date
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {overdueCustomers.map((cust) => (
              <div
                key={cust.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={cust.avatar}
                    alt={cust.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-heading)' }}>{cust.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Salary Day: {cust.salaryDay}th • Due: {cust.dueDate}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--danger)' }}>
                    Rs. {cust.currentBalance.toLocaleString()}
                  </span>
                  <button
                    onClick={() => (onNavigateToKhata ? onNavigateToKhata(cust.id) : onNavigate('khata'))}
                    className="btn btn-warning"
                    style={{ height: '32px', padding: '0 10px', fontSize: '11.5px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>payments</span>
                    <span>Receive</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
            <button
              onClick={() => (onNavigateToKhata ? onNavigateToKhata() : onNavigate('khata'))}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Open Full Digital Khata Ledger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
