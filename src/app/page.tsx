'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ProductCarousel from '@/components/ProductCarousel';
import HeroBanner from '@/components/HeroBanner';
import styles from './page.module.css';

interface CarouselBlock {
  type: 'carousel';
  title: string;
  visibleCount: number;
  productIds: string[];
}

interface HeroBannerBlock {
  type: 'hero-banner';
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  link: string;
  linkText: string;
}

type LayoutBlock = CarouselBlock | HeroBannerBlock;

interface HomeLayout {
  id: string;
  slug: string;
  title: string;
  blocks: LayoutBlock[];
}

export default function Home() {
  const [layout, setLayout] = useState<HomeLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await fetch('/api/b4f');
        if (!res.ok) {
          throw new Error('Failed to load home page');
        }
        const data = await res.json();
        setLayout(data);
      } catch (err) {
        console.error('Failed to fetch home layout:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className={styles.error}>
        <h1>Something went wrong</h1>
        <p>{error || 'Unable to load page content'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {layout.blocks.map((block, index) => {
          switch (block.type) {
            case 'carousel':
              return (
                <ProductCarousel
                  key={`carousel-${index}`}
                  title={block.title}
                  productIds={block.productIds}
                  visibleCount={block.visibleCount}
                />
              );
            case 'hero-banner':
              return (
                <HeroBanner
                  key={`hero-${index}`}
                  title={block.title}
                  subtitle={block.subtitle}
                  backgroundColor={block.backgroundColor}
                  textColor={block.textColor}
                  link={block.link}
                  linkText={block.linkText}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
