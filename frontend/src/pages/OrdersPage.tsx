import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../utils/api';
import { Order } from '../types';
import { formatPrice, getStatusColor, formatDate } from '../utils/helpers';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="container-custom py-16 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></div>;

  if (orders.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
        <Link to="/products" className="btn-primary inline-block mt-4">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/orders/${order.id}`} className="card p-4 sm:p-6 hover:shadow-md transition-shadow block">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-medium text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                  <div className="w-full h-full bg-gray-200" />
                </div>
              ))}
              {order.items.length > 3 && <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
              <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
