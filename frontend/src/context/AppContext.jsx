import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('medcare-theme') || 'light');
  
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medcare-token') || null);
  const [authLoading, setAuthLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState({ items: [] });
  const [cartLoading, setCartLoading] = useState(false);

  // Reminders state
  const [reminders, setReminders] = useState([]);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('medcare-theme', theme);
  }, [theme]);

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          // Sync cart and reminders
          fetchCart(token);
          fetchReminders(token);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error("Profile load failed:", err);
        logout();
      } finally {
        setAuthLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  // Toggle Theme helper
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toast Notification helper
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Remove individual toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Log in
  const login = (jwtToken, userData) => {
    localStorage.setItem('medcare-token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    fetchCart(jwtToken);
    fetchReminders(jwtToken);
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  // Log out
  const logout = () => {
    localStorage.removeItem('medcare-token');
    setToken(null);
    setUser(null);
    setCart({ items: [] });
    setReminders([]);
    showToast('Logged out successfully.', 'info');
  };

  // Sync / update profile fields locally
  const updateLocalUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Fetch Cart from API
  const fetchCart = async (authToken = token) => {
    if (!authToken) return;
    setCartLoading(true);
    try {
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
    } finally {
      setCartLoading(false);
    }
  };

  // Add Item to Cart
  const addToCart = async (medicineId, qty = 1) => {
    if (!token) {
      showToast('Please login to add medicines to cart.', 'warning');
      return false;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ medicineId, qty })
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
        showToast('Item added to cart.', 'success');
        return true;
      } else {
        showToast(data.message || 'Failed to add item.', 'error');
        return false;
      }
    } catch (error) {
      console.error("Add cart API error:", error);
      showToast('Error syncing with cart.', 'error');
      return false;
    }
  };

  // Update Cart Quantity
  const updateCartQty = async (itemId, qty) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qty })
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Update cart API error:", error);
      showToast('Error updating item quantity.', 'error');
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (itemId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
        showToast('Item removed from cart.', 'info');
      }
    } catch (error) {
      console.error("Remove cart item error:", error);
      showToast('Error removing item.', 'error');
    }
  };

  // Clear Cart locally
  const clearCartLocally = () => {
    setCart({ items: [] });
  };

  // Fetch Reminders
  const fetchReminders = async (authToken = token) => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/reminders', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error("Reminders fetch error:", error);
    }
  };

  // Save or edit a Reminder
  const saveReminder = async (reminderData) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reminderData)
      });
      const data = await res.json();
      if (data.success) {
        fetchReminders();
        showToast(reminderData.id ? 'Reminder updated!' : 'Reminder added!', 'success');
        return true;
      } else {
        showToast(data.message || 'Failed to save reminder.', 'error');
        return false;
      }
    } catch (error) {
      console.error("Save reminder error:", error);
      return false;
    }
  };

  // Delete a Reminder
  const deleteReminder = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => prev.filter(r => r._id !== id));
        showToast('Reminder deleted.', 'info');
      }
    } catch (error) {
      console.error("Delete reminder error:", error);
    }
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      user,
      token,
      authLoading,
      login,
      logout,
      updateLocalUser,
      
      cart,
      cartLoading,
      fetchCart,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCartLocally,

      reminders,
      fetchReminders,
      saveReminder,
      deleteReminder,

      toasts,
      showToast,
      removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
