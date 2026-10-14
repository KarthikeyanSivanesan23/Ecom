import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-primary-900/20 backdrop-blur-md border-b border-white/10'
          : 'glass-premium shadow-premium'
      }`}
    >
      <div className="container-premium">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isTransparent
                  ? 'bg-white/10 group-hover:bg-white/20'
                  : 'bg-gradient-to-br from-accent-500 to-accent-600 shadow-gold group-hover:shadow-gold-lg'
              }`}
            >
              <span className={`font-bold text-xl ${isTransparent ? 'text-white' : 'text-white'}`}>S</span>
            </motion.div>
            <span className={`text-2xl font-display font-bold hidden sm:block transition-colors ${
              isTransparent ? 'text-white' : 'text-primary-900'
            }`}>ShopHub</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className={`w-full pl-5 pr-14 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all duration-300 ${
                  isTransparent
                    ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:ring-white/30'
                    : 'bg-primary-100 border border-transparent text-primary-900 placeholder-primary-400 focus:bg-white focus:ring-accent-400 shadow-sm focus:shadow-md'
                }`}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                  isTransparent
                    ? 'text-white/60 hover:text-white hover:bg-white/10'
                    : 'text-primary-400 hover:text-accent-600 hover:bg-accent-50'
                }`}
              >
                <Search className="w-5 h-5" />
              </motion.button>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/wishlist" className={`p-2.5 rounded-xl transition-all duration-300 hidden sm:block ${
                isTransparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-primary-600 hover:text-accent-600 hover:bg-accent-50'
              }`}>
                <Heart className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
              <Link to="/cart" className={`p-2.5 rounded-xl transition-all duration-300 ${
                isTransparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-primary-600 hover:text-accent-600 hover:bg-accent-50'
              }`}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-gold"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all duration-300 ${
                    isTransparent
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-primary-600 hover:text-accent-600 hover:bg-accent-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isTransparent
                      ? 'bg-white/15 group-hover:bg-white/25'
                      : 'bg-gradient-to-br from-primary-100 to-primary-200 group-hover:from-accent-50 group-hover:to-accent-100'
                  }`}>
                    <span className={`font-semibold text-sm ${
                      isTransparent ? 'text-white' : 'text-primary-700'
                    }`}>
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 hidden sm:block transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 glass-premium rounded-2xl shadow-premium-lg border border-white/10 py-2 z-50"
                    >
                      <div className="px-5 py-3 border-b border-white/10">
                        <p className="font-semibold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-primary-300">{user.email}</p>
                      </div>
                      {[
                        { to: '/account', label: 'My Account' },
                        { to: '/orders', label: 'My Orders' },
                        { to: '/wishlist', label: 'Wishlist' },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-5 py-2.5 text-primary-200 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-5 py-2.5 text-primary-200 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-5 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className={`flex items-center gap-2 text-sm py-2.5 px-5 rounded-xl font-semibold transition-all duration-300 ${
                  isTransparent
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    : 'btn-premium'
                }`}>
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-xl lg:hidden transition-all duration-300 ${
                isTransparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-primary-600 hover:text-accent-600 hover:bg-accent-50'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`hidden lg:flex items-center gap-8 py-3 transition-all duration-300 ${
            isTransparent ? 'border-t border-white/10' : 'border-t border-primary-100'
          }`}
        >
          {['New Arrivals', 'Men', 'Women', 'Electronics', 'Home', 'Sports'].map((cat) => (
            <motion.div key={cat} whileHover={{ y: -2 }}>
              <Link
                to={`/products?category=${cat.toLowerCase()}`}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  isTransparent
                    ? 'text-white/60 hover:text-white'
                    : 'text-primary-500 hover:text-accent-600'
                }`}
              >
                {cat}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-500 to-accent-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass-premium border-t border-white/10"
          >
            <div className="p-5">
              <form onSubmit={handleSearch} className="mb-5">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-5 pr-14 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
              {['New Arrivals', 'Men', 'Women', 'Electronics', 'Home', 'Sports'].map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${cat.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-primary-200 hover:text-accent-400 font-medium border-b border-white/10 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
