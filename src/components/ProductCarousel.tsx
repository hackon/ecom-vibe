'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import styles from './ProductCarousel.module.css';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  images?: string[];
  category?: string;
  attributes?: {
    woodType?: string;
  };
}

interface ProductCarouselProps {
  title: string;
  productIds: string[];
  visibleCount?: number;
}

export default function ProductCarousel({
  title,
  productIds,
  visibleCount = 4
}: ProductCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Use search API with ids parameter for batch product fetching
        const ids = productIds.join(',');
        const res = await fetch(`/api/backend/v1/search?ids=${encodeURIComponent(ids)}`);

        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch carousel products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productIds.length > 0) {
      fetchProducts();
    }
  }, [productIds]);

  const maxIndex = Math.max(0, products.length - visibleCount);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  if (loading) {
    return (
      <section className={styles.carousel}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.loading}>
          <div className={styles.loadingGrid}>
            {Array.from({ length: visibleCount }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={styles.carousel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {products.length > visibleCount && (
          <div className={styles.controls}>
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={styles.navButton}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={styles.navButton}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.track}>
        <div
          className={styles.slider}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            width: `${(products.length / visibleCount) * 100}%`
          }}
        >
          {products.map(product => (
            <div
              key={product.id}
              className={styles.slide}
              style={{ width: `${100 / products.length}%` }}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.images?.[0]}
                category={product.category}
                woodType={product.attributes?.woodType}
              />
            </div>
          ))}
        </div>
      </div>

      {products.length > visibleCount && (
        <div className={styles.dots}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`${styles.dot} ${currentIndex === i ? styles.dotActive : ''}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
