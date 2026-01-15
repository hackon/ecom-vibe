'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Package, LayoutDashboard } from 'lucide-react';
import styles from './admin.module.css';

function AdminNav() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'customers';

  return (
    <nav className={styles.nav}>
      <Link
        href="/admin?view=customers"
        className={`${styles.navItem} ${currentView === 'customers' ? styles.navItemActive : ''}`}
      >
        <Users size={18} />
        <span>Customers</span>
      </Link>
      <Link
        href="/admin?view=products"
        className={`${styles.navItem} ${currentView === 'products' ? styles.navItemActive : ''}`}
      >
        <Package size={18} />
        <span>Products</span>
      </Link>
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
    if (!isLoading && isAuthenticated && user?.customerType !== 'employee') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.customerType !== 'employee') {
    return null;
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <LayoutDashboard size={24} />
          <span>Admin Panel</span>
        </div>
        <Suspense fallback={<div className={styles.nav}>Loading...</div>}>
          <AdminNav />
        </Suspense>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
