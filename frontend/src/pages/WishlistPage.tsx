import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import api from '../utils/api';
import { WishlistItem } from '../types';
import { formatPrice, calculateDiscount } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/wishlist');
        setItems(res.data.data.items);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems(items.filter(i => i.productId !== productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    await addToCart(item.productId);
    await handleRemove(item.productId);
  };

  if (loading) return <div className="container-custom py-16 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></div>;

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
        <Link to="/products" className="btn-primary inline-block mt-4">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map(item => {
          const img = item.product.images.find(i => i.isPrimary) || item.product.images[0];
          const discount = calculateDiscount(item.product.mrp, item.product.price);
          return (
            <div key={item.id} className="card overflow-hidden group">
              <Link to={`/products/${item.product.slug || item.product.id}`} className="aspect-square bg-gray-50 block overflow-hidden">
                {img && <img src={img.url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
              </Link>
              <div className="p-4">
                <Link to={`/products/${item.product.slug || item.product.id}`} className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-primary-600 block mb-1">{item.product.name}</Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-gray-900">{formatPrice(item.product.price)}</span>
                  {discount > 0 && <span className="text-sm text-gray-500 line-through">{formatPrice(item.product.mrp)}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleMoveToCart(item)} className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1"><ShoppingCart className="w-4 h-4" /> Move to Cart</button>
                  <button onClick={() => handleRemove(item.productId)} className="p-2 border rounded-lg hover:bg-red-50 hover:border-red-200"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
