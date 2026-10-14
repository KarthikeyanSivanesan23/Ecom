import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, X, Tag, Truck, BarChart3, Bell, Palette } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Inventory', path: '/admin/inventory', icon: Truck },
  { name: 'NODA Production', path: '/admin/noda', icon: Palette },
  { name: 'NODA Inventory', path: '/admin/noda/inventory', icon: Package },
  { name: 'Coupons', path: '/admin/coupons', icon: Tag },
  { name: 'Banners', path: '/admin/banners', icon: Bell },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: Props) {
  const location = useLocation();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold">Admin</span>
          </Link>
          <button onClick={onClose} className="lg:hidden"><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={onClose} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}