// Initial Seed Data for DukaanKhata Retail & POS System

export const INITIAL_CATEGORIES = [
  { id: 'cat_grocery', name: 'Grocery & Staples', icon: 'shopping_basket', color: '#0F766E' },
  { id: 'cat_dairy', name: 'Dairy & Eggs', icon: 'egg', color: '#2563EB' },
  { id: 'cat_pulses', name: 'Pulses & Spices', icon: 'grain', color: '#D97706' },
  { id: 'cat_beverages', name: 'Beverages & Tea', icon: 'local_cafe', color: '#7C3AED' },
  { id: 'cat_bakery', name: 'Bakery & Bread', icon: 'bakery_dining', color: '#EA580C' },
  { id: 'cat_toiletries', name: 'Toiletries & Care', icon: 'soap', color: '#059669' },
  { id: 'cat_snacks', name: 'Snacks & Sweets', icon: 'cookie', color: '#DB2777' }
];

export const INITIAL_UNITS = [
  { id: 'u_kg', name: 'Kilogram', symbol: 'kg', baseType: 'weight', conversionFactor: 1, badgeLabel: '1 kg = 1000 g', isDecimal: true },
  { id: 'u_g', name: 'Gram', symbol: 'g', baseType: 'weight', conversionFactor: 0.001, badgeLabel: '1000 g = 1 kg', isDecimal: true },
  { id: 'u_litre', name: 'Litre', symbol: 'litre', baseType: 'volume', conversionFactor: 1, badgeLabel: '1 litre = 1000 ml', isDecimal: true },
  { id: 'u_ml', name: 'Millilitre', symbol: 'ml', baseType: 'volume', conversionFactor: 0.001, badgeLabel: '1000 ml = 1 litre', isDecimal: true },
  { id: 'u_pc', name: 'Piece', symbol: 'pc', baseType: 'count', conversionFactor: 1, badgeLabel: '1 pc single item', isDecimal: false },
  { id: 'u_dozen', name: 'Dozen', symbol: 'dozen', baseType: 'count', conversionFactor: 12, badgeLabel: '1 dozen = 12 pcs', isDecimal: false },
  { id: 'u_packet', name: 'Packet', symbol: 'pk', baseType: 'count', conversionFactor: 1, badgeLabel: 'Retail Unit Pack', isDecimal: false },
  { id: 'u_carton', name: 'Carton', symbol: 'carton', baseType: 'count', conversionFactor: 24, badgeLabel: '1 carton = 24 pk', isDecimal: false }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Basmati Rice Super Kernel',
    category: 'Grocery & Staples',
    brand: 'Super Kernel',
    baseUnit: 'kg',
    purchasePrice: 280,
    salePrice: 340,
    currentStock: 48.5,
    minStock: 20,
    barcode: '896400012345',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAulv4ibN3jxz5ZIcvrYuYSN3DuYZm2pvafBBVBYqSknf6GPWsGbyEDC6KWwj-iRL3IJqkCuA8Wai5SyY6nMHyVEdDOunROKnqcKkA_6grAJwq2pRMz4Y3lEXJmsM3RqFrxTdSGRfWtPnU1hITBnjHTqcDH6TUGuqPtCn3XxIHr-sbe_qbWDUoKHBWLXoghCHbW1-BN1PLpHlgZWS_1XyY8FAHUcCxehxF_Gl-7Z4naQ7yClli1HysPIA'
  },
  {
    id: 'prod_2',
    name: 'Nestle Milkpak 1L',
    category: 'Dairy & Eggs',
    brand: 'Nestle',
    baseUnit: 'pk',
    purchasePrice: 245,
    salePrice: 290,
    currentStock: 24,
    minStock: 10,
    barcode: '896400023456',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByJIZJ1kSrLbkpPUVs7M0sKkxvQFIm7vt2xAEdjH3h6REYl2133NuBA8bfrYVTpZoKm64BanzTqCLtIWkKyKdHuMdJMz1FUx3DTocvd0wgL-vW1e3WzKtclc2Yn4A2OR9g9KKlTVGE8EYBvgL50j0hOYbZ3Ii0uujmALXO5EzvwLXIVmDbfcRldPLT9y-cn80H6UkE_m5jcdKlTlWmWk-Z7du5Bb_cyMqMVFYjY1ljXEh4C-dUJbt53g'
  },
  {
    id: 'prod_3',
    name: 'Dal Chana Special Unpolished',
    category: 'Pulses & Spices',
    brand: 'Desi Harvest',
    baseUnit: 'kg',
    purchasePrice: 210,
    salePrice: 260,
    currentStock: 35.0,
    minStock: 15,
    barcode: '896400034567',
    image: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_4',
    name: 'Dalda Cooking Oil 5L Can',
    category: 'Grocery & Staples',
    brand: 'Dalda',
    baseUnit: 'pc',
    purchasePrice: 2250,
    salePrice: 2650,
    currentStock: 12,
    minStock: 5,
    barcode: '896400045678',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_5',
    name: 'Tapal Danedar Tea 450g',
    category: 'Beverages & Tea',
    brand: 'Tapal',
    baseUnit: 'pk',
    purchasePrice: 540,
    salePrice: 620,
    currentStock: 18,
    minStock: 8,
    barcode: '896400056789',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_6',
    name: 'Rooh Afza Sharbat 800ml',
    category: 'Beverages & Tea',
    brand: 'Hamdard',
    baseUnit: 'pc',
    purchasePrice: 380,
    salePrice: 440,
    currentStock: 5,
    minStock: 10, // LOW STOCK ALERT!
    barcode: '896400067890',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_7',
    name: 'Shan Special Biryani Masala 50g',
    category: 'Pulses & Spices',
    brand: 'Shan Foods',
    baseUnit: 'pk',
    purchasePrice: 95,
    salePrice: 120,
    currentStock: 4,
    minStock: 15, // LOW STOCK ALERT!
    barcode: '896400078901',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_8',
    name: 'Olpers Milk 1.5L Eco Pack',
    category: 'Dairy & Eggs',
    brand: 'Engro',
    baseUnit: 'pk',
    purchasePrice: 360,
    salePrice: 420,
    currentStock: 3,
    minStock: 12, // LOW STOCK ALERT!
    barcode: '896400089012',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_9',
    name: 'Dawn Plain Bread Large',
    category: 'Bakery & Bread',
    brand: 'Dawn',
    baseUnit: 'pc',
    purchasePrice: 150,
    salePrice: 190,
    currentStock: 16,
    minStock: 6,
    barcode: '896400090123',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_10',
    name: 'Fine White Sugar Desi Shakkar',
    category: 'Grocery & Staples',
    brand: 'Al-Madina Mill',
    baseUnit: 'kg',
    purchasePrice: 132,
    salePrice: 155,
    currentStock: 110.0,
    minStock: 40,
    barcode: '896400101234',
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_11',
    name: 'Lux Velvet Touch Beauty Soap 140g',
    category: 'Toiletries & Care',
    brand: 'Unilever',
    baseUnit: 'pc',
    purchasePrice: 135,
    salePrice: 165,
    currentStock: 28,
    minStock: 10,
    barcode: '896400112345',
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod_12',
    name: 'Lipton Yellow Label Black Tea 380g',
    category: 'Beverages & Tea',
    brand: 'Lipton',
    baseUnit: 'pk',
    purchasePrice: 490,
    salePrice: 580,
    currentStock: 0, // OUT OF STOCK!
    minStock: 8,
    barcode: '896400123456',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust_1',
    name: 'Muhammad Imran (Govt Teacher)',
    phone: '0300-1234567',
    address: 'House #14, Street 3, G-9/2, Islamabad',
    creditLimit: 25000,
    salaryDay: 5, // 5th of each month
    currentBalance: 14850,
    status: 'overdue', // past due date
    dueDate: '2026-10-05',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9cUf9xSKqXgiYE0lTLWjwOC6L_wm7KZW54NnrdMxeWtcO65Vlt03p_SeEoc5u0_pEI-fKE_jGx2771TAE4_WcNCBgfae-CfJ3MVfUgmWljZ_wnHHm3lE1y2cklHTjc7DHj-WxSPapBJxsJCUNqsT7SEuOVVdDRTJahw9HmYQaTw3aFN7LGaBtvxBO_gChfOv1M3QCn9HKgPa5TSLtBo-WcrglAxV4rRqyUi1s-Vx7HJNu4NT1VMnT3Q'
  },
  {
    id: 'cust_2',
    name: 'Chaudhry Bilal Ahmed (Property)',
    phone: '0321-9876543',
    address: 'Plaza 4, Commercial Market',
    creditLimit: 50000,
    salaryDay: 1,
    currentBalance: 28400,
    status: 'overdue',
    dueDate: '2026-10-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust_3',
    name: 'Haji Rafique Tailors',
    phone: '0333-5551234',
    address: 'Shop 12, Main Bazaar',
    creditLimit: 30000,
    salaryDay: 25,
    currentBalance: 9200,
    status: 'due_soon',
    dueDate: '2026-10-25',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust_4',
    name: 'Dr. Tariq Mehmood Clinic',
    phone: '0345-7788990',
    address: 'Al-Shifa Clinic, Near Central Mosque',
    creditLimit: 40000,
    salaryDay: 30,
    currentBalance: 12600,
    status: 'due_soon',
    dueDate: '2026-10-30',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust_5',
    name: 'Farhan Qureshi (Software Engineer)',
    phone: '0312-3344556',
    address: 'Sector F-10/4, Islamabad',
    creditLimit: 20000,
    salaryDay: 1,
    currentBalance: 0,
    status: 'settled',
    dueDate: '2026-11-01',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CUSTOMER_LEDGER = [
  {
    id: 'led_1',
    customerId: 'cust_1',
    customerName: 'Muhammad Imran (Govt Teacher)',
    date: '2026-10-02',
    time: '18:40',
    type: 'DEBIT_BILL',
    invoiceNo: 'INV-4180',
    amount: 8450,
    runningBalance: 8450,
    description: 'Monthly ration groceries (Rice 10kg, Cooking Oil 5L, Dal Chana)',
    items: [
      { name: 'Basmati Rice', qty: '10 kg', total: 3400 },
      { name: 'Cooking Oil 5L', qty: '1 can', total: 2650 },
      { name: 'Dal Chana', qty: '5 kg', total: 1300 },
      { name: 'Tapal Tea 450g', qty: '1 pk', total: 620 },
      { name: 'Sugar Fine', qty: '3 kg', total: 480 }
    ]
  },
  {
    id: 'led_2',
    customerId: 'cust_1',
    customerName: 'Muhammad Imran (Govt Teacher)',
    date: '2026-10-08',
    time: '20:15',
    type: 'DEBIT_BILL',
    invoiceNo: 'INV-4212',
    amount: 6400,
    runningBalance: 14850,
    description: 'Dairy, bread, tea and toiletries ration',
    items: [
      { name: 'Milkpak 1L', qty: '12 pk', total: 3480 },
      { name: 'Dawn Plain Bread', qty: '4 pcs', total: 760 },
      { name: 'Lux Soap 140g', qty: '6 pcs', total: 990 },
      { name: 'Rooh Afza 800ml', qty: '2 pcs', total: 880 },
      { name: 'Shan Biryani Masala', qty: '2 pk', total: 290 }
    ]
  },
  {
    id: 'led_3',
    customerId: 'cust_2',
    customerName: 'Chaudhry Bilal Ahmed (Property)',
    date: '2026-10-01',
    time: '14:20',
    type: 'DEBIT_BILL',
    invoiceNo: 'INV-4155',
    amount: 38400,
    runningBalance: 38400,
    description: 'Office tea, milk cartons, and cleaning supplies',
    items: [
      { name: 'Milkpak 1L', qty: '24 pk (1 carton)', total: 6960 },
      { name: 'Tapal Danedar', qty: '6 pk', total: 3720 },
      { name: 'Cooking Oil 5L', qty: '4 cans', total: 10600 },
      { name: 'Basmati Rice', qty: '50 kg', total: 17000 },
      { name: 'Sugar Desi', qty: '10 kg', total: 1550 }
    ]
  },
  {
    id: 'led_4',
    customerId: 'cust_2',
    customerName: 'Chaudhry Bilal Ahmed (Property)',
    date: '2026-10-12',
    time: '17:00',
    type: 'CREDIT_PAYMENT',
    invoiceNo: 'REC-108',
    amount: 10000,
    runningBalance: 28400,
    description: 'Partial Cash Payment received at counter',
    items: []
  },
  {
    id: 'led_5',
    customerId: 'cust_3',
    customerName: 'Haji Rafique Tailors',
    date: '2026-10-15',
    time: '19:10',
    type: 'DEBIT_BILL',
    invoiceNo: 'INV-4250',
    amount: 9200,
    runningBalance: 9200,
    description: 'Weekly ration & oil',
    items: [
      { name: 'Cooking Oil 5L', qty: '2 cans', total: 5300 },
      { name: 'Basmati Rice', qty: '10 kg', total: 3400 },
      { name: 'Sugar Fine', qty: '3 kg', total: 500 }
    ]
  }
];

export const INITIAL_SUPPLIERS = [
  {
    id: 'sup_1',
    name: 'Shan Foods Ltd Distribution',
    phone: '021-35071111',
    company: 'Shan Distributors Central',
    address: 'Korangi Industrial Area, Karachi / I-9 Islamabad',
    totalPurchases: 145000,
    totalPaid: 115000,
    balanceOwed: 30000
  },
  {
    id: 'sup_2',
    name: 'Engro Foods & Dairy Logistics',
    phone: '042-35789000',
    company: 'Engro Corporation',
    address: 'Depot 5, Rawalpindi Ring Road',
    totalPurchases: 220000,
    totalPaid: 185000,
    balanceOwed: 35000
  },
  {
    id: 'sup_3',
    name: 'Unilever Pakistan Wholesale',
    phone: '051-4433221',
    company: 'Unilever North Depot',
    address: 'Plot 44, Industrial Estate I-10/3, Islamabad',
    totalPurchases: 180000,
    totalPaid: 160000,
    balanceOwed: 20000
  },
  {
    id: 'sup_4',
    name: 'Metro Wholesale Cash & Carry',
    phone: '051-111786111',
    company: 'Metro Pakistan',
    address: 'Peshawar Road, Rawalpindi',
    totalPurchases: 95000,
    totalPaid: 95000,
    balanceOwed: 0
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp_1',
    category: 'Shop Rent',
    title: 'October Shop Space Rent (Shop 3 & 4)',
    amount: 45000,
    date: '2026-10-01',
    paymentMode: 'Bank Transfer',
    note: 'Paid to landlord Malik Zahoor'
  },
  {
    id: 'exp_2',
    category: 'Commercial Electricity',
    title: 'IESCO Commercial Power Bill',
    amount: 28400,
    date: '2026-10-12',
    paymentMode: 'EasyPaisa',
    note: 'Deep freezer & AC compressor usage'
  },
  {
    id: 'exp_3',
    category: 'Staff Salaries',
    title: 'Store Helper & POS Staff Weekly Wage',
    amount: 15000,
    date: '2026-10-14',
    paymentMode: 'Cash',
    note: 'Cash payment to Hamza and Tariq'
  },
  {
    id: 'exp_4',
    category: 'Maintenance',
    title: 'Display Chiller Gas Recharge & Fan Repair',
    amount: 4500,
    date: '2026-10-18',
    paymentMode: 'Cash',
    note: 'Technician Naveed AC Works'
  },
  {
    id: 'exp_5',
    category: 'Tea & Refreshment',
    title: 'Staff tea & customer mineral water',
    amount: 1200,
    date: '2026-10-19',
    paymentMode: 'Cash',
    note: 'Daily dhabba tea bill'
  }
];

export const INITIAL_SALES = [
  {
    id: 'sale_1',
    invoiceNo: 'INV-4820',
    date: '2026-10-19',
    time: '10:15 AM',
    customerType: 'walkin',
    customerId: null,
    customerName: 'Walk-in Cash Customer',
    items: [
      { id: 'prod_2', name: 'Nestle Milkpak 1L', qty: 2, unit: 'pk', price: 290, total: 580 },
      { id: 'prod_9', name: 'Dawn Plain Bread Large', qty: 1, unit: 'pc', price: 190, total: 190 }
    ],
    subtotal: 770,
    discount: 20,
    total: 750,
    paymentType: 'cash',
    cashTendered: 1000,
    changeReturn: 250,
    udhaarAmount: 0,
    cogs: 640,
    profit: 110,
    cashier: 'Hamza Farooq'
  },
  {
    id: 'sale_2',
    invoiceNo: 'INV-4821',
    date: '2026-10-19',
    time: '11:45 AM',
    customerType: 'khata',
    customerId: 'cust_1',
    customerName: 'Muhammad Imran (Govt Teacher)',
    items: [
      { id: 'prod_1', name: 'Basmati Rice Super Kernel', qty: 2.5, unit: 'kg', price: 340, total: 850 },
      { id: 'prod_2', name: 'Nestle Milkpak 1L', qty: 3, unit: 'pk', price: 290, total: 870 },
      { id: 'prod_4', name: 'Dalda Cooking Oil 5L Can', qty: 1, unit: 'pc', price: 2650, total: 2650 }
    ],
    subtotal: 4370,
    discount: 70,
    total: 4300,
    paymentType: 'split',
    cashTendered: 2000,
    changeReturn: 0,
    udhaarAmount: 2300,
    cogs: 3685,
    profit: 615,
    dueDate: '2026-10-30',
    cashier: 'Haji Muhammad Usman'
  },
  {
    id: 'sale_3',
    invoiceNo: 'INV-4822',
    date: '2026-10-19',
    time: '01:20 PM',
    customerType: 'walkin',
    customerId: null,
    customerName: 'Walk-in Cash Customer',
    items: [
      { id: 'prod_5', name: 'Tapal Danedar Tea 450g', qty: 2, unit: 'pk', price: 620, total: 1240 },
      { id: 'prod_10', name: 'Fine White Sugar Desi', qty: 5, unit: 'kg', price: 155, total: 775 },
      { id: 'prod_11', name: 'Lux Beauty Soap 140g', qty: 2, unit: 'pc', price: 165, total: 330 }
    ],
    subtotal: 2345,
    discount: 45,
    total: 2300,
    paymentType: 'cash',
    cashTendered: 2500,
    changeReturn: 200,
    udhaarAmount: 0,
    cogs: 2010,
    profit: 290,
    cashier: 'Hamza Farooq'
  }
];

export const INITIAL_SUPPLIER_LEDGER = [
  {
    id: 'sup_led_1',
    supplierId: 'sup_1',
    supplierName: 'Shan Foods Ltd Distribution',
    date: '2026-10-10',
    time: '11:30 AM',
    type: 'STOCK_IN',
    invoiceNo: 'SUP-781',
    totalAmount: 145000,
    amountPaid: 115000,
    balanceChange: 30000,
    runningBalance: 30000,
    note: 'Spices & Recipe Mixes Restock (Shan Special Biryani, Korma)'
  },
  {
    id: 'sup_led_2',
    supplierId: 'sup_2',
    supplierName: 'Engro Foods & Dairy Logistics',
    date: '2026-10-12',
    time: '10:00 AM',
    type: 'STOCK_IN',
    invoiceNo: 'SUP-795',
    totalAmount: 220000,
    amountPaid: 150000,
    balanceChange: 70000,
    runningBalance: 70000,
    note: 'Olpers Milk 1.5L and Dairy wholesale delivery'
  },
  {
    id: 'sup_led_3',
    supplierId: 'sup_2',
    supplierName: 'Engro Foods & Dairy Logistics',
    date: '2026-10-16',
    time: '04:15 PM',
    type: 'PAYMENT',
    invoiceNo: 'PAY-402',
    totalAmount: 0,
    amountPaid: 35000,
    balanceChange: -35000,
    runningBalance: 35000,
    note: 'Bank Transfer Payment via HBL'
  },
  {
    id: 'sup_led_4',
    supplierId: 'sup_3',
    supplierName: 'Unilever Pakistan Wholesale',
    date: '2026-10-14',
    time: '02:45 PM',
    type: 'STOCK_IN',
    invoiceNo: 'SUP-812',
    totalAmount: 180000,
    amountPaid: 160000,
    balanceChange: 20000,
    runningBalance: 20000,
    note: 'Lux Beauty Soap cartons & Lipton Yellow Label tea'
  },
  {
    id: 'sup_led_5',
    supplierId: 'sup_4',
    supplierName: 'Metro Wholesale Cash & Carry',
    date: '2026-10-15',
    time: '09:30 AM',
    type: 'STOCK_IN',
    invoiceNo: 'SUP-830',
    totalAmount: 95000,
    amountPaid: 95000,
    balanceChange: 0,
    runningBalance: 0,
    note: 'Sugar, Dal Chana, and Cooking oil wholesale bulk order'
  }
];
