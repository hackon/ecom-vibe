'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchBar from './SearchBar';
import SearchDrawer from './SearchDrawer';

export default function SearchContainer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if we're on the search page with a query
  const isOnSearchPage = pathname === '/search';
  const pageQuery = searchParams.get('q');
  const hasSearchQuery = isOnSearchPage && pageQuery;

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Clear the search bar when navigating to search page with a query
  useEffect(() => {
    if (hasSearchQuery) {
      setSearchQuery('');
      setDebouncedQuery('');
    }
  }, [hasSearchQuery]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedQuery(query);
      }, 500);
    } else {
      setDebouncedQuery('');
    }
  }, []);

  const handleFocus = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleEnter = useCallback(() => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsDrawerOpen(false);
    }
  }, [searchQuery, router]);

  const handleProductSelect = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <>
      <SearchBar
        onSearchChange={handleSearchChange}
        onFocus={handleFocus}
        onEnter={handleEnter}
        value={searchQuery}
      />
      <SearchDrawer
        isOpen={isDrawerOpen}
        searchQuery={debouncedQuery}
        onClose={handleCloseDrawer}
        onProductSelect={handleProductSelect}
      />
    </>
  );
}
