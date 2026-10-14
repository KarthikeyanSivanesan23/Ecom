import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, Edit, X } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  stock: number;
  artwork: { code: string; name: string };
  attributes: { colour: string; size: string; artwork: string };
}

export default function NodaInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [colourFilter, setColourFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editStock, setEditStock] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (colourFilter) params.set('colour', colourFilter);
      if (sizeFilter) params.set('size', sizeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/admin/noda/inventory?${params.toString()}`);
      setItems(res.data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [colourFilter, sizeFilter, statusFilter]);

  const handleSearch = () => {
    fetchItems();
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setEditStock(item.stock.toString());
  };

  const handleUpdateStock = async () => {
    if (!editItem) return;
    const newStock = parseInt(editStock, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid stock number');
      return;
    }
    setUpdating(true);
    try {
      await api.put(`/admin/noda/inventory/${editItem.id}`, { stock: newStock });
      toast.success('Stock updated successfully');
      setEditItem(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', classes: 'bg-red-100 text-red-700' };
    if (stock <= 5) return { label: 'Low Stock', classes: 'bg-yellow-100 text-yellow-700' };
    return { label: 'In Stock', classes: 'bg-green-100 text-green-700' };
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter) {
      const status =
        item.stock === 0 ? 'out_of_stock' : item.stock <= 5 ? 'low_stock' : 'in_stock';
      if (status !== statusFilter) return false;
    }
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NODA Inventory</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by SKU, artwork, or name..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={colourFilter}
            onChange={(e) => setColourFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Colours</option>
            <option value="Black">Black</option>
            <option value="White">White</option>
            <option value="Red">Red</option>
          </select>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Sizes</option>
            <option value="XL">XL</option>
            <option value="L">L</option>
            <option value="Oversized">Oversized</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-44"
          >
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Artwork</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Colour</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Size</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const status = getStockStatus(item.stock);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.artwork.code}</p>
                          <p className="text-xs text-gray-500">{item.artwork.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.sku}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              item.attributes.colour === 'Black'
                                ? 'bg-gray-800'
                                : item.attributes.colour === 'White'
                                ? 'bg-gray-300'
                                : 'bg-red-500'
                            }`}
                          />
                          {item.attributes.colour}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.attributes.size}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                          {item.mrp > item.price && (
                            <p className="text-xs text-gray-400 line-through">{formatPrice(item.mrp)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900">{item.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.classes}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editItem && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setEditItem(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Update Stock</h2>
              <button
                onClick={() => setEditItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">SKU</p>
                <p className="font-medium text-gray-900 font-mono">{editItem.sku}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Product</p>
                <p className="font-medium text-gray-900">{editItem.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditItem(null)} className="btn-outline flex-1">
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={updating}
                className="btn-primary flex-1"
              >
                {updating ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
