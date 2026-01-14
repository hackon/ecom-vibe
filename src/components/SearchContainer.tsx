'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import SearchDrawer from './SearchDrawer';

export default function SearchContainer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
