import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Ticket } from 'lucide-react';

const Cart = ({ setCurrentPage, setCheckoutDetails }) => {
  const { cart, updateCartQty, removeFromCart, showToast } = useApp();
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const cartItems = cart?.items || [];

  // Calculate pricing breakdown
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.medicineId?.price || 0;
    return sum + (price * item.qty);
  }, 0);

  // GST calculations: 18% on devices, 12% on medicines/others
  const gst = cartItems.reduce((sum, item) => {
    const price = item.medicineId?.price || 0;
    const category = item.medicineId?.category || '';
    const rate = category === 'Devices' ? 0.18 : 0.12;
    return sum + (price * item.qty * rate);
  }, 0);

  // Delivery charge: free above ₹499, else ₹40
  const deliveryCharge = (subtotal === 0 || subtotal > 499) ? 0 : 40;

  // Coupon discount logic
  const discountAmount = subtotal * (discountPercent / 100);

  // Final Total
  const total = subtotal + gst + deliveryCharge - discountAmount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'MEDCARE30') {
      setDiscountPercent(10);
      setAppliedCoupon('MEDCARE30');
      showToast('Coupon code MEDCARE30 applied! 10% discount subtracted.', 'success');
    } else {
      showToast('Invalid coupon code.', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setAppliedCoupon('');
    setCoupon('');
    showToast('Coupon code removed.', 'info');
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Your shopping cart is empty.', 'warning');
      return;
    }

    // Save final details in parent state to load on checkout page
    setCheckoutDetails({
      items: cartItems.map(item => ({
        medicineId: item.medicineId?._id,
        name: item.medicineId?.name,
        price: item.medicineId?.price,
        mrp: item.medicineId?.mrp,
        qty: item.qty,
        rxRequired: item.medicineId?.rxRequired
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      deliveryCharge,
      couponCode: appliedCoupon,
      discount: Math.round(discountAmount * 100) / 100,
      totalAmount: Math.round(total * 100) / 100,
      rxRequired: cartItems.some(item => item.medicineId?.rxRequired)
    });

    setCurrentPage('checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center space-y-6">
        <span className="text-6xl block animate-bounce">🛒</span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-slate-400 text-sm">Browse our medicine vault or health monitors to find remedies for you and your family.</p>
        <button
          onClick={() => setCurrentPage('shop')}
          className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-xs shadow btn-scale"
        >
          Browse Medicines Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="text-left space-y-1 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Shopping Cart</h1>
        <p className="text-slate-400 text-sm">Review your selected healthcare items before checking out</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden text-left">
            <div className="hidden sm:grid grid-cols-12 p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-6">Medicine Detail</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-1 text-right">Remove</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {cartItems.map((item) => {
                const med = item.medicineId;
                if (!med) return null;

                return (
                  <div key={item._id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center cart-item-animate">
                    
                    {/* Item visual */}
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border dark:border-slate-800">
                        <img src={med.image} alt={med.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{med.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">{med.brand} | {med.category}</p>
                        {med.rxRequired && (
                          <span className="inline-flex mt-1 text-[8px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                            Rx Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2 text-left sm:text-center">
                      <span className="sm:hidden text-xs font-bold text-slate-400 uppercase mr-1">Price:</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-white">₹{med.price}</span>
                      {med.discount > 0 && (
                        <span className="block text-[10px] text-slate-400 line-through">₹{med.mrp}</span>
                      )}
                    </div>

                    {/* Qty count control */}
                    <div className="col-span-3 flex justify-start sm:justify-center items-center">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 scale-90">
                        <button
                          onClick={() => updateCartQty(item._id, Math.max(item.qty - 1, 1))}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-800 dark:text-white">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item._id, item.qty + 1)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Trash */}
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors inline-flex"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Pricing Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon Entry */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-left">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" /> Apply Coupon
            </h3>
            
            {appliedCoupon ? (
              <div className="flex justify-between items-center bg-secondary/10 border border-secondary/20 p-3 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-secondary-dark dark:text-secondary">Code: {appliedCoupon}</p>
                  <p className="text-[10px] text-slate-400">10% discount subtracted</p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="MEDCARE30"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary uppercase font-semibold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow btn-scale dark:bg-slate-700"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Checkout Totals Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-left space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Price Breakdown</h3>
            
            <div className="space-y-2 text-xs font-medium text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-800 dark:text-slate-200">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>GST Tax (Category rates)</span>
                <span className="text-slate-800 dark:text-slate-200">₹{gst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                {deliveryCharge === 0 ? (
                  <span className="text-secondary font-bold">FREE</span>
                ) : (
                  <span className="text-slate-800 dark:text-slate-200">₹{deliveryCharge.toFixed(2)}</span>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-secondary">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-800 dark:text-white">Order Total</span>
              <span className="text-2xl font-black text-primary dark:text-secondary">₹{total.toFixed(2)}</span>
            </div>

            {subtotal < 499 && (
              <p className="text-[10px] text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg">
                💡 Add ₹{(499 - subtotal).toFixed(2)} more items to qualify for FREE delivery!
              </p>
            )}

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 btn-scale flex justify-center items-center gap-1.5"
            >
              Proceed to Checkout →
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold pt-2">
              <ShieldCheck className="h-4 w-4 text-secondary" /> Safe & Secure Payments
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
