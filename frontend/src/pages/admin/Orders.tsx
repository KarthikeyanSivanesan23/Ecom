import { useState, useEffect } from 'react';
import { Search, ChevronDown, Eye } from 'lucide-react';
import api from '../../utils/api';
import { Order } from '../../types';
import { formatPrice, getStatusColor, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/orders/admin/all?${params.toString()}`);
      setOrders(res.data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (orderId: string, status: string, trackingNumber?: string) => {
    setUpdating(true);
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status, trackingNumber });
      toast.success('Order status updated');
      fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update'); } finally { setUpdating(false); }
  };

  const statuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      <div className="card mb-6">
        <div className="p-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchOrders()} placeholder="Search orders..." className="input-field pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{order.user?.firstName} {order.user?.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span></td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-gray-500 hover:text-primary-600"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Order {selectedOrder.orderNumber}</h2>
            <div className="space-y-3 text-sm mb-6">
              <p><span className="text-gray-500">Customer:</span> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
              <p><span className="text-gray-500">Total:</span> {formatPrice(selectedOrder.total)}</p>
              <p><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
              <div className="border-t pt-3">
                <p className="font-medium mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(s => (
                    <button key={s} onClick={() => handleStatusUpdate(selectedOrder.id, s)} disabled={updating || s === selectedOrder.status} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${s === selectedOrder.status ? 'bg-primary-50 border-primary-300 text-primary-700' : 'hover:bg-gray-50'}`}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="btn-outline w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
