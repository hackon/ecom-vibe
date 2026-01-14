'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Loader2, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  woodType?: string;
}

interface Facets {
  categories: { name: string; count: number }[];
  woodTypes: { name: string; count: number }[];
  priceRanges: { label: string; min: number; max: number; count: number }[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWoodType, setSelectedWoodType] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedWoodType) params.append('woodType', selectedWoodType);
        if (selectedPriceRange) params.append('priceRange', selectedPriceRange);

        const res = await fetch(`/api/backend/v1/search?${params.toString()}`);
        const data = await res.json();
        
        setProducts(data.results || data.products || []);
        setFacets(data.facets || null);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, selectedCategory, selectedWoodType, selectedPriceRange]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedWoodType(null);
    setSelectedPriceRange(null);
    setCurrentPage(1);
  };

  const activeFilterCount = [selectedCategory, selectedWoodType, selectedPriceRange].filter(Boolean).length;

  // Pagination calculations
  const totalPages = Math.ceil(products.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedWoodType, selectedPriceRange, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${products.length} results for "${query}"`}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'w-64' : 'w-0'} transition-all overflow-hidden`}>
            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              {facets?.categories && facets.categories.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {facets.categories.map((cat) => (
                      <label key={cat.name} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.name}
                          onChange={() => setSelectedCategory(cat.name)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">
                          {cat.name} ({cat.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Wood Types */}
              {facets?.woodTypes && facets.woodTypes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Wood Type</h3>
                  <div className="space-y-2">
                    {facets.woodTypes.map((wood) => (
                      <label key={wood.name} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="woodType"
                          checked={selectedWoodType === wood.name}
                          onChange={() => setSelectedWoodType(wood.name)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">
                          {wood.name} ({wood.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Ranges */}
              {facets?.priceRanges && facets.priceRanges.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {facets.priceRanges.map((range) => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={selectedPriceRange === range.label}
                          onChange={() => setSelectedPriceRange(range.label)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">
                          {range.label} ({range.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-white bg-amber-600 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Clear filters to see more results
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                        color: currentPage === 1 ? '#9ca3af' : '#374151',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Previous
                    </button>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: currentPage === page ? '#f97316' : 'white',
                            color: currentPage === page ? 'white' : '#374151',
                            cursor: 'pointer',
                            fontWeight: currentPage === page ? 'bold' : '500',
                            minWidth: '40px'
                          }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                        color: currentPage === totalPages ? '#9ca3af' : '#374151',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
                  Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length} results
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
