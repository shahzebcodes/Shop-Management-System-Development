import React from 'react';
import { useAuth } from '../context/AuthContext';

export function ThermalReceiptModal({ receipt, onClose }) {
  const { currentUser } = useAuth();
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay print-active-modal" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px'
        }}
      >
        {/* Modal Action Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '12px 16px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2DD4BF' }}>
              receipt_long
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 700 }}>80mm Thermal Receipt</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px', height: '32px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
              <span>Print [Ctrl+P]</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>

        {/* Paper Thermal Receipt Container */}
        <div
          className="thermal-receipt-container"
          style={{
            padding: '24px 20px',
            backgroundColor: '#FAFAF9',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: '#000000',
            lineHeight: 1.4
          }}
        >
          {/* Header */}
          <div className="thermal-receipt-header" style={{ textAlign: 'center', borderBottom: '1px dashed #A8A29E', paddingBottom: '10px', marginBottom: '12px' }}>
            <h2 className="thermal-receipt-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              {(currentUser?.storeName || 'Al-Madina Super Store').toUpperCase()}
            </h2>
            <p className="thermal-receipt-subtitle" style={{ margin: '3px 0', fontSize: '10.5px' }}>
              Main Commercial Market, G-9 Markaz, Islamabad
            </p>
            <p className="thermal-receipt-subtitle" style={{ margin: 0, fontSize: '10.5px' }}>
              Tel: 051-2284910 | WhatsApp: 0300-8451299
            </p>
            <div style={{ fontSize: '10px', marginTop: '6px', fontWeight: 600 }}>
              <span>NTN: 8492019-3 • STRN: 32778761234</span>
            </div>
          </div>

          {/* Meta Information */}
          <div className="thermal-receipt-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '10px' }}>
            <div>
              <div><strong>Invoice:</strong> {receipt.invoiceNo}</div>
              <div><strong>Cashier:</strong> {receipt.cashier || 'Admin'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div><strong>Date:</strong> {receipt.date}</div>
              <div><strong>Time:</strong> {receipt.time}</div>
            </div>
          </div>

          {/* Customer line */}
          <div style={{ padding: '4px 0', borderTop: '1px dotted #D6D3D1', borderBottom: '1px dotted #D6D3D1', marginBottom: '10px', fontSize: '11px' }}>
            <strong>Customer:</strong> {receipt.customerName || 'Walk-in Cash Customer'}
            {receipt.paymentType !== 'cash' && (
              <span style={{ display: 'block', fontSize: '10px', color: '#44403C' }}>
                Account Mode: <strong>UDHAAR KHATA</strong> {receipt.dueDate ? `(Due: ${receipt.dueDate})` : ''}
              </span>
            )}
          </div>

          {/* Itemized Table */}
          <table className="thermal-receipt-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000000', borderTop: '1px solid #000000' }}>
                <th style={{ textAlign: 'left', padding: '4px 0', fontWeight: 700 }}>ITEM</th>
                <th style={{ textAlign: 'center', padding: '4px 0', fontWeight: 700 }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 700 }}>RATE</th>
                <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 700 }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items && receipt.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dotted #E7E5E4' }}>
                  <td style={{ padding: '4px 0', fontWeight: 600, wordBreak: 'break-word', maxWidth: '140px' }}>
                    {item.name}
                  </td>
                  <td style={{ textAlign: 'center', padding: '4px 0', whiteSpace: 'nowrap' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td style={{ textAlign: 'right', padding: '4px 0', whiteSpace: 'nowrap' }}>
                    {item.price}
                  </td>
                  <td style={{ textAlign: 'right', padding: '4px 0', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Rs. {item.total?.toFixed ? item.total.toFixed(2) : item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="thermal-receipt-totals" style={{ borderTop: '1px dashed #000000', borderBottom: '1px dashed #000000', padding: '6px 0', margin: '8px 0' }}>
            <div className="thermal-receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0' }}>
              <span>Items Subtotal:</span>
              <span>Rs. {receipt.subtotal?.toLocaleString()}</span>
            </div>

            {receipt.discount > 0 && (
              <div className="thermal-receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0' }}>
                <span>Shop Discount:</span>
                <span>- Rs. {receipt.discount?.toLocaleString()}</span>
              </div>
            )}

            <div className="thermal-receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#57534E', margin: '2px 0' }}>
              <span>GST (General Sales Tax 0%):</span>
              <span>Rs. 0.00</span>
            </div>

            <div
              className="thermal-receipt-row grand-total"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '15px',
                fontWeight: 800,
                borderTop: '1px solid #000000',
                paddingTop: '5px',
                marginTop: '4px'
              }}
            >
              <span>NET PAYABLE:</span>
              <span>Rs. {receipt.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Settlement Details */}
          <div style={{ fontSize: '11px', padding: '4px 0', marginBottom: '8px' }}>
            {receipt.paymentType === 'cash' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tendered Cash:</span>
                  <span style={{ fontWeight: 700 }}>Rs. {receipt.cashTendered?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>Change Returned:</span>
                  <span style={{ fontWeight: 700 }}>Rs. {receipt.changeReturn?.toLocaleString()}</span>
                </div>
              </>
            )}

            {receipt.paymentType === 'udhaar' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Added to Khata (Udhaar):</span>
                <span>Rs. {receipt.total?.toLocaleString()}</span>
              </div>
            )}

            {receipt.paymentType === 'split' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cash Paid Now:</span>
                  <span style={{ fontWeight: 700 }}>Rs. {receipt.cashTendered?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', fontWeight: 700 }}>
                  <span>Udhaar Balance Debited:</span>
                  <span>Rs. {receipt.udhaarAmount?.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Barcode & Footer Notice */}
          <div className="thermal-receipt-footer" style={{ textAlign: 'center', marginTop: '12px' }}>
            <div className="thermal-barcode-mock" style={{ letterSpacing: '4px', fontWeight: 700, fontSize: '13px' }}>
              *||||| | ||||| || |||||||| ||||*
            </div>
            <div style={{ fontSize: '9px', color: '#57534E', marginTop: '2px' }}>
              {receipt.invoiceNo}
            </div>

            <p style={{ margin: '8px 0 2px 0', fontSize: '9.5px', fontWeight: 600 }}>
              THANK YOU FOR SHOPPING WITH US!
            </p>
            <p style={{ margin: 0, fontSize: '8.5px', color: '#78716C' }}>
              Goods once sold can only be exchanged within 3 days with this original receipt.
            </p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          className="no-print"
          style={{
            padding: '12px 16px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '8px'
          }}
        >
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
            <span>Print Receipt</span>
          </button>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
