import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu, X, ShoppingCart, User, LogOut, Sun, Moon,
  LayoutDashboard, Bell, FileText, Activity, ShieldAlert,
  Home, ChevronDown, Stethoscope
} from 'lucide-react';

const Navbar = ({ setCurrentPage }) => {
  const { theme, toggleTheme, user, logout, cart } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.qty, 0) || 0;

  // Detect scroll for navbar shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navigateTo = (pageName) => {
    setCurrentPage(pageName);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigateTo('home');
  };

  const navLinks = [
    { name: 'Home',          page: 'home',               icon: Home },
    { name: 'Shop',          page: 'shop',               icon: ShoppingCart },
    { name: 'Symptoms',      page: 'symptom-checker',    icon: Activity },
    { name: 'Drug Checker',  page: 'interaction-checker',icon: ShieldAlert },
    { name: 'Prescriptions', page: 'prescriptions',      icon: FileText },
    { name: 'Reminders',     page: 'reminders',          icon: Bell },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 glass-nav w-full transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-4">

            {/* Logo */}
            <button
              onClick={() => navigateTo('home')}
              className="flex-shrink-0 flex items-center gap-2 group"
              aria-label="MedCare Home"
            >
              <span className="p-1.5 bg-primary/10 dark:bg-secondary/10 rounded-xl group-hover:bg-primary/20 dark:group-hover:bg-secondary/20 transition-colors">
                <Stethoscope className="h-5 w-5 text-primary dark:text-secondary" />
              </span>
              <span className="text-xl font-black tracking-tight text-primary dark:text-secondary hidden sm:block">
                Med<span className="text-secondary dark:text-primary">Care</span>
              </span>
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => navigateTo(link.page)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary hover:bg-primary/8 dark:hover:bg-secondary/8 text-sm font-medium transition-all"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.name}
                </button>
              ))}
            </div>

            {/* Actions panel */}
            <div className="flex items-center gap-2">

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark'
                  ? <Sun className="h-5 w-5 text-amber-400" />
                  : <Moon className="h-5 w-5 text-slate-600" />}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => navigateTo('cart')}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center badge-bounce shadow-sm">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* User Dropdown / Login button */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="User menu"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                      alt="avatar"
                      className="h-7 w-7 rounded-full border-2 border-primary/30 dark:border-secondary/30 bg-slate-100"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:block max-w-[80px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 hidden md:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-bounce-in">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{user.email}</p>
                      </div>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => navigateTo('admin')}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/8 hover:text-primary flex items-center gap-3 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </button>
                      )}

                      <button onClick={() => navigateTo('profile')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/8 hover:text-primary flex items-center gap-3 transition-colors">
                        <User className="h-4 w-4" /> My Profile
                      </button>
                      <button onClick={() => navigateTo('prescriptions')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/8 hover:text-primary flex items-center gap-3 transition-colors">
                        <FileText className="h-4 w-4" /> Prescriptions
                      </button>
                      <button onClick={() => navigateTo('reminders')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/8 hover:text-primary flex items-center gap-3 transition-colors">
                        <Bell className="h-4 w-4" /> My Reminders
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors rounded-b-2xl">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigateTo('auth')}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm btn-scale ripple-btn shadow-sm shadow-primary/30 hidden sm:block"
                >
                  Login
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen
                  ? <X className="h-5 w-5" />
                  : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Full-screen Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Slide-in drawer from left */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-up overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-primary dark:text-secondary">
                Med<span className="text-secondary dark:text-primary">Care</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* User info if logged in */}
            {user && (
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                  alt="avatar" className="h-10 w-10 rounded-full border-2 border-primary/30"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[160px]">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-grow px-3 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => navigateTo(link.page)}
                  className="w-full text-left py-3 px-4 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-primary/8 hover:text-primary dark:hover:text-secondary text-sm font-medium flex items-center gap-3 transition-all"
                >
                  <link.icon className="h-5 w-5 text-slate-400" />
                  {link.name}
                </button>
              ))}

              {user?.role === 'admin' && (
                <button
                  onClick={() => navigateTo('admin')}
                  className="w-full text-left py-3 px-4 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-primary/8 hover:text-primary dark:hover:text-secondary text-sm font-medium flex items-center gap-3 transition-all"
                >
                  <LayoutDashboard className="h-5 w-5 text-slate-400" />
                  Admin Dashboard
                </button>
              )}

              {user && (
                <button
                  onClick={() => navigateTo('profile')}
                  className="w-full text-left py-3 px-4 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-primary/8 hover:text-primary dark:hover:text-secondary text-sm font-medium flex items-center gap-3 transition-all"
                >
                  <User className="h-5 w-5 text-slate-400" />
                  My Profile
                </button>
              )}
            </nav>

            {/* Bottom actions */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark'
                  ? <><Sun className="h-5 w-5 text-amber-400" /> Light Mode</>
                  : <><Moon className="h-5 w-5 text-slate-600" /> Dark Mode</>}
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800 text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('auth')}
                  className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm btn-scale"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
