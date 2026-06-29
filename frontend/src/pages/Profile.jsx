import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, ShieldAlert, Users, MapPin, Clock, FileText, Bell, Sparkles, RefreshCw } from 'lucide-react';

const Profile = ({ setCurrentPage, setOrderId }) => {
  const { token, user, reminders, updateLocalUser, addToCart, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('personal'); // personal | addresses | orders | health
  
  // Edit Profile form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  // Family member states
  const [famName, setFamName] = useState('');
  const [famRelation, setFamRelation] = useState('Spouse');
  const [famAge, setFamAge] = useState('');

  // Address states
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  // Order history
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Prescription history
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBloodGroup(user.bloodGroup || '');
      setAllergies(user.allergies || []);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders', {
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

  const fetchPrescriptions = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchPrescriptions();
    }
  }, [token, activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, bloodGroup, allergies })
      });
      const data = await res.json();
      if (data.success) {
        updateLocalUser(data.user);
        showToast('Profile credentials updated!', 'success');
      }
    } catch (error) {
      console.error(error);
      showToast('Profile update failed.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (allergiesInput && !allergies.includes(allergiesInput.trim())) {
      setAllergies([...allergies, allergiesInput.trim()]);
      setAllergiesInput('');
    }
  };

  const handleRemoveAllergy = (allergyToRemove) => {
    setAllergies(allergies.filter(a => a !== allergyToRemove));
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    if (!famName || !famAge) return;

    const newMember = { name: famName, relation: famRelation, age: Number(famAge) };
    const updatedFamily = [...(user.familyMembers || []), newMember];

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ familyMembers: updatedFamily })
      });
      const data = await res.json();
      if (data.success) {
        updateLocalUser(data.user);
        setFamName('');
        setFamAge('');
        showToast('Family member added.', 'success');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteFamilyMember = async (idToDelete) => {
    const updatedFamily = user.familyMembers.filter(m => m._id !== idToDelete);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ familyMembers: updatedFamily })
      });
      const data = await res.json();
      if (data.success) {
        updateLocalUser(data.user);
        showToast('Family member removed.', 'info');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrState || !addrZip) return;

    const newAddr = { street: addrStreet, city: addrCity, state: addrState, zip: addrZip };
    const updatedAddresses = [...(user.addresses || []), newAddr];

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: updatedAddresses })
      });
      const data = await res.json();
      if (data.success) {
        updateLocalUser(data.user);
        setAddrStreet('');
        setAddrCity('');
        setAddrState('');
        setAddrZip('');
        showToast('Address added to profile!', 'success');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAddress = async (idToDelete) => {
    const updatedAddresses = user.addresses.filter(a => a._id !== idToDelete);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: updatedAddresses })
      });
      const data = await res.json();
      if (data.success) {
        updateLocalUser(data.user);
        showToast('Address deleted.', 'info');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReorder = async (orderItems) => {
    let successCount = 0;
    for (const item of orderItems) {
      const added = await addToCart(item.medicineId, item.qty);
      if (added) successCount++;
    }
    if (successCount > 0) {
      showToast(`Added ${successCount} medicines back to cart!`, 'success');
      setCurrentPage('cart');
    }
  };

  const handleTrackOrder = (id) => {
    setOrderId(id);
    setCurrentPage('tracking');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-bold">Please login to view profile</h2>
        <button onClick={() => setCurrentPage('auth')} className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold">
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Side: Avatar and Sidebar Tabs (4 cols) */}
        <div className="w-full md:w-1/4 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-center space-y-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt="avatar"
              className="h-24 w-24 rounded-full border border-primary/20 bg-slate-50 mx-auto"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{user.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
            <span className="inline-block px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase dark:bg-secondary/10 dark:text-secondary">
              Role: {user.role}
            </span>
          </div>

          {/* Navigation Sidebar */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 ${activeTab === 'personal' ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350'}`}
            >
              <User className="h-4 w-4" /> Personal & Family Details
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 ${activeTab === 'addresses' ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350'}`}
            >
              <MapPin className="h-4 w-4" /> Saved Addresses
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350'}`}
            >
              <Clock className="h-4 w-4" /> Order History
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 ${activeTab === 'health' ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350'}`}
            >
              <FileText className="h-4 w-4" /> Health Reports & Reminders
            </button>
          </div>
        </div>

        {/* Right Side: Tab Panel (8 cols) */}
        <div className="w-full md:w-3/4">
          
          {/* 1. Personal & Family panel */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              
              {/* Profile Details Edit form */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2">Profile Information</h3>
                
                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-350"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  {/* Allergy checklist logs */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Allergies</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="E.g. Penicillin, Peanuts"
                        value={allergiesInput}
                        onChange={(e) => setAllergiesInput(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleAddAllergy}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shrink-0 dark:bg-slate-700"
                      >
                        Add
                      </button>
                    </div>

                    {/* Allergies tags render */}
                    {allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {allergies.map(a => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold dark:bg-red-950/20"
                          >
                            <ShieldAlert className="h-3 w-3" /> {a}
                            <button type="button" onClick={() => handleRemoveAllergy(a)} className="hover:text-red-700 font-bold ml-1">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t dark:border-slate-700 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow btn-scale"
                    >
                      {savingProfile ? 'Saving...' : 'Update Details'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Family Members list */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Family Members
                </h3>

                {/* Form input */}
                <form onSubmit={handleAddFamilyMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Ananya Verma"
                      value={famName}
                      onChange={(e) => setFamName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Relation</label>
                    <select
                      value={famRelation}
                      onChange={(e) => setFamRelation(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs outline-none text-slate-750"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                    </select>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-grow">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Age</label>
                      <input
                        type="number"
                        required
                        placeholder="35"
                        value={famAge}
                        onChange={(e) => setFamAge(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </form>

                {/* Listing */}
                {!user.familyMembers || user.familyMembers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-xl">No family members registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {user.familyMembers.map(member => (
                      <div key={member._id} className="p-3 border border-slate-100 dark:border-slate-750 rounded-xl flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{member.name}</p>
                          <p className="text-[10px] text-slate-400">{member.relation} | Age: {member.age}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteFamilyMember(member._id)}
                          className="text-xs font-bold text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 2. Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Addresses
              </h3>

              {/* Add Address Form */}
              <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="102 Health Avenue"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ZIP / Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="560001"
                    value={addrZip}
                    onChange={(e) => setAddrZip(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>

              {/* Addresses Listing */}
              {!user.addresses || user.addresses.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-xl font-medium">No saved addresses found. Add one above.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl flex justify-between items-start bg-slate-50/20 dark:bg-slate-900/10">
                      <div className="text-xs text-slate-650 dark:text-slate-300 space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.zip}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-xs font-bold text-red-500 hover:underline shrink-0 ml-4"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Orders history Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Order History
              </h3>

              {loadingOrders ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-slate-450 text-xs bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                  No orders recorded yet. Visit the catalog to order medicines.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <div key={o._id} className="p-4 border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                          ID: #{o._id.substring(18)}
                        </p>
                        <p className="text-[10px] text-slate-450 font-medium">
                          Placed: {new Date(o.createdAt).toLocaleDateString()} | Method: {o.paymentMethod}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary rounded font-bold uppercase">
                            Status: {o.status}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 bg-slate-200 text-slate-650 dark:bg-slate-700 dark:text-slate-300 rounded font-bold">
                            Total: ₹{o.totalAmount}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleTrackOrder(o._id)}
                          className="px-3.5 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Track Delivery
                        </button>
                        
                        <button
                          onClick={() => handleReorder(o.items)}
                          className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-dark text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3 animate-spin-slow" /> Re-Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Health logs Tab */}
          {activeTab === 'health' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Prescriptions summary list */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 flex justify-between items-center">
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Prescriptions</span>
                  <button onClick={() => setCurrentPage('prescriptions')} className="text-[10px] text-primary hover:underline font-bold uppercase">View All</button>
                </h3>
                
                {prescriptions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-xl">No prescription uploads found.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {prescriptions.slice(0, 3).map(rx => (
                      <div key={rx._id} className="p-2 border rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-900 text-xs font-medium">
                        <div className="truncate pr-4">
                          <p className="font-bold truncate text-slate-800 dark:text-slate-200">Doc: {rx.doctorName || 'Self'}</p>
                          <p className="text-[9px] text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${rx.status === 'Verified' ? 'bg-secondary/20 text-secondary-dark' : rx.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {rx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reminders summary list */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 flex justify-between items-center">
                  <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Active Alarms</span>
                  <button onClick={() => setCurrentPage('reminders')} className="text-[10px] text-primary hover:underline font-bold uppercase">Configure</button>
                </h3>

                {reminders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-xl">No medicine reminders configured.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {reminders.slice(0, 3).map(r => (
                      <div key={r._id} className="p-2 border rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-900 text-xs font-medium">
                        <div>
                          <p className="font-bold text-slate-850 dark:text-slate-200">{r.medicineName}</p>
                          <p className="text-[9px] text-slate-400">{r.frequency} | {r.slot}</p>
                        </div>
                        <span className="font-extrabold text-primary dark:text-secondary">{r.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
