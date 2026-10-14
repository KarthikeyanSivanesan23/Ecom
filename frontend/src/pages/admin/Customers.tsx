import { useState, useEffect } from 'react';
import { Search, Eye, UserCheck, UserX } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/admin/customers${search ? `?search=${search}` : ''}`);
      setCustomers(res.data.data.customers);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/admin/customers/${id}/status`, { isActive: !isActive });
      setCustomers(customers.map(c => c.id === id ? { ...c, isActive: !isActive } : c));
      toast.success('Customer status updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>
      <div className="card mb-6">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()} placeholder="Search customers..." className="input-field pl-10" />
          </div>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Orders</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{customer.firstName} {customer.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(customer.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {customer.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggleStatus(customer.id, customer.isActive)} className="p-1.5 text-gray-500 hover:text-primary-600">
                      {customer.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
