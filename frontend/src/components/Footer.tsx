import { Link } from 'react-router-dom';
import { Heart, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from './Animated';

export default function Footer() {
  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="bg-gradient-to-b from-primary-900 to-primary-950 text-primary-300">
      <div className="container-premium py-16">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-gold">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-display font-bold text-white">ShopHub</span>
              </div>
              <p className="text-sm text-primary-400 leading-relaxed">
                Your premium destination for quality products. Curated collections for the modern lifestyle.
              </p>
              <div className="flex gap-4 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-primary-800/50 flex items-center justify-center text-primary-400 hover:bg-accent-500/20 hover:text-accent-400 transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Shop</h3>
              <div className="space-y-3 text-sm">
                {[
                  { to: '/products', label: 'All Products' },
                  { to: '/products?sort=newest', label: 'New Arrivals' },
                  { to: '/products?sort=popular', label: 'Best Sellers' },
                  { to: '/products?sort=price_asc', label: 'Sale' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block text-primary-400 hover:text-accent-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Account</h3>
              <div className="space-y-3 text-sm">
                {[
                  { to: '/account', label: 'My Account' },
                  { to: '/orders', label: 'Orders' },
                  { to: '/wishlist', label: 'Wishlist' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block text-primary-400 hover:text-accent-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Support</h3>
              <div className="space-y-3 text-sm">
                {[
                  { href: '#', label: 'Contact Us' },
                  { href: '#', label: 'FAQs' },
                  { href: '#', label: 'Shipping' },
                  { href: '#', label: 'Returns' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-primary-400 hover:text-accent-400 transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="border-t border-primary-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-500">
            &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
          </p>
          <p className="text-sm text-primary-500 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for premium shoppers
          </p>
        </div>
      </div>
    </footer>
  );
}
