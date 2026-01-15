'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Loader2, SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import styles from './search.module.css';

interface ProductAttributes {
  woodType?: string;
  finish?: string;
  dimensions?: string;
  grade?: string;
  type?: string;
  material?: string;
  brand?: string;
  packSize?: string;
  size?: string;
  power?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  attributes?: ProductAttributes;
  stock?: number;
  images?: string[];
  highlighting?: {
    name?: string[];
    description?: string[];
  };
}

interface FacetValue {
  value: string;
  count: number;
}

interface PriceRangeValue extends FacetValue {
  min: number;
  max: number;
}

interface Facets {
  category: FacetValue[];
  woodType: FacetValue[];
  brand: FacetValue[];
  material: FacetValue[];
  grade: FacetValue[];
  finish: FacetValue[];
  type: FacetValue[];
  priceRange: PriceRangeValue[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper to parse comma-separated URL params into array
function parseMultiParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').filter(Boolean);
}

// Helper to serialize array to comma-separated string
function serializeMultiParam(values: string[]): string | null {
  if (values.length === 0) return null;
  return values.join(',');
}

// Collapsible filter section component
function FilterSection({
  title,
  children,
  defaultOpen = true
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.filterSection}>
      <button
        className={styles.filterSectionHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.filterSectionTitle}>{title}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className={styles.filterSectionContent}>{children}</div>}
    </div>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read all filter state from URL (now supporting multiple values)
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category');
  const woodTypeParam = searchParams.get('woodType');
  const brandParam = searchParams.get('brand');
  const materialParam = searchParams.get('material');
  const gradeParam = searchParams.get('grade');
  const priceMinParam = searchParams.get('priceMin');
  const priceMaxParam = searchParams.get('priceMax');
  const pageParam = searchParams.get('page');

  // Memoize parsed arrays to prevent infinite re-renders
  const selectedCategories = useMemo(() => parseMultiParam(categoryParam), [categoryParam]);
  const selectedWoodTypes = useMemo(() => parseMultiParam(woodTypeParam), [woodTypeParam]);
  const selectedBrands = useMemo(() => parseMultiParam(brandParam), [brandParam]);
  const selectedMaterials = useMemo(() => parseMultiParam(materialParam), [materialParam]);
  const selectedGrades = useMemo(() => parseMultiParam(gradeParam), [gradeParam]);
  const selectedPriceRange = useMemo(() =>
    priceMinParam && priceMaxParam
      ? { min: parseInt(priceMinParam), max: parseInt(priceMaxParam) }
      : null,
    [priceMinParam, priceMaxParam]
  );
  const currentPage = useMemo(() => parseInt(pageParam || '1'), [pageParam]);

  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const resultsPerPage = 20;

  // Update URL with new params
  const updateUrl = useCallback((updates: Record<string, string | null>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    if (resetPage && !('page' in updates)) {
      params.delete('page');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Toggle a value in a multi-select filter
  const toggleFilter = useCallback((key: string, value: string, currentValues: string[]) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateUrl({ [key]: serializeMultiParam(newValues) });
  }, [updateUrl]);

  const setSelectedPriceRange = useCallback((value: { min: number; max: number } | null) => {
    if (value) {
      updateUrl({ priceMin: value.min.toString(), priceMax: value.max.toString() });
    } else {
      updateUrl({ priceMin: null, priceMax: null });
    }
  }, [updateUrl]);

  const setCurrentPage = useCallback((page: number | ((p: number) => number)) => {
    const newPage = typeof page === 'function' ? page(currentPage) : page;
    updateUrl({ page: newPage > 1 ? newPage.toString() : null }, false);
  }, [updateUrl, currentPage]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        params.append('page', pageParam || '1');
        params.append('limit', resultsPerPage.toString());

        // Support multiple values per filter - use raw params directly
        if (categoryParam) params.append('category', categoryParam);
        if (woodTypeParam) params.append('woodType', woodTypeParam);
        if (brandParam) params.append('brand', brandParam);
        if (materialParam) params.append('material', materialParam);
        if (gradeParam) params.append('grade', gradeParam);
        if (priceMinParam) params.append('priceMin', priceMinParam);
        if (priceMaxParam) params.append('priceMax', priceMaxParam);

        const res = await fetch(`/api/backend/v1/search?${params.toString()}`);
        const data = await res.json();

        if (data.error) {
          console.error('Search error:', data.error);
          setProducts([]);
          setFacets(null);
          setPagination(null);
        } else {
          setProducts(data.products || []);
          setFacets(data.facets || null);
          setPagination(data.pagination || null);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, categoryParam, woodTypeParam, brandParam, materialParam, gradeParam, priceMinParam, priceMaxParam, pageParam]);

  const clearFilters = useCallback(() => {
    updateUrl({
      q: null,
      category: null,
      woodType: null,
      brand: null,
      material: null,
      grade: null,
      priceMin: null,
      priceMax: null,
    });
  }, [updateUrl]);

  const clearQuery = useCallback(() => {
    updateUrl({ q: null });
  }, [updateUrl]);

  const activeFilterCount = [
    query ? 'query' : null,
    ...selectedCategories,
    ...selectedWoodTypes,
    ...selectedBrands,
    ...selectedMaterials,
    ...selectedGrades,
    selectedPriceRange ? 'price' : null
  ].filter(Boolean).length;

  const totalPages = pagination?.totalPages || 1;
  const totalResults = pagination?.total || products.length;

  // Collect all active filters for display
  const activeFilters: { key: string; value: string; label: string }[] = [
    ...(query ? [{ key: 'q', value: query, label: `"${query}"` }] : []),
    ...selectedCategories.map(v => ({ key: 'category', value: v, label: v })),
    ...selectedWoodTypes.map(v => ({ key: 'woodType', value: v, label: v })),
    ...selectedBrands.map(v => ({ key: 'brand', value: v, label: v })),
    ...selectedMaterials.map(v => ({ key: 'material', value: v, label: v })),
    ...selectedGrades.map(v => ({ key: 'grade', value: v, label: v })),
    ...(selectedPriceRange ? [{ key: 'price', value: 'price', label: `$${selectedPriceRange.min} - $${selectedPriceRange.max}` }] : []),
  ];

  const removeFilter = (key: string, value: string) => {
    if (key === 'q') {
      clearQuery();
    } else if (key === 'price') {
      setSelectedPriceRange(null);
    } else {
      const currentValues = {
        category: selectedCategories,
        woodType: selectedWoodTypes,
        brand: selectedBrands,
        material: selectedMaterials,
        grade: selectedGrades,
      }[key] || [];
      toggleFilter(key, value, currentValues);
    }
  };

  return (
    <div className={styles.searchPage}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            <SlidersHorizontal size={18} />
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className={styles.clearAllButton}>
              Clear all
            </button>
          )}
        </div>

        <div className={styles.filtersList}>
          {/* Search Query */}
          <FilterSection title="Search Query">
            <div className={styles.queryInputWrapper}>
              <Search size={16} className={styles.queryInputIcon} />
              <input
                type="text"
                defaultValue={query}
                placeholder="Search products..."
                className={styles.queryInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    updateUrl({ q: value || null });
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value !== query) {
                    updateUrl({ q: value || null });
                  }
                }}
              />
              {query && (
                <button
                  className={styles.queryInputClear}
                  onClick={clearQuery}
                  type="button"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </FilterSection>

          {/* Categories */}
          {facets?.category && facets.category.length > 0 && (
            <FilterSection title="Category">
              {facets.category.map((cat) => (
                <label key={cat.value} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.value)}
                    onChange={() => toggleFilter('category', cat.value, selectedCategories)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>{cat.value}</span>
                  <span className={styles.facetCount}>{cat.count}</span>
                </label>
              ))}
            </FilterSection>
          )}

          {/* Wood Types */}
          {facets?.woodType && facets.woodType.length > 0 && (
            <FilterSection title="Wood Type">
              <div className={styles.scrollableList}>
                {facets.woodType.map((wood) => (
                  <label key={wood.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedWoodTypes.includes(wood.value)}
                      onChange={() => toggleFilter('woodType', wood.value, selectedWoodTypes)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{wood.value}</span>
                    <span className={styles.facetCount}>{wood.count}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Brands */}
          {facets?.brand && facets.brand.length > 0 && (
            <FilterSection title="Brand">
              <div className={styles.scrollableList}>
                {facets.brand.map((brand) => (
                  <label key={brand.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.value)}
                      onChange={() => toggleFilter('brand', brand.value, selectedBrands)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{brand.value}</span>
                    <span className={styles.facetCount}>{brand.count}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Materials */}
          {facets?.material && facets.material.length > 0 && (
            <FilterSection title="Material" defaultOpen={false}>
              <div className={styles.scrollableList}>
                {facets.material.map((mat) => (
                  <label key={mat.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(mat.value)}
                      onChange={() => toggleFilter('material', mat.value, selectedMaterials)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{mat.value}</span>
                    <span className={styles.facetCount}>{mat.count}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Grades */}
          {facets?.grade && facets.grade.length > 0 && (
            <FilterSection title="Grade" defaultOpen={false}>
              {facets.grade.map((grade) => (
                <label key={grade.value} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedGrades.includes(grade.value)}
                    onChange={() => toggleFilter('grade', grade.value, selectedGrades)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>{grade.value}</span>
                  <span className={styles.facetCount}>{grade.count}</span>
                </label>
              ))}
            </FilterSection>
          )}

          {/* Price Range */}
          {facets?.priceRange && facets.priceRange.length > 0 && (
            <FilterSection title="Price Range">
              {facets.priceRange.map((range) => {
                const isSelected = selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max;
                return (
                  <label key={range.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => setSelectedPriceRange(isSelected ? null : { min: range.min, max: range.max })}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{range.value}</span>
                    <span className={styles.facetCount}>{range.count}</span>
                  </label>
                );
              })}
            </FilterSection>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <div className={styles.resultsHeader}>
          <div className={styles.resultsInfo}>
            <h1 className={styles.resultsTitle}>
              {query ? `Results for "${query}"` : 'All Products'}
            </h1>
            <p className={styles.resultsCount}>
              {loading ? 'Searching...' : `${totalResults} products found`}
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={styles.toggleFiltersButton}
          >
            <SlidersHorizontal size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {activeFilterCount > 0 && (
              <span className={styles.filterBadge}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className={styles.activeFilters}>
            {activeFilters.map((filter, idx) => (
              <button
                key={`${filter.key}-${filter.value}-${idx}`}
                className={styles.activeFilterTag}
                onClick={() => removeFilter(filter.key, filter.value)}
              >
                {filter.label}
                <X size={14} />
              </button>
            ))}
            <button onClick={clearFilters} className={styles.clearFiltersButton}>
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={48} />
            <p>Searching products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No products found</p>
            <p className={styles.emptyText}>Try adjusting your filters or search terms</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className={styles.clearFiltersButtonLarge}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  category={product.category}
                  woodType={product.attributes?.woodType}
                  imageUrl={product.images?.[0]}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>

                <div className={styles.paginationNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                    .map((page, idx, arr) => (
                      <span key={page} className={styles.paginationItem}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className={styles.paginationEllipsis}>...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`${styles.paginationNumber} ${currentPage === page ? styles.paginationNumberActive : ''}`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}

            <div className={styles.paginationInfo}>
              Showing {((currentPage - 1) * resultsPerPage) + 1}-{Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} products
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
