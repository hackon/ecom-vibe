'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart, ArrowLeft, Loader2, ChevronDown, ChevronUp, Package, Ruler, Tag, Info } from 'lucide-react';
import styles from './ProductDetail.module.css';

interface ProductAttributes {
  woodType?: string;
  finish?: string;
  dimensions?: string;
  grade?: string;
  type?: string;
  material?: string;
  brand?: string;
  bladeLength?: string;
  pieces?: string;
  size?: string;
  capacity?: string;
  power?: string;
  padSize?: string;
  packSize?: string;
  diameter?: string;
  length?: string;
  sizes?: string;
  pins?: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  attributes: ProductAttributes;
  stock: number;
  images: string[];
}

// Collapsible section component
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.collapsibleSection}>
      <button
        className={styles.collapsibleHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.collapsibleTitle}>
          {Icon && <Icon size={18} className={styles.collapsibleIcon} />}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className={styles.collapsibleContent}>{children}</div>}
    </div>
  );
}

// Attribute row component
function AttributeRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className={styles.attributeRow}>
      <dt className={styles.attributeLabel}>{label}</dt>
      <dd className={styles.attributeValue}>{value}</dd>
    </div>
  );
}

// Generate placeholder image for error fallback
function getPlaceholderImage(category?: string): string {
  const colors: Record<string, { bg: string; fg: string }> = {
    'Wood': { bg: '8B4513', fg: 'F5DEB3' },
    'Tools': { bg: '4A5568', fg: 'E2E8F0' },
    'Hardware': { bg: 'B7791F', fg: 'FEFCBF' },
  };
  const { bg, fg } = colors[category || ''] || { bg: '6B7280', fg: 'F3F4F6' };
  const text = encodeURIComponent(category || 'Product');
  return `https://placehold.co/600x600/${bg}/${fg}?text=${text}`;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setImageError(false);
      try {
        const res = await fetch(`/api/backend/v1/products/${productId}`);
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
        <Link href="/search" className={styles.notFoundLink}>
          Return to search
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = imageError ? getPlaceholderImage(product.category) : (images[selectedImage] || getPlaceholderImage(product.category));
  const attrs = product.attributes || {};

  // Group attributes by category
  const hasWoodAttributes = attrs.woodType || attrs.finish || attrs.grade || attrs.dimensions;
  const hasToolAttributes = attrs.type || attrs.brand || attrs.material || attrs.power || attrs.bladeLength || attrs.capacity || attrs.padSize;
  const hasHardwareAttributes = attrs.material || attrs.finish || attrs.size || attrs.packSize || attrs.diameter || attrs.length;
  const hasMiscAttributes = attrs.pieces || attrs.sizes || attrs.pins;

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
                <img
                  src={currentImage}
                  alt={product.name}
                  onError={() => setImageError(true)}
                />
              </div>

              {images.length > 1 && (
                <div className={styles.thumbnails}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImage(idx);
                        setImageError(false);
                      }}
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

              <p className={styles.sku}>SKU: {product.sku}</p>

              <div className={styles.priceSection}>
                <span className={styles.price}>
                  ${(product.price ?? 0).toFixed(2)}
                </span>
                <span className={styles.priceCurrency}>{product.currency}</span>
              </div>

              <div className={`${styles.stockBadge} ${product.stock > 0 ? styles.stockInStock : styles.stockOutOfStock}`}>
                {product.stock > 0 ? (
                  <>
                    <Package size={14} />
                    {product.stock} in stock
                  </>
                ) : (
                  'Out of stock'
                )}
              </div>

              {product.description && (
                <p className={styles.description}>
                  {product.description}
                </p>
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
                <button className={styles.addToCartButton} disabled={product.stock === 0}>
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className={styles.wishlistButton}>
                  <Heart size={20} />
                </button>
              </div>

              {/* Collapsible Attribute Sections */}
              <div className={styles.attributeSections}>
                {/* Product Details - Always shown */}
                <CollapsibleSection title="Product Details" icon={Tag} defaultOpen={true}>
                  <dl className={styles.attributeList}>
                    <AttributeRow label="Category" value={product.category} />
                    <AttributeRow label="SKU" value={product.sku} />
                    {attrs.brand && <AttributeRow label="Brand" value={attrs.brand} />}
                    {attrs.type && <AttributeRow label="Type" value={attrs.type} />}
                  </dl>
                </CollapsibleSection>

                {/* Wood Specifications - For wood products */}
                {hasWoodAttributes && product.category === 'Wood' && (
                  <CollapsibleSection title="Wood Specifications" icon={Info} defaultOpen={true}>
                    <dl className={styles.attributeList}>
                      <AttributeRow label="Wood Type" value={attrs.woodType} />
                      <AttributeRow label="Grade" value={attrs.grade} />
                      <AttributeRow label="Finish" value={attrs.finish} />
                      <AttributeRow label="Dimensions" value={attrs.dimensions} />
                    </dl>
                  </CollapsibleSection>
                )}

                {/* Tool Specifications - For tools */}
                {hasToolAttributes && product.category === 'Tools' && (
                  <CollapsibleSection title="Tool Specifications" icon={Ruler} defaultOpen={true}>
                    <dl className={styles.attributeList}>
                      <AttributeRow label="Type" value={attrs.type} />
                      <AttributeRow label="Brand" value={attrs.brand} />
                      <AttributeRow label="Material" value={attrs.material} />
                      <AttributeRow label="Power" value={attrs.power} />
                      <AttributeRow label="Blade Length" value={attrs.bladeLength} />
                      <AttributeRow label="Capacity" value={attrs.capacity} />
                      <AttributeRow label="Pad Size" value={attrs.padSize} />
                    </dl>
                  </CollapsibleSection>
                )}

                {/* Hardware Specifications - For hardware */}
                {hasHardwareAttributes && product.category === 'Hardware' && (
                  <CollapsibleSection title="Hardware Specifications" icon={Package} defaultOpen={true}>
                    <dl className={styles.attributeList}>
                      <AttributeRow label="Material" value={attrs.material} />
                      <AttributeRow label="Finish" value={attrs.finish} />
                      <AttributeRow label="Size" value={attrs.size} />
                      <AttributeRow label="Pack Size" value={attrs.packSize} />
                      <AttributeRow label="Diameter" value={attrs.diameter} />
                      <AttributeRow label="Length" value={attrs.length} />
                    </dl>
                  </CollapsibleSection>
                )}

                {/* Additional Info - Misc attributes */}
                {hasMiscAttributes && (
                  <CollapsibleSection title="Additional Information" icon={Info} defaultOpen={false}>
                    <dl className={styles.attributeList}>
                      <AttributeRow label="Pieces" value={attrs.pieces} />
                      <AttributeRow label="Sizes Included" value={attrs.sizes} />
                      <AttributeRow label="Pins" value={attrs.pins} />
                    </dl>
                  </CollapsibleSection>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
