'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import SearchContainer from './SearchContainer';
import AuthDrawer from './AuthDrawer';
import { useAuth, isADUser, canAccessAdmin } from '@/contexts/AuthContext';
import { ShoppingCart, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import styles from './Header.module.css';

function UserMenu() {
  const { user, isAuthenticated, isLoading, logout, needsProfile } = useAuth();
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthDrawerOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthDrawerOpen(true);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  // Show profile completion prompt if needed
  if (isAuthenticated && needsProfile) {
    return (
      <>
        <button onClick={openRegister} className={styles.completeProfileButton}>
          Complete Profile
        </button>
        <AuthDrawer
          isOpen={isAuthDrawerOpen}
          onClose={() => setIsAuthDrawerOpen(false)}
          initialMode="register"
        />
      </>
    );
  }

  if (isLoading) {
    return <div className={styles.authLoading} />;
  }

  if (isAuthenticated && user) {
    // Get display name based on user type
    let displayName: string;
    let userTypeLabel: string;

    if (isADUser(user)) {
      displayName = user.givenName || user.displayName;
      userTypeLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    } else {
      // Customer user
      if (user.profile?.type === 'private') {
        displayName = user.profile.firstName;
      } else if (user.profile?.type === 'professional') {
        displayName = user.profile.orgName;
      } else {
        displayName = user.email.split('@')[0];
      }
      userTypeLabel = user.customerType === 'private'
        ? 'Private Customer'
        : user.customerType === 'professional'
          ? 'Business Customer'
          : '';
    }

    return (
      <div className={styles.userMenuWrapper}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={styles.userButton}
        >
          <User size={18} />
          <span className={styles.userName}>{displayName}</span>
          <ChevronDown size={14} className={isDropdownOpen ? styles.chevronOpen : ''} />
        </button>

        {isDropdownOpen && (
          <>
            <div className={styles.dropdownOverlay} onClick={() => setIsDropdownOpen(false)} />
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <p className={styles.dropdownEmail}>{user.email}</p>
                <p className={styles.dropdownType}>{userTypeLabel}</p>
              </div>
              <div className={styles.dropdownDivider} />
              {(isADUser(user) || user.customerType) && (
                <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                  <User size={16} />
                  Profile
                </Link>
              )}
              {canAccessAdmin(user) && (
                <Link href="/admin" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                  <Settings size={16} />
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={styles.authButtons}>
        <button onClick={openLogin} className={styles.loginButton}>
          Sign In
        </button>
        <button onClick={openRegister} className={styles.registerButton}>
          Register
        </button>
      </div>
      <AuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={() => setIsAuthDrawerOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Buildy McBuild
        </Link>

        <div className={styles.searchWrapper}>
          <Suspense fallback={<div className={styles.searchPlaceholder} />}>
            <SearchContainer />
          </Suspense>
        </div>

        <div className={styles.rightSection}>
          <UserMenu />
          <Link href="/cart" className={styles.cartLink}>
            <ShoppingCart size={20} />
            <span className={styles.cartText}>Cart</span>
            <span className={styles.cartBadge}>0</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
