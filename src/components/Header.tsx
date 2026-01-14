'use client';

import React from 'react';
import Link from 'next/link';
import SearchContainer from './SearchContainer';
import { ShoppingCart } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Buildy McBuild
        </Link>

        <div className={styles.searchWrapper}>
          <SearchContainer />
        </div>

        <Link href="/cart" className={styles.cartLink}>
          <ShoppingCart size={20} />
          <span className={styles.cartText}>Cart</span>
          <span className={styles.cartBadge}>0</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
