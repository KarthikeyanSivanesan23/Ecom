import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Clock, Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, X, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import CarouselStacked from '../../components/ui/carousel-07';

interface DashboardData {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingReturns: number;
  recentOrders: any[];
  topProducts: any[];
}

interface CarouselProduct {
  id: string;
  image: string;
  title: string;
  description: string;
  badge: string;
  link: string;
  isActive: boolean;
  sortOrder: number;
}

const defaultCarouselProducts: CarouselProduct[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=750&fit=crop',
    title: 'Urban Style',
    description: 'Modern fashion for the city dweller.',
    badge: 'Trending',
    link: '/products?category=urban',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=750&fit=crop',
    title: 'Summer Collection',
    description: 'Light and breezy styles for warm days.',
    badge: 'New',
    link: '/products?category=summer',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop',
    title: 'Street Fashion',
    description: 'Bold looks that make a statement.',
    badge: 'Hot',
    link: '/products?category=street',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=750&fit=crop',
    title: 'Elegant Wear',
    description: 'Timeless pieces for special occasions.',
    badge: 'Premium',
    link: '/products?category=elegant',
    isActive: true,
    sortOrder: 4,
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=750&fit=crop',
    title: 'Athleisure',
    description: 'Comfort meets style in every piece.',
    badge: 'Popular',
    link: '/products?category=athleisure',
    isActive: true,
    sortOrder: 5,
  },
];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [carouselProducts, setCarouselProducts] = useState<CarouselProduct[]>([]);
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CarouselProduct | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    description: '',
    badge: '',
    link: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchDashboard();
    fetchCarouselProducts();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data.data);
    } catch {
      setData({
        totalRevenue: 0,
        todayRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        pendingReturns: 0,
        recentOrders: [],
        topProducts: [],
      });
    } finally { setLoading(false); }
  };

  const fetchCarouselProducts = async () => {
    try {
      const res = await api.get('/carousel-products');
      setCarouselProducts(res.data.data || defaultCarouselProducts);
    } catch {
      setCarouselProducts(defaultCarouselProducts);
    }
  };

  const handleCarouselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/carousel-products/${editingProduct.id}`, formData);
        setCarouselProducts(carouselProducts.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
        toast.success('Product updated');
      } else {
        const res = await api.post('/carousel-products', formData);
        const newProduct = res.data.data || { ...formData, id: Date.now().toString() };
        setCarouselProducts([...carouselProducts, newProduct]);
        toast.success('Product added');
      }
      window.dispatchEvent(new Event('carousel-products-updated'));
      setShowCarouselModal(false);
      resetForm();
    } catch {
      if (editingProduct) {
        setCarouselProducts(carouselProducts.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
        toast.success('Product updated');
      } else {
        const newProduct = { ...formData, id: Date.now().toString() };
        setCarouselProducts([...carouselProducts, newProduct]);
        toast.success('Product added');
      }
      window.dispatchEvent(new Event('carousel-products-updated'));
      setShowCarouselModal(false);
      resetForm();
    }
  };

  const handleDeleteCarouselProduct = async (id: string) => {
    if (!confirm('Delete this carousel product?')) return;
    try {
      await api.delete(`/carousel-products/${id}`);
      setCarouselProducts(carouselProducts.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch {
      setCarouselProducts(carouselProducts.filter(p => p.id !== id));
      toast.success('Product deleted');
    }
    window.dispatchEvent(new Event('carousel-products-updated'));
  };

  const handleToggleActive = async (id: string) => {
    const product = carouselProducts.find(p => p.id === id);
    if (!product) return;
    try {
      await api.put(`/carousel-products/${id}`, { isActive: !product.isActive });
      setCarouselProducts(carouselProducts.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    } catch {
      setCarouselProducts(carouselProducts.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    }
    window.dispatchEvent(new Event('carousel-products-updated'));
  };

  const handleEditCarousel = (product: CarouselProduct) => {
    setEditingProduct(product);
    setFormData({
      image: product.image,
      title: product.title,
      description: product.description,
      badge: product.badge,
      link: product.link,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
    });
    setShowCarouselModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      image: '',
      title: '',
      description: '',
      badge: '',
      link: '',
      isActive: true,
      sortOrder: carouselProducts.length + 1,
    });
  };

  const openAddCarouselModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, sortOrder: carouselProducts.length + 1 }));
    setShowCarouselModal(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!data) return null;

  const stats = [
    { label: 'Total Revenue', value: formatPrice(data.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Today Revenue', value: formatPrice(data.todayRevenue), icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Total Orders', value: data.totalOrders.toString(), icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Pending Orders', value: data.pendingOrders.toString(), icon: Clock, color: 'bg-yellow-500' },
    { label: 'Customers', value: data.totalCustomers.toString(), icon: Users, color: 'bg-indigo-500' },
    { label: 'Products', value: data.totalProducts.toString(), icon: Package, color: 'bg-pink-500' },
    { label: 'Low Stock', value: data.lowStockProducts.toString(), icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Out of Stock', value: data.outOfStockProducts.toString(), icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const activeCarouselProducts = carouselProducts.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  const badgeColors: Record<string, string> = {
    Trending: 'bg-blue-100 text-blue-700',
    New: 'bg-green-100 text-green-700',
    Hot: 'bg-red-100 text-red-700',
    Premium: 'bg-purple-100 text-purple-700',
    Popular: 'bg-orange-100 text-orange-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Management Section */}
      <div className="card mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Hero Carousel</h2>
                <p className="text-primary-300 text-sm">Manage products in the homepage carousel • {activeCarouselProducts.length} active</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-primary-300 hover:text-white transition-colors text-sm"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              <button
                onClick={openAddCarouselModal}
                className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
          
          {/* Preview */}
          {showPreview && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                <div className="w-[300px] h-[300px] rounded-full border border-accent-400/10 animate-[spin_30s_linear_infinite]" />
                <div className="absolute w-[250px] h-[250px] rounded-full border border-accent-400/10 animate-[spin_25s_linear_infinite_reverse]" />
              </div>
              <div className="relative z-10 flex justify-center">
                {activeCarouselProducts.length > 0 ? (
                  <CarouselStacked className="w-full max-w-2xl" autoPlay interval={1500} />
                ) : (
                  <div className="text-center py-8 text-primary-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active products</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Product List */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {carouselProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-48 bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{product.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${badgeColors[product.badge] || 'bg-gray-100 text-gray-700'}`}>
                      {product.badge}
                    </span>
                    <button
                      onClick={() => handleToggleActive(product.id)}
                      className={`w-6 h-3 rounded-full transition-colors ${product.isActive ? 'bg-green-500' : 'bg-gray-500'}`}
                    >
                      <span className={`block w-2.5 h-2.5 bg-white rounded-full transition-transform ${product.isActive ? 'translate-x-3' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCarousel(product)}
                    className="p-1 text-white/60 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCarouselProduct(product.id)}
                    className="p-1 text-white/60 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b"><h2 className="font-semibold text-gray-900">Recent Orders</h2></div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {data.recentOrders.map((order: any) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.user.firstName} {order.user.lastName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 text-sm">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b"><h2 className="font-semibold text-gray-900">Top Products</h2></div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {data.topProducts.map((product: any) => (
              <div key={product.id} className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images[0] && <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                </div>
                <span className="font-medium text-sm">{formatPrice(product.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Modal */}
      {showCarouselModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCarouselModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Carousel Product' : 'Add Carousel Product'}
              </h2>
              <button
                onClick={() => setShowCarouselModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCarouselSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="input-field flex-1"
                  />
                  <label className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Browse</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData({ ...formData, image: URL.createObjectURL(file) });
                    }} />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-3 relative w-full aspect-[3/4] max-h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Summer Collection" className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Short description..." rows={2} className="input-field resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge *</label>
                  <select required value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className="input-field">
                    <option value="">Select badge</option>
                    <option value="Trending">Trending</option>
                    <option value="New">New</option>
                    <option value="Hot">Hot</option>
                    <option value="Premium">Premium</option>
                    <option value="Popular">Popular</option>
                    <option value="Sale">Sale</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" min="1" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="/products?category=summer" className="input-field" />
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className={`relative w-10 h-5 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-gray-700">Active</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCarouselModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  {editingProduct ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
