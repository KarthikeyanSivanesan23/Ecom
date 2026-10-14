import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../utils/api';
import { Order } from '../types';
import { formatPrice, getStatusColor, formatDate } from '../utils/helpers';

const statusSteps = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="container-custom py-16 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></div>;
  if (!order) return <div className="container-custom py-16 text-center text-gray-500">Order not found</div>;

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/orders" className="hover:text-primary-600">Orders</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{order.orderNumber}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900">Order {order.orderNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
            </div>

            <div className="flex items-center justify-between mb-8">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center ${i <= currentStep ? 'text-primary-600' : 'text-gray-300'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      {i < currentStep ? <CheckCircle className="w-5 h-5" /> : i === currentStep ? <Clock className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">{step.replace(/_/g, ' ')}</span>
                  </div>
                  {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-primary-200' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gray-200" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.trackingNumber && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Tracking Information</h2>
              <p className="text-sm text-gray-600">Tracking Number: <span className="font-medium">{order.trackingNumber}</span></p>
              {order.shippingCarrier && <p className="text-sm text-gray-600">Carrier: {order.shippingCarrier}</p>}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>{formatPrice(order.tax)}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{formatPrice(order.couponDiscount)}</span></div>}
              <hr />
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Shipping Address</h2>
            <p className="text-sm text-gray-600">{order.address.firstName} {order.address.lastName}</p>
            <p className="text-sm text-gray-600">{order.address.address1}</p>
            <p className="text-sm text-gray-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Payment</h2>
            <p className="text-sm text-gray-600">Method: {order.paymentMethod}</p>
            <p className="text-sm">Status: <span className={`font-medium ${getStatusColor(order.paymentStatus)} px-2 py-0.5 rounded text-xs`}>{order.paymentStatus}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
