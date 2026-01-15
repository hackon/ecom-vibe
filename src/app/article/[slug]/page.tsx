'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import styles from './article.module.css';

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
}

// Simple markdown-like renderer for basic formatting
function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className={styles.list}>
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className={styles.h3}>
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className={styles.h2}>
          {trimmed.slice(3)}
        </h2>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) inList = true;
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
    }
    // Bullet lists
    else if (trimmed.startsWith('- ')) {
      if (!inList) inList = true;
      listItems.push(trimmed.slice(2));
    }
    // Empty line
    else if (trimmed === '') {
      flushList();
    }
    // Regular paragraph
    else {
      flushList();
      // Handle bold text
      const formatted = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      elements.push(
        <p
          key={index}
          className={styles.paragraph}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    }
  });

  flushList();
  return elements;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/b4f/article/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Article not found');
          } else {
            throw new Error('Failed to load article');
          }
          return;
        }
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <div className={styles.notFound}>
            <h1>Article Not Found</h1>
            <p>{error || 'The article you are looking for does not exist.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{article.title}</h1>
            <div className={styles.meta}>
              <Calendar size={14} />
              <span>Last updated: {formattedDate}</span>
            </div>
          </header>

          <div className={styles.body}>
            {renderContent(article.content)}
          </div>
        </article>
      </div>
    </div>
  );
}
