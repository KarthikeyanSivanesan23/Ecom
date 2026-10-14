import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export default function AdminDemo() {
  const [enabled, setEnabled] = useState(false);
  const navigate = useNavigate();

  const handleEnableDemo = () => {
    localStorage.setItem('demoAdmin', 'true');
    setEnabled(true);
    setTimeout(() => {
      navigate('/admin/carousel');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-accent-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Demo Access</h1>
        <p className="text-gray-500 mb-6">
          Enable demo mode to access the admin panel without login. 
          This is for testing purposes only.
        </p>
        {enabled ? (
          <div className="bg-green-50 text-green-700 py-3 px-4 rounded-lg font-medium">
            Demo mode enabled! Redirecting...
          </div>
        ) : (
          <button
            onClick={handleEnableDemo}
            className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Enable Demo Mode
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
        <p className="text-xs text-gray-400 mt-4">
          Or go to <a href="/login" className="text-accent-600 hover:underline">/login</a> with admin credentials
        </p>
      </div>
    </div>
  );
}
