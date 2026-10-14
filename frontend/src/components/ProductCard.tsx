import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, calculateDiscount } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const primaryImage = product.images.find(i => i.isPrimary) || product.images[0];
  const discount = calculateDiscount(product.mrp, product.price);

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login'); return; }
    try {
      await api.post(`/wishlist/${product.id}`);
      toast.success('Added to wishlist');
    } catch { toast.error('Failed to add to wishlist'); }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, undefined, 1);
      toast.success('Added to cart');
    } catch { toast.error('Failed to add to cart'); }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Link
        to={`/products/${product.slug || product.id}`}
        className="group block bg-white border border-primary-100 rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-500"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100">
          {primaryImage ? (
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-400">
              <Eye className="w-12 h-12" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {discount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg"
            >
              -{discount}%
            </motion.span>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToWishlist}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all duration-200"
            >
              <Heart className="w-4 h-4 text-primary-600 hover:text-red-500 transition-colors" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="p-2.5 bg-accent-500/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-accent-500 transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        <div className="p-5">
          {product.brand && (
            <p className="text-xs font-semibold text-accent-600 uppercase tracking-widest mb-2">
              {product.brand.name}
            </p>
          )}
          <h3 className="text-base font-semibold text-primary-900 mb-2 line-clamp-2 group-hover:text-accent-600 transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-accent-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(product.averageRating) ? 'fill-current' : 'fill-primary-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-primary-400">
              ({product.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary-900">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <span className="text-sm font-medium text-primary-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
