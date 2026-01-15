'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  woodType?: string;
}

// Generate a placeholder image URL using a service or SVG data URI
function getPlaceholderImage(category?: string, name?: string): string {
  // Use different colors based on category
  const colors: Record<string, { bg: string; fg: string }> = {
    'Wood': { bg: '8B4513', fg: 'F5DEB3' },
    'Tools': { bg: '4A5568', fg: 'E2E8F0' },
    'Hardware': { bg: 'B7791F', fg: 'FEFCBF' },
  };
  const { bg, fg } = colors[category || ''] || { bg: '6B7280', fg: 'F3F4F6' };
  const text = encodeURIComponent(category || 'Product');

  // Use placehold.co for reliable placeholders
  return `https://placehold.co/400x300/${bg}/${fg}?text=${text}`;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  category,
  woodType,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const placeholderUrl = getPlaceholderImage(category, name);
  const displayImageUrl = imgError || !imageUrl ? placeholderUrl : imageUrl;

  return (
    <Link href={`/product/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={displayImageUrl}
          alt={name}
          className={styles.image}
          onError={() => setImgError(true)}
        />
      </div>

      <div className={styles.content}>
        {category && (
          <p className={styles.category}>
            {category}
          </p>
        )}

        <h3 className={styles.title}>
          {name}
        </h3>

        {woodType && (
          <p className={styles.woodType}>
            <span className={styles.label}>Wood:</span> {woodType}
          </p>
        )}

        {description && (
          <p className={styles.description}>
            {description}
          </p>
        )}

        {price !== undefined && (
          <div className={styles.priceWrapper}>
            <span className={styles.price}>
              ${price.toFixed(2)}
            </span>
            <span className={styles.priceLabel}>per unit</span>
          </div>
        )}
      </div>
    </Link>
  );
}
