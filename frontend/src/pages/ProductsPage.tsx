import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/Skeleton';
import { Product, Category, Brand } from '../types';
import { formatPrice } from '../utils/helpers';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState(4);

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '20');
        if (sort) params.set('sort', sort);
        if (category) params.set('category', category);
        if (brand) params.set('brand', brand);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (rating) params.set('rating', rating);
        if (search) params.set('search', search);

        const [productsRes, catsRes, brandsRes] = await Promise.all([
          api.get(`/products?${params.toString()}`),
          api.get('/categories'),
          api.get('/brands'),
        ]);
        setProducts(productsRes.data.data);
        setTotal(productsRes.data.pagination?.total || 0);
        setCategories(catsRes.data.data);
        setBrands(brandsRes.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchData();
  }, [page, sort, category, brand, minPrice, maxPrice, rating, search]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Best Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn-outline text-sm py-2 px-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="input-field py-2 text-sm w-48">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="hidden md:flex items-center gap-1 border rounded-lg p-1">
            <button onClick={() => setGridCols(3)} className={`p-1.5 rounded ${gridCols === 3 ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setGridCols(4)} className={`p-1.5 rounded ${gridCols === 4 ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {showFilters && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowFilters(false)} />}

      <div className="flex gap-8">
        <aside className={`${showFilters ? 'fixed inset-y-0 left-0 z-50 w-80 bg-white p-6 overflow-y-auto shadow-xl' : 'hidden'} lg:block lg:static lg:w-64 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" checked={category === cat.id} onChange={() => updateParam('category', category === cat.id ? '' : cat.id)} className="text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                    {cat._count && <span className="text-xs text-gray-400">({cat._count.products})</span>}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map(b => (
                  <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="brand" checked={brand === b.id} onChange={() => updateParam('brand', brand === b.id ? '' : b.id)} className="text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} className="input-field py-2 text-sm" />
                <span className="text-gray-400">-</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} className="input-field py-2 text-sm" />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2, 1].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rating" checked={rating === r.toString()} onChange={() => updateParam('rating', rating === r.toString() ? '' : r.toString())} className="text-primary-600 focus:ring-primary-500" />
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <svg key={i} className={`w-4 h-4 ${i < r ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                    <span className="text-sm text-gray-600">& up</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={clearFilters} className="w-full btn-outline text-sm py-2">Clear All Filters</button>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 sm:gap-6`}>
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found</p>
              <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 sm:gap-6`}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => updateParam('page', p.toString())} className={`w-10 h-10 rounded-lg font-medium text-sm ${page === p ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}