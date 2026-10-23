import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function Khata({ initialCustomerId }) {
  const { customers, customerLedger, receiveCustomerPayment, addCustomer, showToast } = useShopData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'overdue' | 'duesoon' | 'settled'
  const [selectedCustomerId, setSelectedCustomerId] = useState(() => {
    return initialCustomerId || customers[0]?.id || '';
  });

  // Modal States
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

  // Receive Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentNote, setPaymentNote] = useState('');

  // Add Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    creditLimit: '25000',
    salaryDay: '5',
    dueDate: '2026-11-05'
  });

  // Customer List filtering
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesFilter = true;
    if (filterMode === 'overdue') {
      matchesFilter = c.status === 'overdue' && c.currentBalance > 0;
    } else if (filterMode === 'duesoon') {
      matchesFilter = c.status === 'due_soon' && c.currentBalance > 0;
    } else if (filterMode === 'settled') {
      matchesFilter = c.currentBalance <= 0;
    }

    return matchesSearch && matchesFilter;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Selected customer's ledger entries
  const customerTransactions = customerLedger.filter(
    (item) => item.customerId === selectedCustomer?.id
  );

  // Total Outstanding Udhaar
  const totalMarketUdhaar = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
  const overdueCount = customers.filter((c) => c.status === 'overdue' && c.currentBalance > 0).length;

  // Handle Receive Cash Payment
  const handleReceivePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert('Please enter valid payment amount');
      return;
    }

    receiveCustomerPayment(selectedCustomer.id, Number(paymentAmount), paymentMode, paymentNote);
    setPaymentAmount('');
    setPaymentNote('');
    setReceiveModalOpen(false);
  };

  // Handle Add Customer Submit
  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Please fill required fields');
      return;
    }

    const created = addCustomer({
      ...newCustomer,
      creditLimit: Number(newCustomer.creditLimit),
      salaryDay: Number(newCustomer.salaryDay),
      currentBalance: 0
    });

    setSelectedCustomerId(created.id);
    setAddCustomerModalOpen(false);
    setNewCustomer({
      name: '',
      phone: '',
      address: '',
      creditLimit: '25000',
      salaryDay: '5',
      dueDate: '2026-11-05'
    });
  };

  // WhatsApp Reminder message
  const handleSendReminder = () => {
    if (!selectedCustomer) return;
    const msg = `Assalam-o-Alaikum ${selectedCustomer.name}, this is a gentle reminder from Al-Madina Super Store. Your current outstanding Udhaar bill is Rs. ${selectedCustomer.currentBalance.toLocaleString()} (Salary Due Date: ${selectedCustomer.dueDate || `${selectedCustomer.salaryDay}th of month`}). Thank you for your continued patronage!`;
    const encoded = encodeURIComponent(msg);
    const cleanPhone = selectedCustomer.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/92${cleanPhone.replace(/^0/, '')}?text=${encoded}`;
    window.open(waUrl, '_blank');
    showToast(`WhatsApp reminder dispatched for ${selectedCustomer.name}`);
  };

  return (
    <div className="workspace-container">
      {/* Top Financial Pulse Banner */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--warning)' }}>
                account_balance_wallet
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Digital Khata & Udhaar Ledger
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Salary-day synchronized credit records, itemized debit bills, and instant WhatsApp reminders
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setAddCustomerModalOpen(true)}
              className="btn btn-primary"
              style={{ height: '40px', fontSize: '13px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
              <span>+ Add Customer</span>
            </button>
          </div>
        </div>

        {/* Pulse Totals Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '1rem' }}>
          <div style={{ padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>Total Outstanding Market Udhaar</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>
              Rs. {totalMarketUdhaar.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#FFF5F5', borderRadius: '8px', border: '1px solid #FECACA' }}>
            <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>Overdue Salary Accounts</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--danger)', marginTop: '2px' }}>
              {overdueCount} Customers
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#F0FDFA', borderRadius: '8px', border: '1px solid #99F6E4' }}>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>Total Registered Debtors</span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
              {customers.length} Accounts
            </div>
          </div>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="khata-master-detail">
        {/* ========================================================
            LEFT COLUMN: CUSTOMER DIRECTORY (340px)
           ======================================================== */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search Box */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} className="material-symbols-outlined">
                search
              </span>
              <input
                type="text"
                placeholder="Search name, phone 03xx..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', height: '38px', fontSize: '13px' }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: filterMode === 'all' ? '#0F172A' : '#F1F5F9',
                  color: filterMode === 'all' ? '#FFFFFF' : 'var(--text-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                All ({customers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('overdue')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: filterMode === 'overdue' ? '#DC2626' : '#FEE2E2',
                  color: filterMode === 'overdue' ? '#FFFFFF' : '#991B1B',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Overdue ({overdueCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('settled')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: filterMode === 'settled' ? '#16A34A' : '#DCFCE7',
                  color: filterMode === 'settled' ? '#FFFFFF' : '#166534',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Settled
              </button>
            </div>
          </div>

          {/* Customer Scroll List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {filteredCustomers.map((c) => {
              const isSelected = selectedCustomer?.id === c.id;
              const isOverdue = c.status === 'overdue' && c.currentBalance > 0;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                    borderLeft: isSelected ? '4px solid var(--primary)' : isOverdue ? '4px solid var(--danger)' : '4px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <img
                      src={c.avatar}
                      alt={c.name}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {c.phone}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: c.currentBalance === 0 ? 'var(--success)' : isOverdue ? 'var(--danger)' : '#D97706'
                      }}
                    >
                      Rs. {c.currentBalance.toLocaleString()}
                    </span>
                    <span
                      className={`badge ${c.currentBalance === 0 ? 'badge-green' : isOverdue ? 'badge-red' : 'badge-amber'}`}
                      style={{ fontSize: '9px', display: 'block', marginTop: '2px', textAlign: 'center' }}
                    >
                      {c.currentBalance === 0 ? 'Settled' : isOverdue ? 'Overdue' : 'Due Soon'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: CHRONOLOGICAL STATEMENT LEDGER
           ======================================================== */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedCustomer ? (
            <>
              {/* Customer Profile Banner */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#FFFFFF',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={selectedCustomer.avatar}
                    alt={selectedCustomer.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
                      {selectedCustomer.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <span>Phone: {selectedCustomer.phone}</span>
                      <span>•</span>
                      <span>Salary Day: <strong>{selectedCustomer.salaryDay}th</strong> of month</span>
                      <span>•</span>
                      <span>Credit Cap: Rs. {selectedCustomer.creditLimit?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={handleSendReminder}
                    className="btn btn-secondary"
                    style={{ height: '38px', color: '#16A34A', fontSize: '12px' }}
                    title="Send WhatsApp Payment Reminder"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setReceiveModalOpen(true)}
                    className="btn btn-primary"
                    style={{ height: '38px', fontSize: '12.5px', boxShadow: '0 2px 8px rgba(15, 118, 110, 0.3)' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                    <span>Receive Cash</span>
                  </button>
                </div>
              </div>

              {/* Running Balance Banner */}
              <div
                style={{
                  padding: '12px 1.25rem',
                  backgroundColor: selectedCustomer.currentBalance > 0 ? '#FFFBEB' : '#F0FDFA',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Current Outstanding Balance
                  </span>
                  <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: selectedCustomer.currentBalance > 0 ? '#D97706' : '#0F766E' }}>
                    Rs. {selectedCustomer.currentBalance.toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Promised Settlement Date:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: selectedCustomer.status === 'overdue' ? 'var(--danger)' : 'var(--text-heading)' }}>
                    {selectedCustomer.dueDate || `${selectedCustomer.salaryDay}th of month`}
                  </div>
                </div>
              </div>

              {/* Chronological Ledger Transactions Table */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  Chronological Transaction Ledger
                </h4>

                {customerTransactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#CBD5E1' }}>
                      history_edu
                    </span>
                    <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>No past Udhaar transactions recorded for this customer.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customerTransactions.map((tx) => {
                      const isDebit = tx.type === 'DEBIT_BILL';

                      return (
                        <div
                          key={tx.id}
                          style={{
                            padding: '12px 14px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            borderLeft: isDebit ? '4px solid #D97706' : '4px solid #16A34A',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  className={`badge ${isDebit ? 'badge-amber' : 'badge-green'}`}
                                  style={{ fontSize: '10.5px' }}
                                >
                                  {isDebit ? 'Debit Bill +' : 'Payment Received -'}
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)' }}>
                                  #{tx.invoiceNo}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  {tx.date} at {tx.time}
                                </span>
                              </div>
                              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-body)' }}>
                                {tx.description}
                              </p>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div
                                className="tabular-nums"
                                style={{
                                  fontSize: '15px',
                                  fontWeight: 800,
                                  color: isDebit ? '#D97706' : '#16A34A'
                                }}
                              >
                                {isDebit ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                              </div>
                              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                Running Bal: <strong>Rs. {tx.runningBalance.toLocaleString()}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Itemized Line items preview if Debit Bill */}
                          {tx.items && tx.items.length > 0 && (
                            <div style={{ backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', marginTop: '4px' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                                Bill Items Preview:
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {tx.items.map((it, idx) => (
                                  <span key={idx} style={{ color: 'var(--text-body)' }}>
                                    • {it.name} ({it.qty}) - Rs. {it.total}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              Select a customer from the left directory
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Receive Payment Modal */}
      {receiveModalOpen && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setReceiveModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--success)' }}>
                  payments
                </span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  Receive Udhaar Cash Payment
                </h3>
              </div>
              <button onClick={() => setReceiveModalOpen(false)} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleReceivePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Customer Name:</span>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {selectedCustomer.name}
                </div>
                <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
                  Current Total Debt: Rs. {selectedCustomer.currentBalance.toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Amount Received (Rs.) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={selectedCustomer.currentBalance}
                    placeholder={`e.g. ${selectedCustomer.currentBalance}`}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    style={{ paddingLeft: '36px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px' }}
                    required
                  />
                </div>
                {/* Full Settlement Shortcut */}
                <button
                  type="button"
                  onClick={() => setPaymentAmount(selectedCustomer.currentBalance)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', padding: 0 }}
                >
                  Pay Full Balance (Rs. {selectedCustomer.currentBalance.toLocaleString()})
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Payment Method
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

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Receipt Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. October monthly salary ration clearance"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1, height: '42px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                  <span>Confirm Payment</span>
                </button>
                <button type="button" onClick={() => setReceiveModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Customer Modal */}
      {addCustomerModalOpen && (
        <div className="modal-overlay" onClick={() => setAddCustomerModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--primary)' }}>
                  person_add
                </span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  Register New Khata Customer
                </h3>
              </div>
              <button onClick={() => setAddCustomerModalOpen(false)} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chaudhry Tariq (WAPDA Office)"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Salary Payment Day (1st - 31st)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newCustomer.salaryDay}
                    onChange={(e) => setNewCustomer({ ...newCustomer, salaryDay: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Credit Limit Cap (Rs.)
                </label>
                <input
                  type="number"
                  value={newCustomer.creditLimit}
                  onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Home / Office Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Street 4, Sector G-9/2, Islamabad"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '42px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                  <span>Save Customer</span>
                </button>
                <button type="button" onClick={() => setAddCustomerModalOpen(false)} className="btn btn-secondary">
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
