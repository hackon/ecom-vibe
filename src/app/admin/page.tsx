'use client';

import React, { useEffect, useState } from 'react';
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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
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
    };

    fetchCustomers();
  }, []);

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
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
  );
}
