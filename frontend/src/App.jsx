import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';

// Import Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import MedicineDetail from './pages/MedicineDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import PrescriptionUpload from './pages/PrescriptionUpload';
import DrugInteraction from './pages/DrugInteraction';
import Reminder from './pages/Reminder';
import SymptomChecker from './pages/SymptomChecker';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';

const MainApp = () => {
  const { authLoading } = useApp();
  const [currentPage, setCurrentPage] = useState('home'); // Routing State
  
  // Shared parameter states
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [shopFilters, setShopFilters] = useState({});

  // Conditionally render the body page based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setShopFilters={setShopFilters}
            setSelectedMedicineId={setSelectedMedicineId}
          />
        );
      case 'shop':
        return (
          <Shop
            filters={shopFilters}
            setFilters={setShopFilters}
            setSelectedMedicineId={setSelectedMedicineId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'detail':
        return (
          <MedicineDetail
            medicineId={selectedMedicineId}
            setSelectedMedicineId={setSelectedMedicineId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'cart':
        return (
          <Cart
            setCurrentPage={setCurrentPage}
            setCheckoutDetails={setCheckoutDetails}
          />
        );
      case 'checkout':
        return (
          <Checkout
            details={checkoutDetails}
            setOrderId={setSelectedOrderId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'tracking':
        return (
          <OrderTracking
            orderId={selectedOrderId}
            setOrderId={setSelectedOrderId}
          />
        );
      case 'prescriptions':
        return (
          <PrescriptionUpload
            setCurrentPage={setCurrentPage}
          />
        );
      case 'interaction-checker':
        return (
          <DrugInteraction />
        );
      case 'reminders':
        return (
          <Reminder
            setCurrentPage={setCurrentPage}
          />
        );
      case 'symptom-checker':
        return (
          <SymptomChecker
            setSelectedMedicineId={setSelectedMedicineId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'profile':
        return (
          <Profile
            setCurrentPage={setCurrentPage}
            setOrderId={setSelectedOrderId}
          />
        );
      case 'admin':
        return (
          <AdminDashboard />
        );
      case 'auth':
        return (
          <Auth
            setCurrentPage={setCurrentPage}
          />
        );
      default:
        // 404 page layout
        return (
          <div className="max-w-md mx-auto my-20 px-4 text-center space-y-6">
            <div className="relative inline-block select-none">
              <span className="text-[120px] font-black text-primary/10 dark:text-secondary/10">404</span>
              <span className="absolute inset-0 flex items-center justify-center text-4xl">🏥</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Dossier / Page Not Found</h2>
            <p className="text-slate-450 text-sm">The medicine cabinet or dashboard route you are trying to pull does not exist in our directory.</p>
            <button
              onClick={() => setCurrentPage('home')}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow btn-scale"
            >
              Back to Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header glass panel */}
      <Navbar setCurrentPage={setCurrentPage} />

      {/* Main content body */}
      <main className="flex-grow pb-16">
        {authLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-32 text-center">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-xs font-semibold">Authorizing MedCare session...</p>
          </div>
        ) : (
          <div key={currentPage} className="animate-slide-up">
            {renderPage()}
          </div>
        )}
      </main>

      {/* Footer information */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* Float sliding toasts */}
      <ToastContainer />

    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
