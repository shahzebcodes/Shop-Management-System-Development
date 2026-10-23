import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function Units() {
  const { units, addUnit } = useShopData();

  // New unit form state
  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newType, setNewType] = useState('count');
  const [newFactor, setNewFactor] = useState(1);
  const [newBadge, setNewBadge] = useState('');
  const [isDecimal, setIsDecimal] = useState(false);

  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newName || !newSymbol) return;

    addUnit({
      name: newName,
      symbol: newSymbol,
      baseType: newType,
      conversionFactor: Number(newFactor),
      badgeLabel: newBadge || `1 ${newSymbol} standard unit`,
      isDecimal
    });

    setNewName('');
    setNewSymbol('');
    setNewBadge('');
  };

  return (
    <div className="workspace-container">
      {/* Header */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Units & Metric Conversion Engine
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Retail unit configurations (kg/gram, litre/ml, dozen/pcs) with decimal precision support
            </p>
          </div>
          <span className="badge badge-teal" style={{ fontSize: '12px', padding: '4px 10px' }}>
            High-Precision Decimal Engine
          </span>
        </div>
      </div>

      {/* Visual Units & Conversion Rules Table */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1rem' }}>
          Configured Retail Units & Conversion Factors ({units.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Unit Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Symbol</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Type</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Conversion Badge</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>Precision</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>POS Status</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {unit.name}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="kbd-chip" style={{ fontSize: '12px' }}>{unit.symbol}</span>
                  </td>
                  <td style={{ padding: '12px 14px', textTransform: 'capitalize', color: 'var(--text-body)' }}>
                    {unit.baseType}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      className="badge badge-teal"
                      style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                    >
                      {unit.badgeLabel}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: unit.isDecimal ? '#DCFCE7' : '#F1F5F9',
                        color: unit.isDecimal ? '#166534' : 'var(--text-muted)',
                        fontWeight: 600
                      }}
                    >
                      {unit.isDecimal ? 'Decimal (0.000)' : 'Discrete Integer'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-green">Ready</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Unit Form */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '10px' }}>
          Define New Custom Unit
        </h3>

        <form onSubmit={handleAddUnit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Unit Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Borri, Crate, Bundle"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Symbol *
            </label>
            <input
              type="text"
              placeholder="e.g. bag, crate"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Unit Type
            </label>
            <select value={newType} onChange={(e) => setNewType(e.target.value)}>
              <option value="weight">Weight (Mass)</option>
              <option value="volume">Volume (Liquid)</option>
              <option value="count">Count (Units / Pcs)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Badge Description
            </label>
            <input
              type="text"
              placeholder="e.g. 1 bag = 50 kg"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
            <input
              type="checkbox"
              id="decimalCheck"
              checked={isDecimal}
              onChange={(e) => setIsDecimal(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="decimalCheck" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-heading)', cursor: 'pointer' }}>
              Supports Decimal Weights
            </label>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ height: '38px', width: '100%' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              <span>Register Unit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
