'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, canAccessAdmin, isADUser } from '@/contexts/AuthContext';
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
    if (!isLoading && isAuthenticated && !canAccessAdmin(user)) {
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

  if (!isAuthenticated || !canAccessAdmin(user)) {
    return null;
  }

  // Get display name for sidebar
  const displayName = user && isADUser(user) ? user.displayName : user?.email;
  const role = user && isADUser(user) ? user.role : null;

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <LayoutDashboard size={24} />
          <span>Admin Panel</span>
        </div>
        {role && (
          <div className={styles.sidebarUser}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userRole}>{role.charAt(0).toUpperCase() + role.slice(1)}</div>
          </div>
        )}
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
