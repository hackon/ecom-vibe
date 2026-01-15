'use client';

import Link from 'next/link';
import { Truck, ArrowRight } from 'lucide-react';
import styles from './HeroBanner.module.css';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  link: string;
  linkText: string;
}

export default function HeroBanner({
  title,
  subtitle,
  backgroundColor,
  textColor,
  link,
  linkText
}: HeroBannerProps) {
  return (
    <section
      className={styles.banner}
      style={{
        backgroundColor,
        color: textColor
      }}
    >
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <Truck size={48} />
        </div>
        <div className={styles.text}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <Link href={link} className={styles.link} style={{ color: textColor }}>
          {linkText}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
