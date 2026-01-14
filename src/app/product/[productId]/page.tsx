'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart, ArrowLeft, Loader2 } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <Link href="/" className="text-amber-600 hover:text-amber-700">
          Return to home
        </Link>
      </div>
    );
  }

  const images = product.images || (product.imageUrl ? [product.imageUrl] : []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-amber-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {product.category && (
                <p className="text-sm text-amber-600 font-medium mb-2 uppercase tracking-wide">
                  {product.category}
                </p>
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {product.sku && (
                <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
              )}

              {product.price !== undefined && (
                <div className="mb-6">
                  <span className="text-4xl font-bold text-amber-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-gray-500 ml-2">per unit</span>
                </div>
              )}

              {product.description && (
                <p className="text-gray-700 mb-6">
                  {product.description}
                </p>
              )}

              {product.woodType && (
                <div className="mb-4">
                  <span className="font-semibold text-gray-900">Wood Type:</span>
                  <span className="text-gray-700 ml-2">{product.woodType}</span>
                </div>
              )}

              {product.dimensions && (
                <div className="mb-4">
                  <span className="font-semibold text-gray-900">Dimensions:</span>
                  <span className="text-gray-700 ml-2">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                  </span>
                </div>
              )}

              {product.stock !== undefined && (
                <div className="mb-6">
                  <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-8">
                <button className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
                <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-amber-600 hover:text-amber-600 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>
                  <dl className="grid grid-cols-1 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex">
                        <dt className="font-medium text-gray-900 w-1/3">{key}:</dt>
                        <dd className="text-gray-700">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Long Description */}
              {product.longDescription && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">
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
