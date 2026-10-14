import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Upload, X, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import CarouselStacked from '../../components/ui/carousel-07';

interface CarouselProduct {
  id: string;
  image: string;
  title: string;
  description: string;
  badge: string;
  link: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const defaultProducts: CarouselProduct[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=750&fit=crop',
    title: 'Urban Style',
    description: 'Modern fashion for the city dweller.',
    badge: 'Trending',
    link: '/products?category=urban',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
];

export default function CarouselProducts() {
  const [products, setProducts] = useState<CarouselProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/carousel-products');
      setProducts(res.data.data || defaultProducts);
    } catch {
      setProducts(defaultProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/carousel-products/${editingProduct.id}`, formData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
        toast.success('Product updated');
      } else {
        const res = await api.post('/carousel-products', formData);
        const newProduct = res.data.data || { ...formData, id: Date.now().toString(), createdAt: new Date().toISOString() };
        setProducts([...products, newProduct]);
        toast.success('Product added');
      }
      setShowModal(false);
      resetForm();
    } catch {
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
        toast.success('Product updated');
      } else {
        const newProduct = { ...formData, id: Date.now().toString(), createdAt: new Date().toISOString() };
        setProducts([...products, newProduct]);
        toast.success('Product added');
      }
      setShowModal(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this carousel product?')) return;
    try {
      await api.delete(`/carousel-products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch {
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    }
  };

  const handleToggleActive = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    try {
      await api.put(`/carousel-products/${id}`, { isActive: !product.isActive });
      setProducts(products.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    } catch {
      setProducts(products.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    }
  };

  const handleEdit = (product: CarouselProduct) => {
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
    setShowModal(true);
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
      sortOrder: products.length + 1,
    });
  };

  const openAddModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, sortOrder: products.length + 1 }));
    setShowModal(true);
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.badge.toLowerCase().includes(search.toLowerCase())
  );

  const activeProducts = products.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  const badgeColors: Record<string, string> = {
    Trending: 'bg-blue-100 text-blue-700',
    New: 'bg-green-100 text-green-700',
    Hot: 'bg-red-100 text-red-700',
    Premium: 'bg-purple-100 text-purple-700',
    Popular: 'bg-orange-100 text-orange-700',
    Sale: 'bg-pink-100 text-pink-700',
    Limited: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carousel Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage products displayed in the hero carousel</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Live Preview Section */}
      <div className="card mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Live Preview</h2>
                <p className="text-primary-300 text-sm">This is how your carousel looks on the homepage</p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-primary-300 hover:text-white transition-colors text-sm"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showPreview && (
            <div className="relative">
              {/* Glow rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border border-accent-400/10 animate-[spin_30s_linear_infinite]" />
                <div className="absolute w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full border border-accent-400/10 animate-[spin_25s_linear_infinite_reverse]" />
              </div>
              
              {/* Carousel */}
              <div className="relative z-10 flex justify-center">
                {activeProducts.length > 0 ? (
                  <CarouselStacked 
                    className="w-full max-w-2xl" 
                    autoPlay 
                    interval={1500} 
                  />
                ) : (
                  <div className="text-center py-12 text-primary-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No active products. Add some products to see the preview.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{products.filter(p => p.isActive).length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">{products.filter(p => !p.isActive).length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">In Carousel</p>
          <p className="text-2xl font-bold text-accent-600">{activeProducts.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10"
            />
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {filtered.length} products
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No carousel products found
          </div>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className={`card overflow-hidden group ${!product.isActive ? 'opacity-60' : ''}`}
            >
              <div className="relative aspect-[3/4] bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeColors[product.badge] || 'bg-gray-100 text-gray-700'}`}>
                    {product.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500/90 backdrop-blur-sm text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{product.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(product.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      product.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        product.isActive ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <span>Order: {product.sortOrder}</span>
                  <span>•</span>
                  <span className="truncate">{product.link}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Image URL *
                </label>
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
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setFormData({ ...formData, image: url });
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-3 relative w-full aspect-[3/4] max-h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Collection"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description for the card..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Badge *
                  </label>
                  <select
                    required
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="input-field"
                  >
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Link URL
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/products?category=summer"
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.isActive ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700">Active</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
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
