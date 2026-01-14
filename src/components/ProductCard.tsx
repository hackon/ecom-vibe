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

export default function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  category,
  woodType,
}: ProductCardProps) {
  return (
    <Link href={`/product/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={styles.image}
          />
        ) : (
          <div className={styles.noImage}>
            No Image
          </div>
        )}
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
