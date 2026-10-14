import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface Props {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: Props) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:text-gray-700 relative">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 hidden sm:block">View Store</Link>
      </div>
    </header>
  );
}