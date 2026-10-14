import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Star } from 'lucide-react';
import api from '../utils/api';
import { Product, ProductVariant } from '../types';
import { formatPrice, calculateDiscount } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const COLOUR_DOT: Record<string, string> = {
  Black: 'bg-gray-900',
  White: 'bg-gray-100 border',
  Red: 'bg-red-600',
};

const COLOUR_HEX: Record<string, string> = {
  Black: '#1a1a1a',
  White: '#f5f5f5',
  Red: '#dc2626',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // NODA selection state
  const [selectedArtwork, setSelectedArtwork] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  // Check if this is a NODA product (variants have artwork attributes)
  const isNoda = product?.variants?.some(v => {
    const attrs = (v as any).attributes;
    return attrs?.artwork || (v as any).artworkId;
  }) ?? false;

  // Extract unique artworks, colours, sizes from NODA variants
  const nodaData = useMemo(() => {
    if (!isNoda || !product) return null;
    const artworks = new Map<string, { code: string; name: string; id: string }>();
    const colours = new Set<string>();
    const sizes = new Set<string>();

    product.variants.forEach(v => {
      const attrs = (v as any).attributes;
      if (attrs?.artwork) {
        artworks.set(attrs.artwork, { code: attrs.artwork, name: attrs.artwork, id: (v as any).artworkId || attrs.artwork });
        colours.add(attrs.colour);
        sizes.add(attrs.size);
      }
    });

    return {
      artworks: Array.from(artworks.values()).sort((a, b) => a.code.localeCompare(b.code)),
      colours: Array.from(colours),
      sizes: Array.from(sizes),
    };
  }, [isNoda, product]);

  // Auto-select first artwork if none selected
  useEffect(() => {
    if (nodaData && nodaData.artworks.length > 0 && !selectedArtwork) {
      setSelectedArtwork(nodaData.artworks[0].code);
    }
  }, [nodaData, selectedArtwork]);

  // Find the matching variant based on selections
  const nodaVariant = useMemo(() => {
    if (!isNoda || !product || !selectedArtwork || !selectedColour || !selectedSize) return null;
    return product.variants.find(v => {
      const attrs = (v as any).attributes;
      return attrs?.artwork === selectedArtwork && attrs?.colour === selectedColour && attrs?.size === selectedSize;
    }) ?? null;
  }, [isNoda, product, selectedArtwork, selectedColour, selectedSize]);

  // Set selected variant for NODA
  useEffect(() => {
    if (nodaVariant) {
      setSelectedVariant(nodaVariant.id);
    }
  }, [nodaVariant]);

  if (loading) return <div className="container-custom py-16 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></div>;
  if (!product) return <div className="container-custom py-16 text-center text-gray-500">Product not found</div>;

  const variant = product.variants.find(v => v.id === selectedVariant);
  const currentPrice = variant?.price || product.price;
  const currentMrp = variant?.mrp || product.mrp;
  const discount = calculateDiscount(currentMrp, currentPrice);
  const inStock = variant ? variant.stock > 0 : true;

  // Check if a specific combination is in stock
  const getCombinationStock = (artwork: string, colour: string, size: string): number => {
    if (!product) return 0;
    const v = product.variants.find(v => {
      const attrs = (v as any).attributes;
      return attrs?.artwork === artwork && attrs?.colour === colour && attrs?.size === size;
    });
    return v?.stock ?? 0;
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product.id, selectedVariant || undefined, quantity);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      await api.post(`/wishlist/${product.id}`);
      toast.success('Added to wishlist');
    } catch { toast.error('Failed to add to wishlist'); }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
            {nodaVariant ? (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: COLOUR_HEX[selectedColour] || '#f5f5f5' }}>
                <div className="text-center p-8">
                  <div className="text-6xl font-bold text-white/90 mb-2 drop-shadow-lg">{selectedArtwork}</div>
                  <div className="text-2xl text-white/70">{selectedColour} / {selectedSize}</div>
                </div>
              </div>
            ) : product.images[selectedImage] ? (
              <img src={product.images[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          {product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${selectedImage === i ? 'border-primary-600' : 'border-transparent'}`}>
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand && <p className="text-sm text-primary-600 font-medium mb-2">{product.brand.name}</p>}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`} />)}
              <span className="text-sm text-gray-600 ml-1">{product.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
            <span className="text-sm text-gray-500">SKU: {variant?.sku || product.sku}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-gray-500 line-through">{formatPrice(currentMrp)}</span>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">{discount}% off</span>
              </>
            )}
          </div>

          {/* NODA Variant Selection */}
          {isNoda && nodaData && (
            <div className="space-y-5 mb-6">
              {/* Artwork Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Select Artwork ({nodaData.artworks.length} designs)</h3>
                <div className="grid grid-cols-5 gap-2">
                  {nodaData.artworks.map(art => {
                    const isSelected = selectedArtwork === art.code;
                    const totalStock = nodaData.colours.reduce((sum, c) =>
                      sum + nodaData.sizes.reduce((s2, sz) => s2 + getCombinationStock(art.code, c, sz), 0), 0);
                    return (
                      <button key={art.code} onClick={() => { setSelectedArtwork(art.code); setSelectedColour(''); setSelectedSize(''); setSelectedVariant(null); }}
                        className={`relative px-3 py-2 rounded-lg border text-xs font-medium transition-all ${isSelected ? 'border-primary-600 bg-primary-50 text-primary-600 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-400 text-gray-700'}`}>
                        <div className="font-bold">{art.code}</div>
                        {totalStock === 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colour Selection */}
              {selectedArtwork && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Select Colour</h3>
                  <div className="flex gap-3">
                    {nodaData.colours.map(colour => {
                      const isSelected = selectedColour === colour;
                      const stock = nodaData.sizes.reduce((sum, sz) => sum + getCombinationStock(selectedArtwork, colour, sz), 0);
                      return (
                        <button key={colour} onClick={() => { setSelectedColour(colour); setSelectedSize(''); setSelectedVariant(null); }}
                          disabled={stock === 0}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${isSelected ? 'border-primary-600 bg-primary-50 text-primary-600 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-400 text-gray-700'} ${stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                          <span className={`w-4 h-4 rounded-full ${COLOUR_DOT[colour]}`} />
                          {colour} <span className="text-xs text-gray-500">({stock})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {selectedArtwork && selectedColour && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
                  <div className="flex gap-2">
                    {nodaData.sizes.map(size => {
                      const stock = getCombinationStock(selectedArtwork, selectedColour, size);
                      const isSelected = selectedSize === size;
                      return (
                        <button key={size} onClick={() => { setSelectedSize(size); setSelectedVariant(null); }}
                          disabled={stock === 0}
                          className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all min-w-[80px] ${isSelected ? 'border-primary-600 bg-primary-50 text-primary-600 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-400 text-gray-700'} ${stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                          {size}
                          {stock > 0 && stock <= 3 && <div className="text-xs text-amber-600">Only {stock} left</div>}
                          {stock === 0 && <div className="text-xs text-red-500">Sold out</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected SKU display */}
              {nodaVariant && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Selected:</span>
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{nodaVariant.sku}</span>
                  <span className={`text-xs font-medium ${nodaVariant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {nodaVariant.stock > 0 ? `${nodaVariant.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Non-NODA: flat variant list */}
          {!isNoda && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Variant</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button key={v.id} onClick={() => setSelectedVariant(v.id)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedVariant === v.id ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-gray-300 hover:border-gray-400'}`}>
                    {v.name} {v.stock === 0 && <span className="text-red-500">(Out of stock)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={!inStock} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
              <ShoppingCart className="w-5 h-5" /> {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button onClick={handleWishlist} className="px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            {[
              { icon: Truck, text: 'Free shipping on orders over ₹999' },
              { icon: RotateCcw, text: '30-day easy returns' },
              { icon: Shield, text: 'Genuine product guarantee' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <item.icon className="w-5 h-5 text-primary-600" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="flex gap-8 border-b">
          {(['description', 'specifications', 'reviews'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab} {tab === 'reviews' && `(${product.reviewCount})`}
            </button>
          ))}
        </div>
        <div className="py-6">
          {activeTab === 'description' && <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />}
          {activeTab === 'specifications' && product.specifications && (
            <table className="w-full"><tbody>
              {product.specifications.map(spec => (
                <tr key={spec.id} className="border-b"><td className="py-3 text-gray-500 w-48">{spec.name}</td><td className="py-3 text-gray-900">{spec.value}</td></tr>
              ))}
            </tbody></table>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {product.reviews?.length === 0 ? <p className="text-gray-500">No reviews yet</p> : product.reviews?.map(review => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-gray-300'}`} />)}</div>
                    <span className="font-medium text-gray-900">{review.user.firstName}</span>
                    {review.isVerified && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">Verified Purchase</span>}
                  </div>
                  {review.title && <p className="font-medium text-gray-900 mb-1">{review.title}</p>}
                  {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}