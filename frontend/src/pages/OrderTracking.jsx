import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Truck, CheckCircle2, Circle, Clock, Info } from 'lucide-react';

const OrderTracking = ({ orderId, setOrderId }) => {
  const { token, showToast } = useApp();
  const [searchId, setSearchId] = useState(orderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderTracking = async (idToSearch) => {
    if (!idToSearch) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${idToSearch}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        showToast(data.message || 'Order ID not found.', 'error');
        setOrder(null);
      }
    } catch (error) {
      console.error(error);
      showToast('Error tracking order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderTracking(orderId);
      setSearchId(orderId);
    }
  }, [orderId]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!searchId) {
      showToast('Please enter an Order ID.', 'error');
      return;
    }
    setOrderId(searchId);
    fetchOrderTracking(searchId);
  };

  // Stepper mapping
  const statuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const getStatusIndex = (currentStatus) => statuses.indexOf(currentStatus);

  // Estimated delivery helper
  const getEstimatedTime = (createdAt) => {
    const created = new Date(createdAt);
    const est = new Date(created.getTime() + 30 * 60 * 1000); // 30 mins
    return est.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Track Order</h1>
        <p className="text-slate-400 text-sm">Monitor delivery routes and estimated dispatch schedules in real time</p>
      </div>

      {/* Order Search Input */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. 64f1234b5a2e...)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.trim())}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-xs shadow btn-scale shrink-0"
          >
            {loading ? 'Searching...' : 'Track Delivery'}
          </button>
        </form>
      </div>

      {/* Stepper Details */}
      {order && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order Reference</p>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white font-mono mt-0.5">{order._id}</h2>
            </div>
            
            {order.status !== 'Delivered' && (
              <div className="flex items-center gap-2 p-3 bg-secondary/15 rounded-2xl text-secondary-dark dark:text-secondary">
                <Clock className="h-5 w-5 animate-pulse" />
                <div className="text-xs">
                  <p className="font-bold">Estimated Delivery</p>
                  <p className="font-medium mt-0.5">{getEstimatedTime(order.createdAt)} (in 30 mins)</p>
                </div>
              </div>
            )}
          </div>

          {/* Graphical Stepper */}
          <div className="py-6 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] px-4">
              {statuses.map((step, idx) => {
                const currentIdx = getStatusIndex(order.status);
                const isCompleted = idx <= currentIdx;
                const isActive = idx === currentIdx;

                return (
                  <React.Fragment key={step}>
                    {/* Step circle */}
                    <div className="flex flex-col items-center relative z-10 select-none">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive
                            ? 'border-primary bg-primary text-white dark:border-secondary dark:bg-secondary dark:text-slate-900 animate-pulse'
                            : isCompleted
                            ? 'border-primary bg-primary/10 text-primary dark:border-secondary dark:bg-secondary/10 dark:text-secondary'
                            : 'border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
                      </div>
                      <span className={`text-[10px] font-bold mt-2 whitespace-nowrap ${isActive ? 'text-primary dark:text-secondary font-extrabold' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>

                    {/* Step connecting line */}
                    {idx < statuses.length - 1 && (
                      <div className="flex-grow h-1.5 bg-slate-100 dark:bg-slate-700 mx-2 rounded-full relative overflow-hidden min-w-[50px]">
                        <div
                          className={`absolute top-0 left-0 h-full bg-primary dark:bg-secondary transition-all duration-500`}
                          style={{ width: idx < currentIdx ? '100%' : idx === currentIdx ? '50%' : '0%' }}
                        ></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            
            {/* Delivery Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-700 pb-1.5 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Shipping Information
              </h3>
              <div className="text-xs text-slate-500 space-y-2">
                <p><span className="font-semibold text-slate-400 uppercase">Street:</span> {order.address.street}</p>
                <p><span className="font-semibold text-slate-400 uppercase">City:</span> {order.address.city}, {order.address.state} - {order.address.zip}</p>
                <p><span className="font-semibold text-slate-400 uppercase">Payment Channel:</span> {order.paymentMethod} ({order.paymentStatus})</p>
              </div>
            </div>

            {/* Price Detail */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-700 pb-1.5 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Delivery Status Details
              </h3>
              <div className="text-xs text-slate-500 space-y-2">
                <p><span className="font-semibold text-slate-400 uppercase">Order Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                <p><span className="font-semibold text-slate-400 uppercase">Current Stage:</span> {order.status}</p>
                <p><span className="font-semibold text-slate-400 uppercase">Order Value:</span> ₹{order.totalAmount.toFixed(2)} (GST included: ₹{order.gst.toFixed(2)})</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Informative instructions if no order is searched */}
      {!order && (
        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-start gap-3 border border-slate-100 dark:border-slate-700">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed">
            <h4 className="font-bold text-slate-700 dark:text-white mb-1">How order tracking works</h4>
            <p>Once you check out successfully, an automated tracking sequence launches. The order updates from Placed, to Confirmed (our pharmacist approves the item/prescription), Packed, Shipped, Out for Delivery, and finally Delivered. Find your Order IDs inside your personal profile dashboard.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderTracking;
