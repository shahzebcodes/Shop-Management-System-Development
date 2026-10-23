import React, { useState } from 'react';
import { useShopData } from '../context/ShopDataContext';

export function Categories() {
  const { categories, products, addCategory } = useShopData();

  const [customName, setCustomName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0F766E');
  const [selectedIcon, setSelectedIcon] = useState('category');

  const presetColors = ['#0F766E', '#2563EB', '#D97706', '#7C3AED', '#EA580C', '#059669', '#DB2777', '#475569'];

  const quickPresets = [
    { name: 'Grocery & Staples', icon: 'shopping_basket', color: '#0F766E' },
    { name: 'Dairy & Chilled', icon: 'egg', color: '#2563EB' },
    { name: 'Cosmetics & Beauty', icon: 'face', color: '#DB2777' },
    { name: 'Bakery & Confectionery', icon: 'bakery_dining', color: '#EA580C' },
    { name: 'Beverages & Juices', icon: 'local_cafe', color: '#7C3AED' },
    { name: 'Pulses & Desi Spices', icon: 'grain', color: '#D97706' },
    { name: 'Frozen & Meat', icon: 'ac_unit', color: '#0284C7' },
    { name: 'Household Cleaners', icon: 'cleaning_services', color: '#059669' }
  ];

  const handleQuickAdd = (preset) => {
    addCategory(preset.name, preset.color, preset.icon);
  };

  const handleCustomAdd = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addCategory(customName.trim(), selectedColor, selectedIcon);
    setCustomName('');
  };

  return (
    <div className="workspace-container">
      {/* Header */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Categories Manager
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Organize your retail catalog for rapid POS item lookups and category-wise sales analytics
            </p>
          </div>
          <span className="badge badge-teal" style={{ fontSize: '12px', padding: '4px 10px' }}>
            {categories.length} Active Categories
          </span>
        </div>
      </div>

      {/* Quick-Add Common Categories Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px' }}>
          Quick-Add Common Retail Categories (One-Tap Setup)
        </h3>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Tap any preset below to instantly add standard retail categories with curated colors and icons:
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {quickPresets.map((preset) => {
            const isAlreadyAdded = categories.some(
              (c) => c.name.toLowerCase() === preset.name.toLowerCase()
            );
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => !isAlreadyAdded && handleQuickAdd(preset)}
                disabled={isAlreadyAdded}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isAlreadyAdded ? '#E2E8F0' : preset.color,
                  backgroundColor: isAlreadyAdded ? '#F1F5F9' : '#FFFFFF',
                  color: isAlreadyAdded ? '#94A3B8' : preset.color,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isAlreadyAdded ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{preset.icon}</span>
                <span>{isAlreadyAdded ? `✓ ${preset.name}` : `+ ${preset.name}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Category Input Form */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '10px' }}>
          Create Custom Category
        </h3>

        <form onSubmit={handleCustomAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Baby Care, Ice Creams, Electronics"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Color Tag
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {presetColors.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: selectedColor === color ? '2px solid #0F172A' : 'none',
                    cursor: 'pointer',
                    boxShadow: selectedColor === color ? '0 0 0 2px #FFFFFF' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ height: '38px', width: '100%' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </div>

      {/* Categories Grid */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1rem' }}>
          Configured Retail Categories ({categories.length})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category.toLowerCase().includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(p.category.toLowerCase())).length;
            return (
              <div
                key={cat.id}
                className="card card-hover"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${cat.color || 'var(--primary)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: `${cat.color || '#0F766E'}15`,
                      color: cat.color || '#0F766E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      {cat.icon || 'category'}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                      {cat.name}
                    </h4>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {count} Products Linked
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#F1F5F9',
                    color: 'var(--text-body)'
                  }}
                >
                  Active
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
