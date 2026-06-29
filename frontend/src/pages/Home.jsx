import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, ShoppingBag, ShieldCheck, Award, HeartHandshake,
  Star, Flame, Sparkles, Send, ChevronRight, Pill, Activity,
  Zap, Clock, Check
} from 'lucide-react';

/* ==============================
   ANIMATED STAT COUNTER
   ============================== */
const StatCounter = ({ target, suffix = "", duration = 1400 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      setCount(Math.floor(ease * target));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [started, target, duration]);

  return (
    <span ref={ref} className="font-extrabold text-3xl md:text-4xl gradient-text animate-count-up">
      {count}{suffix}
    </span>
  );
};

/* ==============================
   SCROLL FADE-IN WRAPPER
   ============================== */
const ScrollFadeSection = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setVisible(true);
      });
    }, { threshold: 0.08 });
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`fade-in-section ${visible ? 'is-visible' : ''}`}
    >
      {children}
    </div>
  );
};

/* ==============================
   MEDICINE CARD COMPONENT
   ============================== */
const MedicineCard = ({ med, onView, onAdd }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover-lift group flex flex-col">
    {/* Image */}
    <div
      className="relative h-40 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden cursor-pointer"
      onClick={onView}
    >
      <img
        src={med.image}
        alt={med.name}
        loading="lazy"
        className="w-full h-full object-cover card-img-zoom mix-blend-multiply dark:mix-blend-normal"
      />
      {/* Badges */}
      {med.discount > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
          {med.discount}% OFF
        </span>
      )}
      {med.rxRequired && (
        <span className="absolute top-2 right-2 bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow animate-heartbeat">
          Rx
        </span>
      )}
      {/* Quick view overlay */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-all duration-300 flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white/90 dark:bg-slate-800/90 text-primary dark:text-secondary text-xs font-bold px-3 py-1 rounded-full shadow">
          View Details
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-4 flex flex-col flex-grow">
      <div className="cursor-pointer" onClick={onView}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{med.brand}</p>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1 hover:text-primary dark:hover:text-secondary transition-colors">
          {med.name}
        </h3>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 italic">{med.salt}</p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-slate-800 dark:text-white">₹{med.price}</span>
            {med.discount > 0 && (
              <span className="text-xs text-slate-400 line-through">₹{med.mrp}</span>
            )}
          </div>
          <div className="flex items-center text-amber-500 text-[10px] mt-0.5 gap-0.5">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span className="font-semibold">{med.rating}</span>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-xs transition-all btn-scale ripple-btn shadow-sm shadow-primary/30"
        >
          + Cart
        </button>
      </div>
    </div>
  </div>
);

/* ==============================
   HOME PAGE
   ============================== */
const Home = ({ setCurrentPage, setShopFilters, setSelectedMedicineId }) => {
  const { addToCart, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularMedicines, setPopularMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailSub, setEmailSub] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);

  // Animate hero on mount
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Fetch 8 popular medicines
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/medicines?limit=8&sort=newest');
        const data = await res.json();
        if (data.success) setPopularMedicines(data.medicines);
      } catch (err) {
        console.error("Failed to load popular medicines:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShopFilters({ search: searchQuery });
    setCurrentPage('shop');
  };

  const handleCategoryClick = (categoryName) => {
    setShopFilters({ category: categoryName });
    setCurrentPage('shop');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (emailSub) {
      showToast('Thank you for subscribing to MedCare newsletter! 🎉', 'success');
      setEmailSub('');
    }
  };

  const categories = [
    { name: 'Tablets',   emoji: '💊', desc: 'Oral solid doses',          color: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' },
    { name: 'Syrups',    emoji: '🧪', desc: 'Oral liquids',               color: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900' },
    { name: 'Vitamins',  emoji: '🥝', desc: 'Supplements',                color: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900' },
    { name: 'Skincare',  emoji: '🧴', desc: 'Moisturizers',               color: 'from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900' },
    { name: 'Devices',   emoji: '🎛️', desc: 'Monitors & tools',          color: 'from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900' },
    { name: 'Baby Care', emoji: '👶', desc: 'Hygiene & powders',          color: 'from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900' },
    { name: 'Surgical',  emoji: '🩹', desc: 'Dressings & tapes',          color: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900' },
    { name: 'Ayurvedic', emoji: '🍃', desc: 'Herbal health',              color: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Express Delivery',
      desc: 'Medicines packed and dispatched within 30 minutes via route-optimized dispatch.',
      color: 'text-primary',
      bg: 'bg-primary/10 dark:bg-primary/20'
    },
    {
      icon: ShieldCheck,
      title: '100% Genuine',
      desc: 'Every product sourced directly from certified manufacturers. Verified by pharmacists.',
      color: 'text-secondary',
      bg: 'bg-secondary/10 dark:bg-secondary/20'
    },
    {
      icon: Award,
      title: 'Drug Interaction Alerts',
      desc: 'Input drug pairs into our checker to verify chemical interaction risks before dosing.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10 dark:bg-purple-500/20'
    },
    {
      icon: HeartHandshake,
      title: 'Smart Reminders',
      desc: 'Set daily pill alarms with browser push notifications for precise dosing schedules.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10 dark:bg-rose-500/20'
    },
  ];

  const testimonials = [
    { name: 'Dr. Rajesh Kumar', role: 'Cardiologist, Bangalore', seed: 'Rajesh', quote: '"MedCare changed how I order medicines for my aged parents. 30-min dispatch works like magic. The reminder alerts ensure they never skip a dosage."' },
    { name: 'Ananya Sen',       role: 'Product Designer, Mumbai', seed: 'Ananya', quote: '"The drug interaction tool is exceptional! It warned me about my blood pressure pills conflicting with my antacid. Potentially life-saving information!"' },
    { name: 'Kabir Malhotra',   role: 'Senior Consultant, Delhi', seed: 'Kabir',  quote: '"Uploaded prescription and it was verified in 5 minutes. Delivery arrived 20 minutes later. Best pharmacy experience I\'ve had."' },
  ];

  return (
    <div className="space-y-16 overflow-x-hidden">

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative w-full overflow-hidden py-16 md:py-24 border-b border-slate-100 dark:border-slate-800">
        {/* Particle dot background */}
        <div className="absolute inset-0 particle-bg pointer-events-none" />

        {/* Blob background glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary/8 dark:bg-primary/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/8 dark:bg-secondary/5 rounded-full blur-3xl animate-blob" style={{animationDelay:'4s'}} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          {/* Hero text */}
          <div
            className={`md:col-span-7 space-y-6 text-left transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary dark:text-secondary dark:bg-secondary/10 border border-primary/20 dark:border-secondary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Over 22,000 satisfied deliveries across India
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-slate-800 dark:text-white">
              Your Health,{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">Delivered in Minutes.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-300 max-w-xl leading-relaxed">
              Upload prescriptions, check drug interactions, set medicine reminders,
              and buy authentic healthcare products at the best rates.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex max-w-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-2xl p-1.5 search-glow transition-all"
            >
              <div className="flex items-center flex-grow pl-3 gap-2">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search medicines, brands, salts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-700 dark:text-slate-200 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm btn-scale ripple-btn shrink-0"
              >
                Search
              </button>
            </form>

            {/* Quick feature pills */}
            <div className="flex flex-wrap gap-2">
              {['Free delivery above ₹499', 'Rx accepted', '24/7 Support', 'Genuine products'].map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 shadow-sm">
                  <Check className="h-3 w-3 text-secondary" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Floating Pill Graphic */}
          <div
            className={`md:col-span-5 flex justify-center items-center relative py-10 md:py-0 transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {/* Background glow blob */}
            <div className="absolute w-64 h-64 bg-primary/15 dark:bg-secondary/10 rounded-full blur-3xl" />

            {/* The Floating Pill SVG */}
            <div className="relative animate-float-pill w-40 h-40 sm:w-48 sm:h-48 select-none">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Capsule top half */}
                <path d="M50,100 C50,60 70,30 100,30 C130,30 150,60 150,100 Z" fill="#0066FF" />
                {/* Capsule bottom half */}
                <path d="M50,100 C50,140 70,170 100,170 C130,170 150,140 150,100 Z" fill="#00D4AA" />
                {/* White band separator */}
                <rect x="48" y="94" width="104" height="12" rx="3" fill="#ffffff" opacity="0.9" />
                {/* Inner circle */}
                <circle cx="100" cy="100" r="10" fill="#ffffff" opacity="0.95" />
                {/* Plus cross */}
                <path d="M100,94 V106 M94,100 H106" stroke="#0066FF" strokeWidth="3" strokeLinecap="round" />
                {/* Shine gloss */}
                <path d="M68,46 C78,38 94,34 108,38" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Orbiting mini pill animations */}
            <div className="absolute w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/30 border-2 border-primary/40"
              style={{ top: '15%', right: '10%', animation: 'floatAndRotate 6s ease-in-out infinite 1s' }}
            />
            <div className="absolute w-5 h-5 rounded-full bg-secondary/30 dark:bg-secondary/40 border-2 border-secondary/50"
              style={{ bottom: '20%', left: '12%', animation: 'floatAndRotate 5s ease-in-out infinite 0.5s' }}
            />
            <div className="absolute w-6 h-6 rounded-full bg-purple-400/20 border-2 border-purple-400/40"
              style={{ top: '55%', right: '5%', animation: 'floatAndRotate 7s ease-in-out infinite 2s' }}
            />
          </div>

        </div>
      </section>

      {/* ===================== STAT COUNTERS ===================== */}
      <ScrollFadeSection>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 md:p-10 shadow-sm">
            {[
              { target: 5000, suffix: '+', label: 'Medicines', icon: Pill },
              { target: 30,   suffix: ' min', label: 'Avg Delivery', icon: Clock },
              { target: 24,   suffix: '/7', label: 'Live Support', icon: Activity },
              { target: 98,   suffix: '%', label: 'Genuine Products', icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className={`text-center space-y-2 ${i > 0 ? 'border-l border-slate-100 dark:border-slate-700' : ''}`}>
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-primary/8 dark:bg-primary/15 rounded-full">
                    <stat.icon className="h-5 w-5 text-primary dark:text-secondary" />
                  </div>
                </div>
                <StatCounter target={stat.target} suffix={stat.suffix} />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollFadeSection>

      {/* ===================== CATEGORIES GRID ===================== */}
      <ScrollFadeSection delay={100}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">Shop by Category</h2>
            <p className="text-slate-400 text-sm">Find medicines organized by medical application area</p>
            <hr className="divider-glow max-w-xs mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`bg-gradient-to-br ${cat.color} p-4 md:p-5 rounded-2xl border border-white/50 dark:border-slate-700 cursor-pointer category-card flex flex-col items-center justify-center gap-2.5 group`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-2xl md:text-3xl filter drop-shadow transition-transform duration-300 group-hover:scale-110">
                  {cat.emoji}
                </span>
                <div>
                  <h3 className="font-bold text-xs md:text-sm text-slate-700 dark:text-slate-200">{cat.name}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollFadeSection>

      {/* ===================== OFFER BANNER ===================== */}
      <ScrollFadeSection delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-gradient-banner rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full" />

            <div className="space-y-3 text-left max-w-xl z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-bold tracking-wide border border-white/20">
                <Flame className="h-3.5 w-3.5" /> Limited Time Offer
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                Save 10% Extra on All Medicines & Health Devices
              </h2>
              <p className="text-sm text-white/85">Free delivery on orders above ₹499. Apply coupon at checkout.</p>
              <button
                onClick={() => { setShopFilters({}); setCurrentPage('shop'); }}
                className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-white text-primary font-bold text-sm rounded-xl btn-scale ripple-btn shadow-lg"
              >
                Shop Now <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Coupon block */}
            <div className="flex flex-col items-center bg-white/10 border border-white/25 backdrop-blur-sm rounded-2xl p-6 text-center shrink-0 w-full sm:w-auto z-10 min-w-[180px]">
              <span className="text-xs text-white/75 uppercase font-semibold tracking-wide">Coupon Code</span>
              <span className="text-xl sm:text-2xl font-black tracking-widest text-white mt-2 animate-pulse-glow rounded-lg px-2 py-1">
                MEDCARE30
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('MEDCARE30').catch(() => {});
                  showToast('Coupon code MEDCARE30 copied! 🎉', 'success');
                }}
                className="mt-3 px-5 py-1.5 bg-white text-primary hover:bg-slate-50 font-bold text-xs rounded-xl shadow-md transition-transform btn-scale"
              >
                Copy Code
              </button>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* ===================== POPULAR MEDICINES ===================== */}
      <ScrollFadeSection delay={100}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">Popular Medicines</h2>
              <p className="text-slate-400 text-sm mt-1">Most purchased healthcare products this week</p>
            </div>
            <button
              onClick={() => { setShopFilters({}); setCurrentPage('shop'); }}
              className="text-primary hover:text-primary-dark dark:text-secondary dark:hover:text-secondary-dark text-sm font-bold flex items-center gap-1 btn-scale"
            >
              See All →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading ? (
              [...Array(8)].map((_, idx) => (
                <div key={idx} className="h-72 bg-slate-100 dark:bg-slate-800 rounded-2xl skeleton-shimmer" />
              ))
            ) : (
              popularMedicines.map((med, i) => (
                <div key={med._id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <MedicineCard
                    med={med}
                    onView={() => { setSelectedMedicineId(med._id); setCurrentPage('detail'); }}
                    onAdd={() => addToCart(med._id, 1)}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </ScrollFadeSection>

      {/* ===================== WHY CHOOSE US ===================== */}
      <ScrollFadeSection delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">Why Choose MedCare</h2>
            <p className="text-slate-400 text-sm">Advanced pharmacy services backed by modern tech</p>
            <hr className="divider-glow max-w-xs mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-2xl shadow-sm hover-lift flex flex-col items-center text-center space-y-4 group">
                <div className={`p-3 ${feat.bg} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon className={`h-6 w-6 ${feat.color}`} />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{feat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollFadeSection>

      {/* ===================== TESTIMONIALS ===================== */}
      <ScrollFadeSection delay={100}>
        <section className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-14 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">Customer Reviews</h2>
              <p className="text-slate-400 text-sm">Trusted by thousands of patients and healthcare professionals</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover-lift space-y-4 relative overflow-hidden">
                  {/* Decorative quote mark */}
                  <span className="absolute top-3 right-4 text-6xl text-primary/8 dark:text-secondary/8 font-serif leading-none select-none">"</span>

                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, si) => <Star key={si} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 leading-relaxed italic">{t.quote}</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <img
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${t.seed}`}
                      alt={t.name}
                      className="h-10 w-10 rounded-full border-2 border-primary/20 bg-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{t.name}</h4>
                      <p className="text-[10px] text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* ===================== NEWSLETTER ===================== */}
      <ScrollFadeSection delay={100}>
        <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pb-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">Stay Healthy with MedCare</h2>
            <p className="text-slate-400 text-sm">Get safety guidelines, wellness tips, and exclusive discount offers</p>
          </div>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row max-w-lg mx-auto gap-2"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={emailSub}
              onChange={(e) => setEmailSub(e.target.value)}
              className="flex-grow px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl text-slate-700 dark:text-slate-200 text-sm outline-none search-glow"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 btn-scale ripple-btn shadow-md shadow-secondary/25"
            >
              <Send className="h-4 w-4" /> Subscribe
            </button>
          </form>
          <p className="text-xs text-slate-400">No spam. Unsubscribe anytime. By subscribing you agree to our Privacy Policy.</p>
        </section>
      </ScrollFadeSection>

    </div>
  );
};

export default Home;
