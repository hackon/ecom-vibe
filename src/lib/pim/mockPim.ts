// Mock PIM State - Uses generated products for realistic dataset
import { generatedProducts, Product } from './productGenerator';

const pimData = {
  products: generatedProducts as Product[]
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
