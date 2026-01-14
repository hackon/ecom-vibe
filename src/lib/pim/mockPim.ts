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
