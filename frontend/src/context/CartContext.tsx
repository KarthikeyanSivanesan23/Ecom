import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { Cart } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const refreshCart = async () => {
    await fetchCart();
  };

  const addToCart = async (productId: string, variantId?: string, quantity = 1) => {
    try {
      await api.post('/cart/items', { productId, variantId: variantId || null, quantity });
      await fetchCart();
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await api.put(`/cart/items/${itemId}`, { quantity });
      await fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    }
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
