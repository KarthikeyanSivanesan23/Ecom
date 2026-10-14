import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Package, Heart, MapPin, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function AccountPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/auth/me', form);
      if (user) updateUser({ ...user, ...form });
      toast.success('Profile updated');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', passwordForm);
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to change password'); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package, link: '/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, link: '/wishlist' },
    { id: 'password', label: 'Change Password', icon: Lock },
  ];

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-1">
          {tabs.map(tab => (
            tab.link ? (
              <Link key={tab.id} to={tab.link} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                <tab.icon className="w-5 h-5" /> {tab.label}
              </Link>
            ) : (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left ${activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
            )
          ))}
        </div>
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="card p-6 space-y-4 max-w-lg">
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          )}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="card p-6 space-y-4 max-w-lg">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input-field" minLength={8} required /></div>
              <button type="submit" className="btn-primary">Change Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
