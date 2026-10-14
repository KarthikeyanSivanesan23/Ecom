import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, HeadphonesIcon } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/Skeleton';
import { Product, Banner } from '../types';
import { Hero } from '../components/Hero';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/Animated';
import { CardCarousel } from '../components/ui/card-carousel';

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, featuredRes, arrivalsRes, sellersRes] = await Promise.all([
          api.get('/banners'),
          api.get('/products/featured'),
          api.get('/products/new-arrivals'),
          api.get('/products/best-sellers'),
        ]);
        setBanners(bannersRes.data.data);
        setFeaturedProducts(featuredRes.data.data);
        setNewArrivals(arrivalsRes.data.data);
        setBestSellers(sellersRes.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹999', gradient: 'from-accent-500 to-accent-600' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout', gradient: 'from-emerald-500 to-emerald-600' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy', gradient: 'from-blue-500 to-blue-600' },
    { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Dedicated support', gradient: 'from-purple-500 to-purple-600' },
  ];

  const categoryImages = [
    { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=750&fit=crop", alt: "Watches Collection" },
    { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=750&fit=crop", alt: "Sneakers Collection" },
    { src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=750&fit=crop", alt: "Accessories Collection" },
    { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=750&fit=crop", alt: "Headphones Collection" },
    { src: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=750&fit=crop", alt: "Sunglasses Collection" },
    { src: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=750&fit=crop", alt: "Fashion Collection" },
  ];

  return (
    <div className="bg-primary-50">
      <Hero />

      <section className="container-premium py-12">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((item, i) => (
            <StaggerItem key={i}>
              <div className="group relative bg-white rounded-2xl p-6 shadow-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary-900 mb-1 group-hover:text-white transition-colors">{item.title}</h3>
                  <p className="text-sm text-primary-500 group-hover:text-white/80 transition-colors">{item.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="container-premium py-12">
        <AnimatedSection>
          <CardCarousel
            images={categoryImages}
            autoplayDelay={3000}
            showPagination={true}
            showNavigation={true}
          />
        </AnimatedSection>
      </section>

      <section className="container-premium py-12">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">Featured Products</h2>
              <p className="section-subheading">Handpicked for you</p>
            </div>
            <Link
              to="/products?isFeatured=true"
              className="group flex items-center gap-2 text-accent-600 hover:text-accent-700 font-semibold transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.map(p => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))
          }
        </StaggerContainer>
      </section>

      <section className="container-premium py-12">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">New Arrivals</h2>
              <p className="section-subheading">Fresh styles just dropped</p>
            </div>
            <Link
              to="/products?isNewArrival=true"
              className="group flex items-center gap-2 text-accent-600 hover:text-accent-700 font-semibold transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map(p => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))
          }
        </StaggerContainer>
      </section>

      <section className="container-premium py-12">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">Best Sellers</h2>
              <p className="section-subheading">Customer favorites</p>
            </div>
            <Link
              to="/products?isBestSeller=true"
              className="group flex items-center gap-2 text-accent-600 hover:text-accent-700 font-semibold transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.map(p => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))
          }
        </StaggerContainer>
      </section>

      <section className="container-premium py-16">
        <AnimatedSection>
          <div className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 rounded-3xl overflow-hidden shadow-premium-lg">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d97706%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
            <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-primary-300 mb-8 max-w-xl mx-auto text-lg">
                Get the latest updates on new products and upcoming sales. Be the first to know.
              </p>
              <div className="flex max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-l-xl text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
                <button className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-8 py-4 rounded-r-xl font-semibold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-gold hover:shadow-gold-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
