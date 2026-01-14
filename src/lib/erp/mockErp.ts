// Mock ERP State
const erpData = {
  facilities: [
    {
      id: 'fac-1',
      name: 'Main Timber Yard',
      type: 'Warehouse',
      address: '123 Sawmill Rd, Forest City',
      inventory: [
        { productId: 'p1', stock: 50 },
        { productId: 'p2', stock: 15 },
        { productId: 'p3', stock: 120 }
      ],
      hours: '08:00 - 18:00',
      capabilities: ['Cutting', 'Planing', 'Delivery']
    }
  ],
  orders: [
    {
      id: 'ord-101',
      customerId: 'cust-1',
      status: 'Shipped',
      total: 125.50,
      currency: 'USD',
      lines: [
        { productId: 'p1', quantity: 2, price: 45.00 }
      ],
      createdAt: '2026-01-10T09:00:00Z'
    }
  ],
  pricing: {
    'p1': { basePrice: 45.00, discountable: true },
    'p2': { basePrice: 65.50, discountable: false },
    'p3': { basePrice: 12.99, discountable: true }
  }
};

export async function getFacilities() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return erpData.facilities;
}

export async function getFacilityById(id: string) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return erpData.facilities.find(f => f.id === id) || null;
}

export async function getOrders() {
  await new Promise(resolve => setTimeout(resolve, 120));
  return erpData.orders;
}

export async function getOrderById(id: string) {
  await new Promise(resolve => setTimeout(resolve, 60));
  return erpData.orders.find(o => o.id === id) || null;
}

export async function createOrder(orderData: Record<string, unknown>) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newOrder = {
    ...orderData,
    id: `ord-${Math.floor(Math.random() * 1000)}`,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  (erpData.orders as unknown[]).push(newOrder);
  return newOrder;
}

export async function getPrice(productId: string, customerId?: string) {
  await new Promise(resolve => setTimeout(resolve, 40));
  const base = (erpData.pricing as Record<string, {basePrice: number}>)[productId];
  if (!base) return null;
  
  // Simple customer-specific discount logic
  let finalPrice = base.basePrice;
  if (customerId === 'cust-1') {
    finalPrice = finalPrice * 0.9; // 10% discount for premium customer
  }
  
  return {
    productId,
    price: finalPrice,
    currency: 'USD',
    discountApplied: finalPrice < base.basePrice
  };
}
