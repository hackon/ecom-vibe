// Mock PIM State
const pimData = {
  products: [
    {
      id: 'p1',
      sku: 'WD-OAK-001',
      name: 'Premium Oak Plank',
      description: 'High-quality sustainably sourced white oak plank, perfect for furniture making.',
      price: 45.00,
      currency: 'USD',
      category: 'Wood',
      attributes: {
        woodType: 'Oak',
        finish: 'Unfinished',
        dimensions: '2" x 6" x 8\'',
        grade: 'Select'
      },
      stock: 50,
      images: ['/images/products/oak-plank.jpg']
    },
    {
      id: 'p2',
      sku: 'TL-SAW-002',
      name: 'Japanese Pull Saw',
      description: 'Traditional Ryoba saw with dual edges for cross-cutting and ripping.',
      price: 65.50,
      currency: 'USD',
      category: 'Tools',
      attributes: {
        type: 'Hand Saw',
        bladeLength: '240mm',
        material: 'High Carbon Steel',
        brand: 'Gyokucho'
      },
      stock: 15,
      images: ['/images/products/pull-saw.jpg']
    },
    {
      id: 'p3',
      sku: 'HW-HNG-003',
      name: 'Antique Brass Hinge',
      description: 'Solid brass hinge with an antique finish, ideal for restoration projects.',
      price: 12.99,
      currency: 'USD',
      category: 'Hardware',
      attributes: {
        material: 'Brass',
        finish: 'Antique Brass',
        size: '3" x 3"',
        packSize: '2'
      },
      stock: 120,
      images: ['/images/products/brass-hinge.jpg']
    },
    {
      id: 'p4',
      sku: 'WD-WAL-004',
      name: 'Black Walnut Board',
      description: 'Rich dark walnut board, ideal for high-end cabinetry and fine woodworking.',
      price: 78.00,
      currency: 'USD',
      category: 'Wood',
      attributes: {
        woodType: 'Walnut',
        finish: 'Unfinished',
        dimensions: '1" x 12" x 8\'',
        grade: 'Premium'
      },
      stock: 30,
      images: ['/images/products/walnut-board.jpg']
    },
    {
      id: 'p5',
      sku: 'WD-MPL-005',
      name: 'Hard Maple Plank',
      description: 'Dense and durable hard maple, perfect for cutting boards and workbenches.',
      price: 52.00,
      currency: 'USD',
      category: 'Wood',
      attributes: {
        woodType: 'Maple',
        finish: 'Unfinished',
        dimensions: '2" x 8" x 6\'',
        grade: 'Select'
      },
      stock: 45,
      images: ['/images/products/maple-plank.jpg']
    },
    {
      id: 'p6',
      sku: 'TL-CHI-006',
      name: 'Wood Chisel Set',
      description: 'Professional 6-piece wood chisel set with hardened steel blades.',
      price: 89.99,
      currency: 'USD',
      category: 'Tools',
      attributes: {
        type: 'Chisel Set',
        pieces: '6',
        material: 'Chrome Vanadium Steel',
        brand: 'Narex'
      },
      stock: 22,
      images: ['/images/products/chisel-set.jpg']
    },
    {
      id: 'p7',
      sku: 'TL-PLN-007',
      name: 'Block Plane',
      description: 'Compact low-angle block plane for fine trimming and chamfering.',
      price: 125.00,
      currency: 'USD',
      category: 'Tools',
      attributes: {
        type: 'Hand Plane',
        size: 'No. 60-1/2',
        material: 'Ductile Iron',
        brand: 'Stanley'
      },
      stock: 12,
      images: ['/images/products/block-plane.jpg']
    },
    {
      id: 'p8',
      sku: 'HW-SCR-008',
      name: 'Wood Screws Assortment',
      description: 'Mixed box of brass wood screws in various sizes for all projects.',
      price: 24.50,
      currency: 'USD',
      category: 'Hardware',
      attributes: {
        material: 'Brass',
        finish: 'Polished',
        sizes: 'Assorted',
        packSize: '500'
      },
      stock: 85,
      images: ['/images/products/wood-screws.jpg']
    },
    {
      id: 'p9',
      sku: 'WD-CHR-009',
      name: 'Cherry Wood Board',
      description: 'Beautiful reddish-brown cherry wood, ages gracefully with exposure to light.',
      price: 68.00,
      currency: 'USD',
      category: 'Wood',
      attributes: {
        woodType: 'Cherry',
        finish: 'Unfinished',
        dimensions: '1" x 10" x 8\'',
        grade: 'Select'
      },
      stock: 28,
      images: ['/images/products/cherry-board.jpg']
    },
    {
      id: 'p10',
      sku: 'TL-SQR-010',
      name: 'Combination Square',
      description: 'Precision combination square with steel blade and cast iron head.',
      price: 42.00,
      currency: 'USD',
      category: 'Tools',
      attributes: {
        type: 'Measuring Tool',
        bladeLength: '12"',
        material: 'Steel',
        brand: 'Starrett'
      },
      stock: 35,
      images: ['/images/products/combo-square.jpg']
    },
    {
      id: 'p11',
      sku: 'WD-ASH-011',
      name: 'White Ash Plank',
      description: 'Strong and flexible ash wood, excellent for tool handles and baseball bats.',
      price: 38.00,
      currency: 'USD',
      category: 'Wood',
      attributes: {
        woodType: 'Ash',
        finish: 'Unfinished',
        dimensions: '2" x 4" x 8\'',
        grade: 'Standard'
      },
      stock: 55,
      images: ['/images/products/ash-plank.jpg']
    },
    {
      id: 'p12',
      sku: 'HW-KNB-012',
      name: 'Cabinet Knobs Set',
      description: 'Elegant bronze cabinet knobs with vintage design, set of 10.',
      price: 32.99,
      currency: 'USD',
      category: 'Hardware',
      attributes: {
        material: 'Bronze',
        finish: 'Oil Rubbed Bronze',
        diameter: '1.25"',
        packSize: '10'
      },
      stock: 75,
      images: ['/images/products/cabinet-knobs.jpg']
    },
    {
      id: 'p13',
      sku: 'TL-MRK-013',
      name: 'Marking Gauge',
      description: 'Traditional mortise marking gauge with dual steel pins.',
      price: 28.50,
      currency: 'USD',
      category: 'Tools',
      attributes: {
        type: 'Marking Tool',
        material: 'Rosewood',
        pins: '2',
        brand: 'Veritas'
      },
      stock: 18,
      images: ['/images/products/marking-gauge.jpg']
    },
    {
      id: 'p14',
      sku: 'WD-PIN-014',
      name: 'Pine Construction Lumber',
      description: 'Economical pine lumber for framing and general construction.',
      price: 18.00,
      currency: 'USD',
      category: 'Wood',
      attributes: {
        woodType: 'Pine',
        finish: 'Unfinished',
        dimensions: '2" x 4" x 8\'',
        grade: 'Construction'
      },
      stock: 200,
      images: ['/images/products/pine-lumber.jpg']
    },
    {
      id: 'p15',
      sku: 'TL-CLP-015',
      name: 'Quick-Grip Clamps Set',
      description: 'Set of 4 one-handed bar clamps with quick-release trigger.',
      price: 54.99,
      currency: 'USD',
      category: 'Tools',
      attributes: {
        type: 'Clamp',
        pieces: '4',
        capacity: '12"',
        brand: 'Irwin'
      },
      stock: 40,
      images: ['/images/products/clamps.jpg']
    },
    {
      id: 'p16',
      sku: 'HW-DRL-016',
      name: 'Drawer Slides Set',
      description: 'Soft-close drawer slides with full extension, 20" length.',
      price: 45.00,
      currency: 'USD',
      category: 'Hardware',
      attributes: {
        material: 'Steel',
        finish: 'Zinc Plated',
        length: '20"',
        packSize: '2'
      },
      stock: 60,
      images: ['/images/products/drawer-slides.jpg']
    },
    {
      id: 'p17',
      sku: 'WD-MAH-017',
      name: 'Mahogany Plank',
      description: 'Exotic mahogany with rich color, perfect for fine furniture.',
      price: 95.00,
      currency: 'USD',
      category: 'Wood',
      attributes: {
        woodType: 'Mahogany',
        finish: 'Unfinished',
        dimensions: '1" x 8" x 8\'',
        grade: 'Premium'
      },
      stock: 18,
      images: ['/images/products/mahogany-plank.jpg']
    },
    {
      id: 'p18',
      sku: 'TL-SND-018',
      name: 'Random Orbital Sander',
      description: 'Powerful 5" random orbital sander with variable speed control.',
      price: 149.00,
      currency: 'USD',
      category: 'Tools',
      attributes: {
        type: 'Power Tool',
        padSize: '5"',
        power: '3A',
        brand: 'Bosch'
      },
      stock: 8,
      images: ['/images/products/orbital-sander.jpg']
    },
    {
      id: 'p19',
      sku: 'HW-HLD-019',
      name: 'Shelf Pin Set',
      description: 'Adjustable shelf pin supports, nickel finish, set of 20.',
      price: 14.99,
      currency: 'USD',
      category: 'Hardware',
      attributes: {
        material: 'Steel',
        finish: 'Nickel',
        diameter: '5mm',
        packSize: '20'
      },
      stock: 95,
      images: ['/images/products/shelf-pins.jpg']
    },
    {
      id: 'p20',
      sku: 'WD-CED-020',
      name: 'Red Cedar Plank',
      description: 'Aromatic red cedar, naturally resistant to rot and insects.',
      price: 34.00,
      currency: 'USD',
      category: 'Wood',
      attributes: {
        woodType: 'Cedar',
        finish: 'Unfinished',
        dimensions: '1" x 6" x 8\'',
        grade: 'Select'
      },
      stock: 70,
      images: ['/images/products/cedar-plank.jpg']
    }
  ]
};

export async function getProducts() {
  await new Promise(resolve => setTimeout(resolve, 80)); // Simulate delay
  return pimData.products;
}

export async function getProductById(id: string) {
  await new Promise(resolve => setTimeout(resolve, 40)); // Simulate delay
  return pimData.products.find(p => p.id === id) || null;
}

export async function addProduct(product: Record<string, unknown>) {
  await new Promise(resolve => setTimeout(resolve, 150));
  const newProduct = {
    ...product,
    id: `p${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  (pimData.products as unknown[]).push(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: Record<string, unknown>) {
  await new Promise(resolve => setTimeout(resolve, 150));
  const index = pimData.products.findIndex(p => p.id === id);
  if (index !== -1) {
    const updatedProduct = { ...pimData.products[index], ...updates, updatedAt: new Date().toISOString() };
    (pimData.products as unknown[])[index] = updatedProduct;
    return updatedProduct;
  }
  return null;
}
