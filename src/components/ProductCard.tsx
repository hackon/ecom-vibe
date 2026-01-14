import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  woodType?: string;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  category,
  woodType,
}: ProductCardProps) {
  return (
    <Link
      href={`/product/${id}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-amber-500 transition-all"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      
      <div className="p-4">
        {category && (
          <p className="text-xs text-amber-600 font-medium mb-1 uppercase tracking-wide">
            {category}
          </p>
        )}
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
          {name}
        </h3>
        
        {woodType && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Wood:</span> {woodType}
          </p>
        )}
        
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {description}
          </p>
        )}
        
        {price !== undefined && (
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">
              ${price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">per unit</span>
          </div>
        )}
      </div>
    </Link>
  );
}
