import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { LayoutDashboard, ShoppingBag, Plus, Trash2, Edit, Check, X, FileText, AlertTriangle, Users, DollarSign, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { token, showToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview | medicines | orders | prescriptions
  
  // Dashboard data states
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Medicines list
  const [medicines, setMedicines] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(true);

  // Orders list
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Medicine Form States (for Add / Edit)
  const [formOpen, setFormOpen] = useState(false);
  const [editMedId, setEditMedId] = useState('');
  const [medName, setMedName] = useState('');
  const [medBrand, setMedBrand] = useState('');
  const [medSalt, setMedSalt] = useState('');
  const [medCategory, setMedCategory] = useState('Tablets');
  const [medPrice, setMedPrice] = useState('');
  const [medMrp, setMedMrp] = useState('');
  const [medStock, setMedStock] = useState('');
  const [medImage, setMedImage] = useState('');
  const [medRx, setMedRx] = useState(false);
  const [medDesc, setMedDesc] = useState('');
  const [medUses, setMedUses] = useState('');

  const categories = ['Tablets', 'Syrups', 'Vitamins', 'Skincare', 'Devices', 'Baby Care', 'Surgical', 'Ayurvedic'];

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchMedicines = async () => {
    setLoadingMeds(true);
    try {
      const res = await fetch('/api/medicines?limit=100'); // Load all
      const data = await res.json();
      if (data.success) {
        setMedicines(data.medicines);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMeds(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
      if (activeSubTab === 'medicines') fetchMedicines();
      if (activeSubTab === 'orders') fetchOrders();
    }
  }, [token, activeSubTab]);

  // Handle Add/Edit Medicine form submit
  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    if (!medName || !medBrand || !medPrice || !medMrp) {
      showToast('Name, Brand, Price and MRP are required fields.', 'error');
      return;
    }

    const payload = {
      name: medName,
      brand: medBrand,
      salt: medSalt || 'General formulation',
      category: medCategory,
      price: Number(medPrice),
      mrp: Number(medMrp),
      discount: Math.round(((Number(medMrp) - Number(medPrice)) / Number(medMrp)) * 100),
      stock: Number(medStock || 10),
      image: medImage || 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500',
      rxRequired: medRx,
      description: medDesc || 'No description provided.',
      uses: medUses || 'General wellness application.'
    };

    try {
      let url = '/api/admin/medicines';
      let method = 'POST';

      if (editMedId) {
        url = `/api/admin/medicines/${editMedId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editMedId ? 'Medicine updated!' : 'Medicine added to inventory!', 'success');
        setFormOpen(false);
        resetFormState();
        fetchMedicines();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save medicine.', 'error');
    }
  };

  const handleEditMedInit = (med) => {
    setEditMedId(med._id);
    setMedName(med.name);
    setMedBrand(med.brand);
    setMedSalt(med.salt);
    setMedCategory(med.category);
    setMedPrice(med.price);
    setMedMrp(med.mrp);
    setMedStock(med.stock);
    setMedImage(med.image);
    setMedRx(med.rxRequired);
    setMedDesc(med.description);
    setMedUses(med.uses);
    setFormOpen(true);
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const res = await fetch(`/api/admin/medicines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Medicine removed successfully.', 'info');
        setMedicines(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetFormState = () => {
    setEditMedId('');
    setMedName('');
    setMedBrand('');
    setMedSalt('');
    setMedCategory('Tablets');
    setMedPrice('');
    setMedMrp('');
    setMedStock('');
    setMedImage('');
    setMedRx(false);
    setMedDesc('');
    setMedUses('');
  };

  // Update order status dropdown
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order status updated successfully.', 'success');
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Prescription approvals queue
  const handlePrescriptionApproval = async (rxId, status) => {
    try {
      const res = await fetch(`/api/admin/prescriptions/${rxId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Prescription status set to ${status}.`, 'success');
        fetchDashboard(); // Refresh queue list
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex flex-col gap-1">
          <div className="px-4 py-3 border-b dark:border-slate-700 mb-2">
            <h3 className="font-extrabold text-sm text-primary flex items-center gap-1.5 dark:text-secondary">
              🔧 Controls Desk
            </h3>
          </div>
          
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`w-full text-left px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2.5 ${activeSubTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350'}`}
          >
            <LayoutDashboard className="h-4 w-4" /> Overview Dashboard
          </button>
          
          <button
            onClick={() => setActiveSubTab('medicines')}
            className={`w-full text-left px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2.5 ${activeSubTab === 'medicines' ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350'}`}
          >
            <ShoppingBag className="h-4 w-4" /> Manage Medicines
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`w-full text-left px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2.5 ${activeSubTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350'}`}
          >
            <Activity className="h-4 w-4" /> Manage Orders
          </button>
        </div>

        {/* Contents area */}
        <div className="w-full md:w-4/5 space-y-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Telemetry Stats Cards */}
              {loadingDashboard ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase">Total Orders</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">{dashboardData.stats.totalOrders}</span>
                    </div>
                    <span className="p-2.5 bg-blue-50 text-blue-500 rounded-xl dark:bg-blue-950/20"><ShoppingBag className="h-5 w-5" /></span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase">Total Users</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">{dashboardData.stats.totalUsers}</span>
                    </div>
                    <span className="p-2.5 bg-green-50 text-green-500 rounded-xl dark:bg-green-950/20"><Users className="h-5 w-5" /></span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase">Gross Revenue</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">₹{dashboardData.stats.totalRevenue}</span>
                    </div>
                    <span className="p-2.5 bg-amber-50 text-amber-500 rounded-xl dark:bg-amber-950/20"><DollarSign className="h-5 w-5" /></span>
                  </div>

                  <div className={`p-5 rounded-2xl shadow-sm flex items-center justify-between border ${dashboardData.stats.lowStockCount > 0 ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase">Low Stock Alerts</span>
                      <span className="text-2xl font-black mt-1 block">{dashboardData.stats.lowStockCount} items</span>
                    </div>
                    <span className="p-2.5 bg-red-100 rounded-xl text-red-500 dark:bg-red-950/25"><AlertTriangle className="h-5 w-5" /></span>
                  </div>

                </div>
              )}

              {/* Chart Plot & Low Stock tracker split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Sales Area Chart (8 cols) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white mb-4">Gross Revenue Chart (Last 7 Days)</h3>
                  
                  {!loadingDashboard && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboardData.salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                          <XAxis dataKey="day" tickLine={false} style={{ fontSize: 10, fill: '#A0AEC0' }} />
                          <YAxis tickLine={false} style={{ fontSize: 10, fill: '#A0AEC0' }} />
                          <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                          <Area type="monotone" dataKey="sales" stroke="#0066FF" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Inventory Stock highlight tracker (4 cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white border-b pb-2">Low Stock Alerts</h3>
                  
                  {loadingDashboard ? (
                    <div className="h-44 bg-slate-100 animate-pulse"></div>
                  ) : dashboardData.lowStockAlerts.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">All items fully stocked!</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {dashboardData.lowStockAlerts.map(m => (
                        <div key={m._id} className="p-2 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl flex justify-between text-xs items-center">
                          <div className="truncate pr-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{m.name}</span>
                            <span className="text-[10px] text-slate-400">Price: ₹{m.price}</span>
                          </div>
                          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950 text-red-650 font-bold rounded-lg shrink-0">
                            Qty: {m.stock}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Prescription verification queue & recent activities */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Prescription Queue (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2">Prescription Approval Queue</h3>
                  
                  {loadingDashboard ? (
                    <div className="h-32 bg-slate-100 animate-pulse"></div>
                  ) : dashboardData.pendingPrescriptions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Queue empty. No pending prescriptions checks.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {dashboardData.pendingPrescriptions.map(rx => (
                        <div key={rx._id} className="p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 rounded-2xl flex justify-between items-center gap-3">
                          <div className="truncate text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">User: {rx.userId?.name || 'Guest'}</span>
                            <span className="text-[9px] text-slate-450 block truncate">Doctor: {rx.doctorName} | {new Date(rx.date).toLocaleDateString()}</span>
                            <a href={rx.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary dark:text-secondary hover:underline font-bold mt-1 inline-block">
                              📄 View Prescription Document
                            </a>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handlePrescriptionApproval(rx._id, 'Verified')}
                              className="p-1.5 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-transform btn-scale"
                              title="Verify/Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handlePrescriptionApproval(rx._id, 'Rejected')}
                              className="p-1.5 bg-red-500 hover:bg-red-650 text-white rounded-lg transition-transform btn-scale"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activities (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white border-b pb-2">Recent Activities</h3>
                  
                  {loadingDashboard ? (
                    <div className="h-32 bg-slate-100 animate-pulse"></div>
                  ) : dashboardData.recentActivity.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No recent logs recorded.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {dashboardData.recentActivity.map((log, idx) => (
                        <div key={idx} className="flex gap-3 text-xs items-start p-1.5 rounded-lg border border-slate-50 dark:border-slate-750">
                          <span className={`p-1 rounded-lg shrink-0 mt-0.5 ${log.type === 'order' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'}`}>
                            {log.type === 'order' ? '🛒' : '📄'}
                          </span>
                          <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200 leading-normal">{log.text}</p>
                            <span className="text-[9px] text-slate-400">{new Date(log.time).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MANAGE MEDICINES */}
          {activeSubTab === 'medicines' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-bold text-slate-850 dark:text-white">Medicines Catalog ({medicines.length})</h2>
                <button
                  onClick={() => { resetFormState(); setFormOpen(true); }}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1 btn-scale shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Add New Medicine
                </button>
              </div>

              {/* Form panel add/edit */}
              {formOpen && (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm text-left">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white mb-4">
                    {editMedId ? 'Edit Medicine details' : 'Register New Medicine'}
                  </h3>
                  
                  <form onSubmit={handleMedicineSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Medicine Name</label>
                      <input
                        type="text" required placeholder="Crocin 650"
                        value={medName} onChange={(e) => setMedName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brand</label>
                      <input
                        type="text" required placeholder="Haleon"
                        value={medBrand} onChange={(e) => setMedBrand(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Salt / Compositions</label>
                      <input
                        type="text" required placeholder="Paracetamol 650mg"
                        value={medSalt} onChange={(e) => setMedSalt(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
                      <select
                        value={medCategory} onChange={(e) => setMedCategory(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs outline-none text-slate-750"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Price (₹)</label>
                      <input
                        type="number" required placeholder="90"
                        value={medPrice} onChange={(e) => setMedPrice(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">MRP (₹)</label>
                      <input
                        type="number" required placeholder="100"
                        value={medMrp} onChange={(e) => setMedMrp(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stock Qty</label>
                      <input
                        type="number" required placeholder="150"
                        value={medStock} onChange={(e) => setMedStock(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Image URL</label>
                      <input
                        type="text" placeholder="https://images.unsplash.com/..."
                        value={medImage} onChange={(e) => setMedImage(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4">
                      <input
                        type="checkbox" id="medRxBox"
                        checked={medRx} onChange={(e) => setMedRx(e.target.checked)}
                        className="h-4.5 w-4.5 accent-primary cursor-pointer"
                      />
                      <label htmlFor="medRxBox" className="text-xs font-bold text-slate-650 cursor-pointer dark:text-slate-300">Prescription Required (Rx)</label>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
                      <textarea
                        rows={2} placeholder="Brief summary of therapeutic action..."
                        value={medDesc} onChange={(e) => setMedDesc(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Primary Uses / Indication</label>
                      <textarea
                        rows={2} placeholder="Treats fever, headaches etc..."
                        value={medUses} onChange={(e) => setMedUses(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                      />
                    </div>
                    
                    <div className="sm:col-span-3 flex gap-2">
                      <button type="submit" className="px-6 py-2.5 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-xs font-bold">
                        {editMedId ? 'Save Edits' : 'Register Medicine'}
                      </button>
                      <button type="button" onClick={() => { setFormOpen(false); resetFormState(); }} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold dark:bg-slate-700 dark:text-slate-200">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Medicine inventory table */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-slate-450 uppercase font-bold text-[10px] tracking-wider border-b dark:border-slate-700">
                        <th className="p-4">Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4 text-center">Price</th>
                        <th className="p-4 text-center">Rx</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-700 dark:text-slate-350">
                      {loadingMeds ? (
                        [...Array(3)].map((_, i) => (
                          <tr key={i} className="animate-pulse"><td colSpan={6} className="h-12 bg-slate-50 dark:bg-slate-900"></td></tr>
                        ))
                      ) : medicines.map((m) => (
                        <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850">
                          <td className="p-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{m.name}</span>
                            <span className="text-[10px] text-slate-450 block truncate max-w-[150px]">{m.brand} | {m.salt}</span>
                          </td>
                          <td className="p-4">{m.category}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${m.stock < 10 ? 'bg-red-50 text-red-650 dark:bg-red-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-900'}`}>
                              {m.stock}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold">₹{m.price}</td>
                          <td className="p-4 text-center">
                            {m.rxRequired ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-500 font-bold rounded">Yes</span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleEditMedInit(m)} className="p-1 text-slate-400 hover:text-slate-650" title="Edit"><Edit className="h-4 w-4" /></button>
                              <button onClick={() => handleDeleteMedicine(m._id)} className="p-1 text-slate-400 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MANAGE ORDERS */}
          {activeSubTab === 'orders' && (
            <div className="space-y-6">
              
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-slate-850 dark:text-white">Active Orders Dashboard ({orders.length})</h2>
              </div>

              {/* Orders lists */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-slate-450 uppercase font-bold text-[10px] tracking-wider border-b dark:border-slate-700">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4 text-center">Items Qty</th>
                        <th className="p-4 text-center">Total Paid</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Set Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-750 dark:text-slate-350">
                      {loadingOrders ? (
                        [...Array(3)].map((_, i) => (
                          <tr key={i} className="animate-pulse"><td colSpan={6} className="h-12 bg-slate-50 dark:bg-slate-900"></td></tr>
                        ))
                      ) : orders.map((o) => (
                        <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850">
                          <td className="p-4 font-mono font-bold">#{o._id.substring(18)}</td>
                          <td className="p-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{o.userId?.name || 'Guest User'}</span>
                            <span className="text-[9px] text-slate-400 block">{o.userId?.email}</span>
                          </td>
                          <td className="p-4 text-center font-bold">{o.items.reduce((sum, i) => sum + i.qty, 0)} items</td>
                          <td className="p-4 text-center font-bold text-primary dark:text-secondary">₹{o.totalAmount}</td>
                          <td className="p-4 text-center">
                            <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary rounded font-bold uppercase text-[9px]">
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                              className="text-[10px] bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-1.5 outline-none font-bold"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
