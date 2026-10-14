import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import { Address } from '../types';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home', firstName: user?.firstName || '', lastName: user?.lastName || '', phone: '',
    address1: '', address2: '', city: '', state: '', pincode: '', country: 'India',
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        setAddresses(res.data.data);
        const defaultAddr = res.data.data.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
        else if (res.data.data.length > 0) setSelectedAddress(res.data.data[0].id);
      } catch { /* ignore */ }
    };
    fetchAddresses();
  }, []);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.variant?.price || item.product.price) * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = ((subtotal - couponDiscount) * 18) / 100;
  const total = subtotal - couponDiscount + shipping + tax;

  const handleAddAddress = async () => {
    try {
      const res = await api.post('/addresses', newAddress);
      setAddresses([...addresses, res.data.data]);
      setSelectedAddress(res.data.data.id);
      setShowNewAddress(false);
      toast.success('Address added');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setCouponDiscount(res.data.data.discount);
      toast.success(`Coupon applied! You save ${formatPrice(res.data.data.discount)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select an address'); return; }
    setLoading(true);
    try {
      const orderRes = await api.post('/orders', { addressId: selectedAddress, paymentMethod, couponCode: couponCode || undefined });
      const order = orderRes.data.data;

      if (paymentMethod === 'RAZORPAY') {
        const paymentRes = await api.post('/payments/create-order', { orderId: order.id });
        const { orderId, amount, currency, key } = paymentRes.data.data;

        const options = {
          key, amount, currency, order_id: orderId,
          handler: async (response: any) => {
            try {
              await api.post('/payments/verify', { ...response, orderId: order.id });
              toast.success('Payment successful!');
              navigate(`/orders/${order.id}`);
            } catch { toast.error('Payment verification failed'); }
          },
          prefill: { name: `${user?.firstName} ${user?.lastName}`, email: user?.email },
          theme: { color: '#2563eb' },
        };
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        toast.success('Order placed successfully!');
        navigate(`/orders/${order.id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const steps = [
    { icon: MapPin, label: 'Address' },
    { icon: Truck, label: 'Delivery' },
    { icon: CreditCard, label: 'Payment' },
  ];

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-green-600' : step === i + 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > i + 1 ? 'bg-green-100' : step === i + 1 ? 'bg-primary-100' : 'bg-gray-100'}`}>
                {step > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-16 sm:w-24 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-200' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Address</h2>
              {addresses.map(addr => (
                <label key={addr.id} className={`card p-4 flex items-start gap-3 cursor-pointer ${selectedAddress === addr.id ? 'border-primary-600 ring-2 ring-primary-100' : ''}`}>
                  <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">{addr.label} {addr.isDefault && <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded ml-2">Default</span>}</p>
                    <p className="text-sm text-gray-600">{addr.firstName} {addr.lastName}, {addr.address1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-sm text-gray-500">Phone: {addr.phone}</p>
                  </div>
                </label>
              ))}
              {!showNewAddress ? (
                <button onClick={() => setShowNewAddress(true)} className="btn-outline text-sm w-full">+ Add New Address</button>
              ) : (
                <div className="card p-4 space-y-3">
                  <h3 className="font-medium">New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Label (Home/Office)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="input-field py-2 text-sm" />
                    <input placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="input-field py-2 text-sm" />
                    <input placeholder="Address Line 1" value={newAddress.address1} onChange={(e) => setNewAddress({ ...newAddress, address1: e.target.value })} className="input-field py-2 text-sm col-span-2" />
                    <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="input-field py-2 text-sm" />
                    <input placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="input-field py-2 text-sm" />
                    <input placeholder="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="input-field py-2 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddAddress} className="btn-primary text-sm py-2">Save Address</button>
                    <button onClick={() => setShowNewAddress(false)} className="btn-outline text-sm py-2">Cancel</button>
                  </div>
                </div>
              )}
              <button onClick={() => selectedAddress && setStep(2)} disabled={!selectedAddress} className="btn-primary">Continue</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Delivery Options</h2>
              <div className="card p-4 border-primary-600 ring-2 ring-primary-100">
                <p className="font-medium">Standard Delivery</p>
                <p className="text-sm text-gray-500">3-5 business days • {shipping === 0 ? 'Free' : formatPrice(shipping)}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary">Continue</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              {['RAZORPAY', 'COD'].map(method => (
                <label key={method} className={`card p-4 flex items-center gap-3 cursor-pointer ${paymentMethod === method ? 'border-primary-600 ring-2 ring-primary-100' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="text-primary-600" />
                  <span className="font-medium">{method === 'RAZORPAY' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}</span>
                </label>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary">
                  {loading ? 'Placing Order...' : `Place Order • ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-3 text-sm">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.product.images[0] && <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 line-clamp-1">{item.product.name}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium">{formatPrice((item.variant?.price || item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex gap-2">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="input-field py-2 text-sm flex-1" />
              <button onClick={handleApplyCoupon} className="btn-outline text-sm py-2 px-4">Apply</button>
            </div>
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-{formatPrice(couponDiscount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>{formatPrice(tax)}</span></div>
            <hr />
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
