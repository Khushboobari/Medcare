import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, FileText, UploadCloud, RefreshCw, CreditCard, Landmark, CheckCircle } from 'lucide-react';

const Checkout = ({ details, setOrderId, setCurrentPage }) => {
  const { token, user, clearCartLocally, showToast, updateLocalUser } = useApp();
  const [loading, setLoading] = useState(false);

  // Address states
  const [addressIndex, setAddressIndex] = useState(0); // 0, 1 etc, or 'new'
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Prescription states (if Rx required)
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState('');
  const [prescriptionId, setPrescriptionId] = useState('');
  const [uploadingRx, setUploadingRx] = useState(false);
  const [doctorName, setDoctorName] = useState('');

  // Select historical prescription option
  const [selectedRxOption, setSelectedRxOption] = useState('upload'); // upload | select
  const [selectedOldRxId, setSelectedOldRxId] = useState('');

  const savedAddresses = user?.addresses || [];
  const rxRequired = details?.rxRequired || false;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Please sign in to complete purchase.', 'warning');
      setCurrentPage('auth');
      return;
    }

    // Determine target shipping address
    let shippingAddress = null;
    if (addressIndex === 'new') {
      if (!newStreet || !newCity || !newState || !newZip) {
        showToast('Please fill all delivery address details.', 'error');
        return;
      }
      shippingAddress = { street: newStreet, city: newCity, state: newState, zip: newZip };
    } else {
      const saved = savedAddresses[addressIndex];
      if (!saved) {
        showToast('Please select or add a delivery address.', 'error');
        return;
      }
      shippingAddress = { street: saved.street, city: saved.city, state: saved.state, zip: saved.zip };
    }

    // Payment validation
    if (paymentMethod === 'UPI' && !upiId) {
      showToast('Please enter your UPI ID (e.g. user@okaxis).', 'error');
      return;
    }
    if (paymentMethod === 'Card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      showToast('Please fill all Card credentials.', 'error');
      return;
    }

    let finalPrescriptionId = null;

    // Upload prescription first if required
    if (rxRequired) {
      if (selectedRxOption === 'select') {
        if (!selectedOldRxId) {
          showToast('Please select an existing verified prescription.', 'error');
          return;
        }
        finalPrescriptionId = selectedOldRxId;
      } else {
        if (!prescriptionFile) {
          showToast('A doctor prescription file is required for Rx medicines.', 'error');
          return;
        }

        setUploadingRx(true);
        const formData = new FormData();
        formData.append('prescription', prescriptionFile);
        formData.append('doctorName', doctorName || 'Self/Unknown');

        try {
          const rxRes = await fetch('/api/prescriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
          const rxData = await rxRes.json();
          if (rxData.success) {
            finalPrescriptionId = rxData.prescription._id;
          } else {
            showToast('Prescription upload failed. Try again.', 'error');
            setUploadingRx(false);
            return;
          }
        } catch (error) {
          console.error(error);
          showToast('Error uploading prescription.', 'error');
          setUploadingRx(false);
          return;
        }
        setUploadingRx(false);
      }
    }

    // Place Order API Call
    setLoading(true);
    try {
      const orderPayload = {
        items: details.items,
        totalAmount: details.totalAmount,
        deliveryCharge: details.deliveryCharge,
        gst: details.gst,
        couponCode: details.couponCode,
        discount: details.discount,
        address: shippingAddress,
        paymentMethod,
        prescriptionId: finalPrescriptionId
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        // Save new address into user profile if it was added as new
        if (addressIndex === 'new') {
          const updatedAddresses = [...savedAddresses, shippingAddress];
          try {
            await fetch('/api/auth/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ addresses: updatedAddresses })
            });
            // Update context state
            const meRes = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
            const meData = await meRes.json();
            if (meData.success) updateLocalUser(meData.user);
          } catch (addrErr) {
            console.error("Failed to save new address to profile:", addrErr);
          }
        }

        showToast('Order placed successfully!', 'success');
        clearCartLocally();
        setOrderId(data.order._id);
        setCurrentPage('tracking');
      } else {
        showToast(data.message || 'Failed to place order.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Checkout failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!details) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <span className="text-5xl">⚠️</span>
        <h2 className="text-xl font-bold">No active checkout session found</h2>
        <button onClick={() => setCurrentPage('cart')} className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold">
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="text-left space-y-1 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Checkout</h1>
        <p className="text-slate-400 text-sm">Specify delivery address and select payment channels to order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Side: Address, Rx Upload, and Payment Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Address form block */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">1. Delivery Address</h2>
            
            {/* Select address option */}
            {savedAddresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setAddressIndex(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors relative ${addressIndex === idx ? 'border-primary bg-primary/5 dark:border-secondary dark:bg-secondary/5' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700'}`}
                  >
                    {addressIndex === idx && (
                      <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary dark:text-secondary fill-current bg-white dark:bg-slate-800 rounded-full" />
                    )}
                    <p className="text-xs font-bold text-slate-400 uppercase">Address Option {idx + 1}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200 mt-2 font-medium leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                    </p>
                  </div>
                ))}
                
                <div
                  onClick={() => setAddressIndex('new')}
                  className={`p-4 rounded-xl border border-dashed cursor-pointer transition-colors text-center flex flex-col justify-center items-center ${addressIndex === 'new' ? 'border-primary bg-primary/5 text-primary dark:border-secondary dark:bg-secondary/5 dark:text-secondary' : 'border-slate-300 hover:bg-slate-50 text-slate-500'}`}
                >
                  <span className="text-sm font-bold">+ Deliver to New Address</span>
                </div>
              </div>
            )}

            {/* Input new address if requested or no saved exists */}
            {(savedAddresses.length === 0 || addressIndex === 'new') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Health Ave, Phase 1"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Pincode / ZIP</label>
                  <input
                    type="text"
                    required
                    placeholder="560001"
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rx Prescription Upload (Shown ONLY if cart requires Rx) */}
          {rxRequired && (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" /> 2. Prescription Validation (Required)
              </h2>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Your order contains prescription-required medications. Please upload a doctor prescription PDF or image copy to proceed.
              </p>

              {/* Upload zone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Doctor Name</label>
                    <input
                      type="text"
                      placeholder="Dr. Verma"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="h-10 w-10 text-primary mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">Drag & Drop prescription here</p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>

                {/* File Preview */}
                <div className="h-full border border-slate-100 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 flex flex-col justify-center items-center min-h-[190px]">
                  {prescriptionPreview ? (
                    <div className="w-full text-center space-y-3">
                      {prescriptionFile.name.endsWith('.pdf') ? (
                        <div className="p-4 bg-primary/10 rounded-xl text-primary font-bold text-xs inline-block">
                          📄 PDF Document
                        </div>
                      ) : (
                        <img
                          src={prescriptionPreview}
                          alt="prescription preview"
                          className="h-28 max-w-full object-contain rounded-lg border shadow-sm mx-auto bg-white"
                        />
                      )}
                      <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] mx-auto">
                        {prescriptionFile.name}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-xs">
                      No prescription attached yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment method block */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">
              {rxRequired ? '3.' : '2.'} Payment Options
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'UPI', label: 'UPI App', icon: Landmark },
                { name: 'Card', label: 'Credit/Debit Card', icon: CreditCard },
                { name: 'Net Banking', label: 'Net Banking', icon: Landmark },
                { name: 'Cash on Delivery', label: 'Cash on Delivery', icon: ShieldCheck }
              ].map((pm) => (
                <div
                  key={pm.name}
                  onClick={() => setPaymentMethod(pm.name)}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${paymentMethod === pm.name ? 'border-primary bg-primary/5 dark:border-secondary dark:bg-secondary/5' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700'}`}
                >
                  <pm.icon className={`h-5 w-5 ${paymentMethod === pm.name ? 'text-primary dark:text-secondary' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{pm.label}</span>
                </div>
              ))}
            </div>

            {/* UPI Details fields */}
            {paymentMethod === 'UPI' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">UPI ID</label>
                <input
                  type="text"
                  required
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors max-w-sm"
                />
              </div>
            )}

            {/* Credit Card fields */}
            {paymentMethod === 'Card' && (
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-md">
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">CVV</label>
                  <input
                    type="password"
                    required
                    placeholder="***"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Banking info */}
            {paymentMethod === 'Net Banking' && (
              <div className="pt-2 text-xs text-slate-400 font-medium">
                🏦 You will be redirected to your secure bank gateway portal to authenticate transactions.
              </div>
            )}

            {/* Cash info */}
            {paymentMethod === 'Cash on Delivery' && (
              <div className="pt-2 text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                💵 Pay cash/UPI directly to our delivery executive when your parcel is delivered in 30 minutes.
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Order summary sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2">Order Summary</h3>
            
            {/* items list mini */}
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 pr-1">
              {details.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 text-xs font-medium">
                  <div className="min-w-0 pr-4">
                    <span className="text-slate-850 dark:text-slate-200 font-bold block truncate">{item.name}</span>
                    <span className="text-slate-400 text-[10px]">Qty: {item.qty} × ₹{item.price}</span>
                  </div>
                  <span className="text-slate-850 dark:text-slate-200 font-bold">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2 text-xs font-medium text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{details.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax</span>
                <span>₹{details.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{details.deliveryCharge === 0 ? 'FREE' : `₹${details.deliveryCharge.toFixed(2)}`}</span>
              </div>
              {details.discount > 0 && (
                <div className="flex justify-between text-secondary">
                  <span>Discount ({details.couponCode})</span>
                  <span>- ₹{details.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-800 dark:text-white">Payable Total</span>
              <span className="text-xl font-black text-primary dark:text-secondary">₹{details.totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || uploadingRx}
              className="w-full py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-bold text-sm shadow-md shadow-secondary/15 btn-scale flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Placing Order...
                </>
              ) : uploadingRx ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Uploading Rx...
                </>
              ) : (
                'Place Order & Pay'
              )}
            </button>
            
            <div className="text-[10px] text-center text-slate-400 font-semibold flex items-center justify-center gap-1">
              <ShieldCheck className="h-4 w-4 text-secondary" /> Verified Premium Medical Delivery
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
