'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import styles from './ProductDetail.module.css';

interface Product {
  id: string;
  name: string;
  description?: string;
  longDescription?: string;
  price?: number;
  imageUrl?: string;
  images?: string[];
  category?: string;
  woodType?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  stock?: number;
  sku?: string;
  specifications?: Record<string, string>;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/backend/v1/product/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Product not found</h1>
        <Link href="/" className={styles.notFoundLink}>
          Return to home
        </Link>
      </div>
    );
  }

  const images = product.images || (product.imageUrl ? [product.imageUrl] : []);

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <Link href="/search" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to search
        </Link>

        <div className={styles.card}>
          <div className={styles.grid}>
            {/* Images */}
            <div className={styles.imageSection}>
              <div className={styles.mainImage}>
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                  />
                ) : (
                  <div className={styles.noImage}>
                    No Image Available
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className={styles.thumbnails}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`${styles.thumbnail} ${selectedImage === idx ? styles.thumbnailActive : ''}`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className={styles.detailsSection}>
              {product.category && (
                <p className={styles.category}>
                  {product.category}
                </p>
              )}

              <h1 className={styles.title}>
                {product.name}
              </h1>

              {product.sku && (
                <p className={styles.sku}>SKU: {product.sku}</p>
              )}

              {product.price !== undefined && (
                <div className={styles.priceSection}>
                  <span className={styles.price}>
                    ${product.price.toFixed(2)}
                  </span>
                  <span className={styles.priceUnit}>per unit</span>
                </div>
              )}

              {product.description && (
                <p className={styles.description}>
                  {product.description}
                </p>
              )}

              {product.woodType && (
                <div className={styles.attribute}>
                  <span className={styles.attributeLabel}>Wood Type:</span>
                  <span className={styles.attributeValue}>{product.woodType}</span>
                </div>
              )}

              {product.dimensions && (
                <div className={styles.attribute}>
                  <span className={styles.attributeLabel}>Dimensions:</span>
                  <span className={styles.attributeValue}>
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                  </span>
                </div>
              )}

              {product.stock !== undefined && (
                <div className={`${styles.stock} ${product.stock > 0 ? styles.stockInStock : styles.stockOutOfStock}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              )}

              {/* Quantity Selector */}
              <div className={styles.quantitySection}>
                <label className={styles.quantityLabel}>
                  Quantity
                </label>
                <div className={styles.quantityControl}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className={styles.quantityInput}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button className={styles.addToCartButton}>
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className={styles.wishlistButton}>
                  <Heart size={20} />
                </button>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Specifications</h2>
                  <dl className={styles.specsList}>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className={styles.specItem}>
                        <dt className={styles.specKey}>{key}:</dt>
                        <dd className={styles.specValue}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Long Description */}
              {product.longDescription && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Description</h2>
                  <p className={styles.longDescription}>
                    {product.longDescription}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
