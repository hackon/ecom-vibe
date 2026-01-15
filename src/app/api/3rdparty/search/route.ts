import { NextResponse } from 'next/server';

const SOLR_URL = process.env.SOLR_URL || 'http://localhost:8983/solr/products';

// Simulate realistic delay like other 3rdparty APIs
async function simulateDelay() {
  await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 60));
}

interface SolrFacetFields {
  category?: (string | number)[];
  woodType?: (string | number)[];
  brand?: (string | number)[];
  material?: (string | number)[];
  grade?: (string | number)[];
  finish?: (string | number)[];
  type?: (string | number)[];
}

interface SolrFacetRanges {
  price?: {
    counts: (string | number)[];
    gap: number;
    start: number;
    end: number;
  };
}

interface SolrHighlighting {
  [docId: string]: {
    name?: string[];
    description?: string[];
  };
}

interface SolrResponse {
  response: {
    numFound: number;
    start: number;
    docs: SolrDocument[];
  };
  facet_counts?: {
    facet_fields?: SolrFacetFields;
    facet_ranges?: SolrFacetRanges;
  };
  highlighting?: SolrHighlighting;
}

interface SolrDocument {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  images: string[];
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

function parseFacetArray(arr: (string | number)[]): { value: string; count: number }[] {
  const result: { value: string; count: number }[] = [];
  for (let i = 0; i < arr.length; i += 2) {
    const value = arr[i] as string;
    const count = arr[i + 1] as number;
    if (count > 0) {
      result.push({ value, count });
    }
  }
  return result;
}

function parsePriceRanges(rangeData: SolrFacetRanges['price']): { value: string; count: number; min: number; max: number }[] {
  if (!rangeData) return [];

  const result: { value: string; count: number; min: number; max: number }[] = [];
  const { counts, gap, start } = rangeData;

  for (let i = 0; i < counts.length; i += 2) {
    const rangeStart = parseFloat(counts[i] as string);
    const count = counts[i + 1] as number;
    if (count > 0) {
      const rangeEnd = rangeStart + gap;
      result.push({
        value: `$${rangeStart} - $${rangeEnd}`,
        count,
        min: rangeStart,
        max: rangeEnd,
      });
    }
  }

  // Add a catch-all for items above the range
  return result;
}

export async function GET(request: Request) {
  await simulateDelay();

  const { searchParams } = new URL(request.url);

  // Build Solr query parameters
  const solrParams = new URLSearchParams();

  // Check for ID or SKU-based lookup (for batch product fetching)
  const ids = searchParams.get('ids');
  const skus = searchParams.get('skus');
  const q = searchParams.get('q');

  if (ids) {
    const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
    if (idList.length > 0) {
      const idQuery = idList.map(id => `"${id}"`).join(' OR ');
      solrParams.set('q', `id:(${idQuery})`);
      solrParams.set('rows', String(idList.length));
    } else {
      solrParams.set('q', '*:*');
    }
  } else if (skus) {
    const skuList = skus.split(',').map(s => s.trim()).filter(Boolean);
    if (skuList.length > 0) {
      const skuQuery = skuList.map(sku => `"${sku}"`).join(' OR ');
      solrParams.set('q', `sku:(${skuQuery})`);
      solrParams.set('rows', String(skuList.length));
    } else {
      solrParams.set('q', '*:*');
    }
  } else if (q && q.trim()) {
    // Use edismax for better relevance
    solrParams.set('defType', 'edismax');
    solrParams.set('q', q);
    solrParams.set('qf', 'name^10 description^3 sku^2 category^2 woodType^2 brand^2 material');
    solrParams.set('pf', 'name^20 description^5'); // Phrase boost
    solrParams.set('mm', '75%'); // Minimum match
  } else {
    solrParams.set('q', '*:*');
  }

  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  solrParams.set('start', String((page - 1) * limit));
  solrParams.set('rows', String(limit));

  // Sorting
  const sort = searchParams.get('sort');
  if (sort) {
    const sortMappings: Record<string, string> = {
      'price_asc': 'price asc',
      'price_desc': 'price desc',
      'name_asc': 'name_sort asc',
      'name_desc': 'name_sort desc',
      'relevance': 'score desc',
    };
    solrParams.set('sort', sortMappings[sort] || 'score desc');
  }

  // Filters - support comma-separated multiple values with OR logic
  const filters: string[] = [];

  // Helper to create OR filter for multiple values
  const addMultiFilter = (field: string, value: string | null) => {
    if (!value) return;
    const values = value.split(',').filter(Boolean);
    if (values.length === 1) {
      filters.push(`${field}:"${values[0]}"`);
    } else if (values.length > 1) {
      const orClause = values.map(v => `"${v}"`).join(' OR ');
      filters.push(`${field}:(${orClause})`);
    }
  };

  addMultiFilter('category', searchParams.get('category'));
  addMultiFilter('woodType', searchParams.get('woodType'));
  addMultiFilter('brand', searchParams.get('brand'));
  addMultiFilter('material', searchParams.get('material'));
  addMultiFilter('grade', searchParams.get('grade'));
  addMultiFilter('finish', searchParams.get('finish'));
  addMultiFilter('type', searchParams.get('type'));

  // Price range filter
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  if (priceMin || priceMax) {
    const min = priceMin || '0';
    const max = priceMax || '*';
    filters.push(`price:[${min} TO ${max}]`);
  }

  // In stock filter
  const inStock = searchParams.get('inStock');
  if (inStock === 'true') {
    filters.push('stock:[1 TO *]');
  }

  // Add filter queries
  filters.forEach(fq => solrParams.append('fq', fq));

  // Enable faceting
  solrParams.set('facet', 'true');
  solrParams.set('facet.mincount', '1');
  solrParams.append('facet.field', 'category');
  solrParams.append('facet.field', 'woodType');
  solrParams.append('facet.field', 'brand');
  solrParams.append('facet.field', 'material');
  solrParams.append('facet.field', 'grade');
  solrParams.append('facet.field', 'finish');
  solrParams.append('facet.field', 'type');

  // Price range facet
  solrParams.set('facet.range', 'price');
  solrParams.set('f.price.facet.range.start', '0');
  solrParams.set('f.price.facet.range.end', '500');
  solrParams.set('f.price.facet.range.gap', '50');

  // Highlighting
  solrParams.set('hl', 'true');
  solrParams.set('hl.fl', 'name,description');
  solrParams.set('hl.simple.pre', '<mark>');
  solrParams.set('hl.simple.post', '</mark>');

  // Response format
  solrParams.set('wt', 'json');

  try {
    const solrResponse = await fetch(`${SOLR_URL}/select?${solrParams.toString()}`);

    if (!solrResponse.ok) {
      throw new Error(`Solr error: ${solrResponse.statusText}`);
    }

    const data: SolrResponse = await solrResponse.json();

    // Transform Solr response to API response
    const products = data.response.docs.map(doc => ({
      id: doc.id,
      sku: doc.sku,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      currency: doc.currency,
      category: doc.category,
      stock: doc.stock,
      images: doc.images || [],
      attributes: {
        woodType: doc.woodType,
        finish: doc.finish,
        dimensions: doc.dimensions,
        grade: doc.grade,
        type: doc.type,
        material: doc.material,
        brand: doc.brand,
        packSize: doc.packSize,
        size: doc.size,
        power: doc.power,
      },
      // Include highlighting if available
      highlighting: data.highlighting?.[doc.id],
    }));

    // Transform facets
    const facetFields = data.facet_counts?.facet_fields || {};
    const facetRanges = data.facet_counts?.facet_ranges || {};

    const facets = {
      category: parseFacetArray(facetFields.category || []),
      woodType: parseFacetArray(facetFields.woodType || []),
      brand: parseFacetArray(facetFields.brand || []),
      material: parseFacetArray(facetFields.material || []),
      grade: parseFacetArray(facetFields.grade || []),
      finish: parseFacetArray(facetFields.finish || []),
      type: parseFacetArray(facetFields.type || []),
      priceRange: parsePriceRanges(facetRanges.price),
    };

    return NextResponse.json({
      source: '3rdparty-search',
      products,
      facets,
      pagination: {
        total: data.response.numFound,
        page,
        limit,
        totalPages: Math.ceil(data.response.numFound / limit),
      },
      query: {
        q: q || '*',
        filters: {
          category: searchParams.get('category'),
          woodType: searchParams.get('woodType'),
          brand: searchParams.get('brand'),
          material: searchParams.get('material'),
          grade: searchParams.get('grade'),
          finish: searchParams.get('finish'),
          type: searchParams.get('type'),
          priceMin: searchParams.get('priceMin'),
          priceMax: searchParams.get('priceMax'),
          inStock: searchParams.get('inStock'),
        },
        sort: sort || 'relevance',
      },
    });
  } catch (error) {
    console.error('Solr search error:', error);

    // Fallback: return error response
    return NextResponse.json(
      {
        source: '3rdparty-search',
        error: 'Search service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

// Autocomplete/suggest endpoint
export async function POST(request: Request) {
  await simulateDelay();

  try {
    const { q } = await request.json();

    if (!q || q.length < 2) {
      return NextResponse.json({
        source: '3rdparty-search',
        suggestions: [],
      });
    }

    const solrParams = new URLSearchParams({
      defType: 'edismax',
      q,
      qf: 'name_autocomplete^10 name^5 sku^3',
      rows: '8',
      fl: 'id,name,category,price',
      wt: 'json',
    });

    const solrResponse = await fetch(`${SOLR_URL}/select?${solrParams.toString()}`);

    if (!solrResponse.ok) {
      throw new Error(`Solr error: ${solrResponse.statusText}`);
    }

    const data: SolrResponse = await solrResponse.json();

    const suggestions = data.response.docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      category: doc.category,
      price: doc.price,
    }));

    return NextResponse.json({
      source: '3rdparty-search',
      suggestions,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      {
        source: '3rdparty-search',
        error: 'Autocomplete service unavailable',
        suggestions: [],
      },
      { status: 503 }
    );
  }
}
