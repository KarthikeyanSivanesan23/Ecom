import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/Skeleton';
import { Product } from '../types';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) { setLoading(false); return; }
    const search = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}&limit=40`);
        setProducts(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    search();
  }, [query]);

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
      {query && <p className="text-gray-500 mb-6">{loading ? 'Searching...' : `${products.length} results for "${query}"`}</p>}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">{[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-500 text-lg">No products found for "{query}"</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
