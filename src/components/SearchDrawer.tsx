'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import styles from './SearchDrawer.module.css';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
}

interface SearchDrawerProps {
  isOpen: boolean;
  searchQuery: string;
  onClose: () => void;
  onProductSelect: (productId: string) => void;
}

export default function SearchDrawer({
  isOpen,
  searchQuery,
  onClose,
  onProductSelect
}: SearchDrawerProps) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery || !isOpen) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/backend/v1/search?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.results || data.products || []);
      } catch (err) {
        setError('Failed to search');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.container}>
          {loading && (
            <div className={styles.loading}>
              <Loader2 className={styles.spinner} size={32} />
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && searchQuery && (
            <div className={styles.noResults}>
              No results found for "{searchQuery}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className={styles.header}>
                <h2 className={styles.title}>
                  {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
                </h2>
                <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className={styles.viewAll}>
                  View all results →
                </Link>
              </div>

              <div className={styles.grid}>
                {results.slice(0, 6).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => onProductSelect(product.id)}
                    className={styles.productCard}
                  >
                    {product.imageUrl && (
                      <div className={styles.imageWrapper}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={styles.productImage}
                        />
                      </div>
                    )}
                    <h3 className={styles.productName}>
                      {product.name}
                    </h3>
                    {product.category && (
                      <p className={styles.category}>{product.category}</p>
                    )}
                    {product.description && (
                      <p className={styles.description}>
                        {product.description}
                      </p>
                    )}
                    {product.price && (
                      <p className={styles.price}>
                        ${product.price.toFixed(2)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
