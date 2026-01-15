'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, Package, Search } from 'lucide-react';
import styles from './admin.module.css';

interface Customer {
  id: string;
  email: string;
  customerType: 'private' | 'professional' | 'employee';
  profile?: {
    type: string;
    firstName?: string;
    lastName?: string;
    orgName?: string;
    contactPerson?: string;
    department?: string;
  };
  createdAt: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  attributes?: {
    woodType?: string;
    brand?: string;
    material?: string;
  };
}

type AdminView = 'customers' | 'products';

export default function AdminPage() {
  const [activeView, setActiveView] = useState<AdminView>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/backend/v1/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(productPage),
        limit: String(productsPerPage),
      });
      if (productSearch) {
        params.set('q', productSearch);
      }

      const response = await fetch(`/api/backend/v1/search?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setTotalProducts(data.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [productPage, productSearch]);

  useEffect(() => {
    if (activeView === 'customers') {
      fetchCustomers();
    } else {
      fetchProducts();
    }
  }, [activeView, fetchCustomers, fetchProducts]);

  const handleViewChange = (view: AdminView) => {
    setActiveView(view);
    setError(null);
    if (view === 'products') {
      setProductPage(1);
      setProductSearch('');
      setSearchInput('');
    }
  };

  const handleProductSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setProductPage(1);
    setProductSearch(searchInput);
  };

  const getCustomerName = (customer: Customer): string => {
    if (!customer.profile) return customer.email.split('@')[0];

    if (customer.profile.type === 'private' && customer.profile.firstName) {
      return `${customer.profile.firstName} ${customer.profile.lastName || ''}`.trim();
    }
    if (customer.profile.type === 'professional' && customer.profile.orgName) {
      return customer.profile.orgName;
    }
    if (customer.profile.type === 'employee' && customer.profile.department) {
      return `${customer.email.split('@')[0]} (${customer.profile.department})`;
    }

    return customer.email.split('@')[0];
  };

  const getBadgeClass = (type: string): string => {
    switch (type) {
      case 'private':
        return styles.badgePrivate;
      case 'professional':
        return styles.badgeProfessional;
      case 'employee':
        return styles.badgeEmployee;
      default:
        return '';
    }
  };

  const getCategoryBadgeClass = (category: string): string => {
    switch (category) {
      case 'Wood':
        return styles.badgeWood;
      case 'Tools':
        return styles.badgeTools;
      case 'Hardware':
        return styles.badgeHardware;
      default:
        return '';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className={styles.adminContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeView === 'customers' ? styles.tabActive : ''}`}
          onClick={() => handleViewChange('customers')}
        >
          <Users size={18} />
          Customers
        </button>
        <button
          className={`${styles.tab} ${activeView === 'products' ? styles.tabActive : ''}`}
          onClick={() => handleViewChange('products')}
        >
          <Package size={18} />
          Products
        </button>
      </div>

      {activeView === 'customers' ? (
        <div>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Customers</h1>
            <p className={styles.pageSubtitle}>Manage and view all registered customers</p>
          </div>

          <div className={styles.tableCard}>
            {isLoading ? (
              <div className={styles.loadingTable}>Loading customers...</div>
            ) : error ? (
              <div className={styles.emptyState}>{error}</div>
            ) : customers.length === 0 ? (
              <div className={styles.emptyState}>No customers found</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className={styles.customerName}>{getCustomerName(customer)}</div>
                        <div className={styles.customerEmail}>{customer.email}</div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${getBadgeClass(customer.customerType)}`}>
                          {customer.customerType === 'private' && 'Private'}
                          {customer.customerType === 'professional' && 'Professional'}
                          {customer.customerType === 'employee' && 'Employee'}
                        </span>
                      </td>
                      <td>{formatDate(customer.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Products</h1>
            <p className={styles.pageSubtitle}>
              Manage and view all products ({totalProducts} total)
            </p>
          </div>

          <form className={styles.searchForm} onSubmit={handleProductSearch}>
            <div className={styles.searchInputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search products by name, SKU, or category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.searchButton}>
              Search
            </button>
          </form>

          <div className={styles.tableCard}>
            {isLoading ? (
              <div className={styles.loadingTable}>Loading products...</div>
            ) : error ? (
              <div className={styles.emptyState}>{error}</div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>No products found</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className={styles.productName}>{product.name}</div>
                        {product.attributes?.brand && (
                          <div className={styles.productBrand}>{product.attributes.brand}</div>
                        )}
                      </td>
                      <td>
                        <code className={styles.sku}>{product.sku}</code>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${getCategoryBadgeClass(product.category)}`}>
                          {product.category}
                        </span>
                      </td>
                      <td className={styles.priceCell}>
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td>
                        <span className={product.stock > 0 ? styles.stockInStock : styles.stockOutOfStock}>
                          {product.stock > 0 ? product.stock : 'Out of stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                disabled={productPage === 1}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {productPage} of {totalPages}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() => setProductPage((p) => Math.min(totalPages, p + 1))}
                disabled={productPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
