import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, calculateDiscount } from '../utils/helpers';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();

  if (loading) return <div className="container-custom py-16 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></div>;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const totalMrp = items.reduce((sum, item) => {
    const mrp = item.variant?.mrp || item.product.mrp;
    return sum + mrp * item.quantity;
  }, 0);
  const discount = totalMrp - subtotal;
  const shipping = subtotal >= 999 ? 0 : 99;

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items to your cart to see them here.</p>
        <Link to="/products" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const price = item.variant?.price || item.product.price;
            const mrp = item.variant?.mrp || item.product.mrp;
            const img = item.product.images.find(i => i.isPrimary) || item.product.images[0];
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link to={`/products/${item.product.slug || item.product.id}`} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  {img && <img src={img.url} alt={item.product.name} className="w-full h-full object-cover" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.slug || item.product.id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1">{item.product.name}</Link>
                  {item.variant && <p className="text-sm text-gray-500">{item.variant.name}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-gray-900">{formatPrice(price)}</span>
                    {mrp > price && <span className="text-sm text-gray-500 line-through">{formatPrice(mrp)}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(totalMrp)}</span></div>
            <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <hr />
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{formatPrice(subtotal + shipping)}</span></div>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-6 text-center block">Proceed to Checkout</Link>
          <Link to="/products" className="btn-outline w-full mt-3 text-center block text-sm">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}