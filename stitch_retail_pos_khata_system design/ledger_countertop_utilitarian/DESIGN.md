---
name: Ledger & Countertop Utilitarian
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#0047bf'
  on-tertiary: '#ffffff'
  tertiary-container: '#1e5fe7'
  on-tertiary-container: '#e6e9ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  display-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  numeric-hero:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  numeric-hero-mobile:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for the fast-paced, high-throughput retail shop environment. Built specifically for single-counter operators, corner grocery stores, and fast-moving retail merchants, the interface balances transactional speed with financial clarity. The product eliminates cognitive friction through an aesthetic of modern utility: bold, glanceable data hierarchies, ergonomic one-handed thumb interaction zones, and uncompromising semantic clarity.

The aesthetic fuses **Tactile Utilitarianism** with **Modern Corporate Reliability**. Interfaces emulate the certainty of physical receipts and industrial cash registers, updated with high-efficiency mobile design patterns. The visual tone evokes trust, precision, fiscal discipline, and speed. Surfaces minimize glare under harsh fluorescent tube lights and bright outdoor sunlight by prioritizing high-contrast ink-on-paper values, deliberate typographic scale, and dedicated monospace currency data fields.

## Colors

The palette is tuned specifically for fiscal tracking, inventory state verification, and fast counter checkout. It uses a high-contrast ink-and-canvas balance with four strict financial status pairings.

### Primary Palette & Chrome
- **Primary Brand (Emerald Teal)**: `#0F766E` (Active checkout states, primary conversion actions, verified merchant status). Interactive Hover: `#115E59`. Soft Tint Surface: `#CCFBF1`.
- **Navigation & Shell (Slate Navy)**: `#0F172A` (Top app bars, bottom navigation frames, and high-impact structural dividers). Chrome Hover: `#1E293B`. Chrome Active Content: `#F8FAFC`.
- **Canvas & Containers**:
  - Application Canvas: `#F1F5F9` (Low-fatigue light slate base).
  - Card & Modal Surfaces: `#FFFFFF` (Pure white for scannable data layering).
  - Outlines & Separators: `#E2E8F0` (Single-pixel hairline borders).

### Financial Semantics (Foreground on Background Tint)
All status badges, ledger records, and balance tallies strictly adhere to high-contrast two-tone pairings:
- **Cash Received / Profit / In-Stock**: Text `#16A34A` over Surface `#DCFCE7`.
- **Udhaar / Credit / Pending Receivables**: Text `#D97706` over Surface `#FEF3C7`.
- **Low Stock / Overdue / High Debt Alert**: Text `#DC2626` over Surface `#FEE2E2`.
- **Supplier Dues / Stock-In / System Info**: Text `#2563EB` over Surface `#DBEAFE`.

### Text & Contrast Hierarchy
- **Heading / Dense Value**: `#0F172A` (WCAG AAA compliant on white).
- **Body & Transaction Item**: `#334155` (Balanced reading grade).
- **Muted / Timestamp / Meta**: `#64748B` (Secondary receipts and barcodes).

## Typography

The type structure relies on a deliberate duality: **Plus Jakarta Sans** for clear, humanist interface navigation and customer names, paired with **JetBrains Mono** for all numerical ledgers, SKU codes, totals, currency symbols, and timestamps.

### Numerical Data Strictness
All prices, customer debt balances, quantities, and cash transactions must strictly use `JetBrains Mono` with the CSS property `font-variant-numeric: tabular-nums`. This guarantees vertical decimal alignment across multi-line ledger tallies, shopping carts, and daily sales digests.

### Scaled Hierarchy
- **Display & Large Ledger Counters**: Reserved for primary register figures, drawer cash totals, and overdue aggregate balance screens. Scaled down gracefully on narrow mobile viewports.
- **Headings**: Set tight with slight negative tracking on `headline-lg` (`-0.02em`) to maintain editorial punch in compact mobile headers.
- **Labels & Micro-Tags**: Set in uppercase for mono variants (`label-sm`), providing instant scannability for payment tags (e.g., `CASH`, `UPI`, `UDHAAR`).

## Layout & Spacing

The layout model is driven by vertical density and thumb-zone ergonomics. Shopkeepers interact while holding a phone in one hand and handling merchandise or cash with the other.

### Grid & Margins
- **Mobile (< 640px)**: 4-column fluid layout with `1rem` outer canvas margins and `0.75rem` inner gutters. Critical bottom sheets, quick-action POS triggers, and numpad inputs anchor to the lower 40% of the display.
- **Tablet / POS Terminal Stand (640px - 1024px)**: 8-column layout. Split-pane layout: Left pane (5 cols) for product catalog grid / barcode search; Right pane (3 cols) for the persistent live checkout tape and payment reconciliation drawer.
- **Desktop / Admin Hub (> 1024px)**: 12-column layout with `2rem` margins, maximum content width capped at `1280px` for dense accounting tables.

### Density Rules
Vertical stacking prioritizes information density over open expanses. Spacing between table rows and ledger line items is constrained to `space-sm` (`0.5rem`) to `space-md` (`0.75rem`), showing maximum transactions per viewport without scrolling.

## Elevation & Depth

This design system uses **structured surface separation** rather than floating, ambient shadows. Depth is communicated via structural border discipline, stark contrast layers, and intentional tactile offsets that remain crisp on low-cost IPS displays.

### Layer Hierarchy
- **Canvas Base Level (`#F1F5F9`)**: The substrate for all scrolling views.
- **Card Tier (`#FFFFFF`)**: Pure white containers resting on the canvas, bounded by a 1px border of `#E2E8F0`. No shadow is applied at rest; elevation is communicated via tone and border crispness.
- **Active / Focused Item**: Raised through an instantaneous border color shift to `#0F766E` paired with a sharp, dense drop shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)`.
- **Floating Modals & POS Action Trays**: Persistent bottom checkout sheets and quick-entry numpads utilize an elevated drop shadow with deep slate tinting: `0 -4px 16px rgba(15, 23, 42, 0.12)` accompanied by an upper edge hairline border (`1px solid #E2E8F0`).
- **Sticky Financial Ledgers**: Bottom summary bars (e.g., `TOTAL TO RECEIVE`) lock above the system navigation bar with an opaque `#0F172A` background, providing visual weight and anchoring the checkout action.

## Shapes

The interface embraces a functional, disciplined corner radius (`0.5rem` / `8px` default) that conveys structural order without feeling sharp or clinical.

### Radius Assignments
- **Primary Buttons, Inputs, & Ledger Cards**: Base roundedness (`0.5rem` / `8px`). This keeps item boundaries distinct in dense receipt lists.
- **Status Badges, Chips, & Micro-Counters**: Compact pill treatments (`9999px` / full round) to separate state indicators from interactive input containers.
- **Bottom Drawers & Slide-up Sheets**: `rounded-t-2xl` (`1rem` / `16px` on top-left and top-right only), visually signaling sheet mechanics without wasting valuable register screen space.
- **Barcode & Scanner Viewfinder Reticles**: Tight `4px` inner corners with high-contrast accent notches.

## Components

### Buttons & Touch Ergonomics
- **Minimum Target Size**: All mobile touch elements are strictly $\ge 44\text{px}$ in height and width. Primary POS action buttons (e.g., "COLLECT CASH", "ADD TO BILL") measure $52\text{px}$ in height.
- **Primary Action**: Solid `#0F766E` fill, white bold text, `8px` radius. Active state darkens to `#115E59`.
- **Secondary Ledger Trigger**: `#0F172A` Slate Navy fill with `#F8FAFC` text, applied to master reports and drawer balances.
- **Ghost / Utility**: 1px border in `#E2E8F0`, transparent base, `#0F172A` text.

### Inputs & Number Pads
- **Currency Entry**: Built with dedicated large inputs featuring fixed currency prefixes (₹/$/€) and `JetBrains Mono` tabular digits. Font scale ramps down dynamically as figures exceed 6 digits.
- **Custom POS Numpad**: On-screen custom keypad buttons use `#FFFFFF` background with active state `#E2E8F0`, $56\text{px}$ minimum height, displaying bold `20px` JetBrains Mono glyphs for rapid, non-mistake entry.

### Chips & Semantic Status Badges
- **Format**: Height $24\text{px}$, padding `2px 8px`, `fontFamily: JetBrains Mono`, size $11\text{px}$, font weight `600`, uppercase.
- **Udhaar Badge**: Background `#FEF3C7`, text `#D97706`, label `PENDING UDHAAR`.
- **Cleared / In-Stock Badge**: Background `#DCFCE7`, text `#16A34A`, label `PAID IN FULL`.
- **Danger Badge**: Background `#FEE2E2`, text `#DC2626`, label `DUE OVER 30D`.

### Ledger List Items & Receipt Cards
- **Line Items**: Two-row stacked architecture. Left column: Bold customer/item name (`Plus Jakarta Sans`, 14px) over timestamp/SKU (`Plus Jakarta Sans`, 12px, `#64748B`). Right column: Large transaction figure (`JetBrains Mono`, 16px, color-coded by flow) over net balance status.
- **Separators**: Flat `#E2E8F0` $1\text{px}$ border between items; zero margin collapse.

### Barcode & Scan Controls
- **Trigger Button**: High-contrast icon button with Slate Navy frame `#0F172A`, housing a bright Emerald Teal `#CCFBF1` viewfinder icon.
- **Target Reticle**: Full-screen camera viewfinder overlay with high-contrast corner bounds (`#0F766E`, 3px stroke weight) with an animated horizontal laser guideline in `#DC2626` for instant feedback.