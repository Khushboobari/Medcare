import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Star, ShieldAlert, Heart, ShoppingCart, RefreshCw, Send } from 'lucide-react';

const MedicineDetail = ({ medicineId, setSelectedMedicineId, setCurrentPage }) => {
  const { addToCart, token, user, showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  
  // Review inputs
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchMedicineDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/medicines/${medicineId}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (medicineId) {
      fetchMedicineDetail();
      setQty(1);
      setWishlisted(false);
    }
  }, [medicineId]);

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Please login to post reviews.', 'warning');
      return;
    }
    if (!comment) {
      showToast('Comment cannot be empty.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/medicines/${medicineId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      const resData = await res.json();
      if (resData.success) {
        showToast('Review submitted successfully!', 'success');
        setComment('');
        fetchMedicineDetail(); // Refresh details and reviews
      } else {
        showToast(resData.message || 'Failed to submit review.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Network error while posting review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubstituteClick = (subId) => {
    setSelectedMedicineId(subId);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading medicine dossier...</p>
      </div>
    );
  }

  if (!data || !data.medicine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <span className="text-5xl">⚠️</span>
        <h2 className="text-xl font-bold">Medicine dossier not found</h2>
        <button onClick={() => setCurrentPage('shop')} className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold">
          Back to Shop Catalog
        </button>
      </div>
    );
  }

  const { medicine, reviews, substitutes, related } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* 1. Core Info layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        
        {/* Left: Image Card */}
        <div className="md:col-span-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center shadow-sm">
          <div className="relative w-full h-80 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
            <img
              src={medicine.image}
              alt={medicine.name}
              className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform"
            />
            {medicine.rxRequired && (
              <span className="absolute top-4 right-4 bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" /> Rx Required
              </span>
            )}
          </div>
        </div>

        {/* Right: Spec details */}
        <div className="md:col-span-7 space-y-6 text-left">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{medicine.brand}</p>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{medicine.name}</h1>
            <p className="text-sm font-semibold text-primary dark:text-secondary mt-1">{medicine.salt}</p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Selling Price</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white">₹{medicine.price}</span>
            </div>
            {medicine.discount > 0 && (
              <>
                <div className="border-l border-slate-200 dark:border-slate-700 h-8"></div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">MRP</span>
                  <span className="text-base text-slate-400 line-through">₹{medicine.mrp}</span>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-700 h-8"></div>
                <div className="bg-red-500 text-white font-bold text-xs px-3 py-1 rounded-lg">
                  {medicine.discount}% OFF
                </div>
              </>
            )}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
            {medicine.description}
          </p>

          {/* Quantity Selector and Add-to-cart Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Qty count control */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
              <button 
                onClick={() => setQty(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-lg text-slate-500"
              >
                -
              </button>
              <span className="px-4 font-bold text-sm text-slate-800 dark:text-white">{qty}</span>
              <button 
                onClick={() => setQty(prev => prev + 1)}
                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-lg text-slate-500"
              >
                +
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => addToCart(medicine._id, qty)}
              className="flex-grow md:flex-grow-0 px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 btn-scale shadow-lg shadow-primary/20"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                setWishlisted(!wishlisted);
                showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', 'info');
              }}
              className={`p-3 rounded-xl border transition-colors ${wishlisted ? 'border-red-200 bg-red-50 text-red-500 dark:bg-red-950/20' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 text-slate-400'}`}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Rx notification details */}
          {medicine.rxRequired && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Prescription Required</p>
                <p className="mt-0.5 leading-relaxed">This drug requires verification. You will be prompted to drag-and-drop or select a valid doctor prescription copy at checkout to place order.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 2. Structured Medical Details */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left shadow-sm">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Medical Uses & Composition</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold block text-slate-400 text-xs uppercase mb-1">Salt / Active Ingredients:</span> {medicine.salt}</p>
            <p><span className="font-semibold block text-slate-400 text-xs uppercase mb-1">Therapeutic Uses:</span> {medicine.uses}</p>
            <p><span className="font-semibold block text-slate-400 text-xs uppercase mb-1">Standard Dosage:</span> {medicine.dosage || "As recommended by your physician."}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Side Effects & Storage</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold block text-slate-400 text-xs uppercase mb-1">Potential Side Effects:</span> {medicine.sideEffects || "No severe side effects reported. Consult a doctor if you experience discomfort."}</p>
            <p><span className="font-semibold block text-slate-400 text-xs uppercase mb-1">Storage Instructions:</span> {medicine.storage || "Store in cool, dry place. Keep away from direct sunlight and children."}</p>
            <p><span className="font-semibold block text-slate-400 text-xs uppercase mb-1">Drug Category Type:</span> {medicine.category} (GST applicable rate: {medicine.category === 'Devices' ? '18%' : '12%'})</p>
          </div>
        </div>
      </div>

      {/* 3. Substitute Medicines (Same composition, lower price) */}
      {substitutes.length > 0 && (
        <div className="space-y-6 text-left">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Cost-Effective Substitutes (Same Salt)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {substitutes.map((sub) => (
              <div
                key={sub._id}
                onClick={() => handleSubstituteClick(sub._id)}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-secondary/20 p-4 shadow-sm hover-lift cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden mb-3">
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{sub.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">{sub.salt}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="font-extrabold text-slate-800 dark:text-white text-sm">₹{sub.price}</span>
                  <span className="text-[9px] bg-secondary/15 text-secondary-dark dark:text-secondary px-2 py-0.5 rounded font-bold">
                    Save ₹{Math.round(medicine.price - sub.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Related Medicines */}
      {related.length > 0 && (
        <div className="space-y-6 text-left">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <div
                key={item._id}
                onClick={() => handleSubstituteClick(item._id)}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover-lift cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden mb-3">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">{item.brand}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="font-extrabold text-slate-800 dark:text-white text-sm">₹{item.price}</span>
                  <button className="text-xs text-primary font-bold">Details →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Customer Reviews List & Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start text-left pt-6 border-t border-slate-100 dark:border-slate-800">
        
        {/* Left: reviews list (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Customer Reviews ({reviews.length})</h2>
          
          {reviews.length === 0 ? (
            <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-2xl text-center text-slate-400 text-sm">
              No reviews posted for this medicine yet. Be the first to add yours!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.userId?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.userId?.name || 'Guest'}`}
                        alt="user"
                        className="h-8 w-8 rounded-full border bg-slate-50"
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{rev.userId?.name || 'Anonymous User'}</h4>
                        <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500 gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: add review form (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Post a Review</h3>
          
          {token ? (
            <form onSubmit={handlePostReview} className="space-y-4">
              
              {/* Rating selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Rating Score</label>
                <div className="flex gap-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-6 w-6 ${rating >= star ? 'fill-current' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Review Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience using this treatment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-xs flex justify-center items-center gap-1.5 transition-transform btn-scale"
              >
                <Send className="h-3 w-3" /> Submit Review
              </button>

            </form>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center space-y-3">
              <p className="text-xs text-slate-400">Please sign in to write product reviews and share your clinical experience.</p>
              <button 
                onClick={() => setCurrentPage('auth')} 
                className="px-4 py-1.5 bg-primary text-white hover:bg-primary-dark rounded-lg text-xs font-semibold shadow"
              >
                Login Page
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default MedicineDetail;
