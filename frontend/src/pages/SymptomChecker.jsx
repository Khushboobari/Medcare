import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HelpCircle, Check, RefreshCw, ShoppingCart } from 'lucide-react';

const SymptomChecker = ({ setSelectedMedicineId, setCurrentPage }) => {
  const { addToCart, showToast } = useApp();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(false);

  const symptomList = [
    { id: 'Fever', label: '🌡️ Body Fever / High Heat' },
    { id: 'Headache', label: '🧠 Severe Headache' },
    { id: 'Body Pain', label: '💪 Muscular / Joint Aches' },
    { id: 'Cough', label: '🗣️ Cough / Throat Congestion' },
    { id: 'Sore Throat', label: '🧣 Sore Throat / Scratchiness' },
    { id: 'Runny Nose', label: '💧 Runny Nose / Sneezing' },
    { id: 'Acidity', label: '🔥 Stomach Acidity' },
    { id: 'Gas', label: '🎈 Flatulence / Bloating' },
    { id: 'Heartburn', label: '❤️ Heartburn / Acid Reflux' },
    { id: 'Weakness', label: '🔋 General Weakness / Tiredness' },
    { id: 'Fatigue', label: '💤 Chronic Fatigue' },
    { id: 'Cuts', label: '🩹 Minor Cuts / Scratches' },
    { id: 'Minor Burns', label: '🔥 Skin Burn Dressing' },
    { id: 'Skin Rash', label: '🔴 Red Rashes / Itchiness' },
    { id: 'Dry Skin', label: '🧴 Flaky / Dry Face skin' }
  ];

  const handleCheckboxToggle = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== id));
    } else {
      setSelectedSymptoms(prev => [...prev, id]);
    }
  };

  const handleCheckSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      showToast('Please select at least one symptom to analyze.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms })
      });
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestedMedicines);
        setDisclaimer(data.disclaimer);
      }
    } catch (error) {
      console.error(error);
      showToast('Error querying symptom suggestions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setSuggestions([]);
    setDisclaimer('');
  };

  const handleCardClick = (id) => {
    setSelectedMedicineId(id);
    setCurrentPage('detail');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Symptom OTC Matcher</h1>
        <p className="text-slate-400 text-sm">Select symptoms you are experiencing to retrieve standard over-the-counter remedies suggestions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Checkboxes list (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">1. Select Symptoms</h2>
          
          <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {symptomList.map((symptom) => {
              const isChecked = selectedSymptoms.includes(symptom.id);
              return (
                <div
                  key={symptom.id}
                  onClick={() => handleCheckboxToggle(symptom.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${isChecked ? 'border-primary bg-primary/5 dark:border-secondary dark:bg-secondary/5' : 'border-slate-100 hover:bg-slate-50 dark:border-slate-700'}`}
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{symptom.label}</span>
                  <div className={`h-5 w-5 rounded border flex items-center justify-center ${isChecked ? 'bg-primary border-primary text-white dark:bg-secondary dark:border-secondary dark:text-slate-900' : 'border-slate-300'}`}>
                    {isChecked && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCheckSymptoms}
              disabled={loading || selectedSymptoms.length === 0}
              className="flex-grow py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow btn-scale disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Matching Remedies...' : 'Find OTC Suggestions'}
            </button>
            
            {selectedSymptoms.length > 0 && (
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-sm"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Suggestions List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">2. Suggested OTC Remedies</h2>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-slate-400 text-xs">Querying medicine databases...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                Select your symptoms on the left to see recommended over-the-counter medicines.
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {suggestions.map((med) => (
                  <div
                    key={med._id}
                    className="p-4 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20 rounded-2xl flex gap-4 hover:border-primary/20 transition-all text-left"
                  >
                    {/* Visual */}
                    <div 
                      onClick={() => handleCardClick(med._id)}
                      className="h-20 w-20 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden cursor-pointer shrink-0 flex items-center justify-center p-1"
                    >
                      <img src={med.image} alt={med.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-grow space-y-1">
                      <div className="flex justify-between items-start gap-3">
                        <h3 
                          onClick={() => handleCardClick(med._id)}
                          className="font-bold text-sm text-slate-850 dark:text-slate-100 line-clamp-1 hover:text-primary cursor-pointer"
                        >
                          {med.name}
                        </h3>
                        <span className="font-black text-sm text-slate-800 dark:text-white shrink-0">₹{med.price}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{med.brand} | {med.category}</p>
                      
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {med.description}
                      </p>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-slate-400 italic">Composition: {med.salt}</span>
                        <button
                          onClick={() => addToCart(med._id, 1)}
                          className="px-3 py-1 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition-transform btn-scale shadow-sm shadow-primary/10"
                        >
                          <ShoppingCart className="h-3 w-3" /> Add to Cart
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Disclaimer Section */}
      {disclaimer && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-start gap-3 text-red-650 dark:text-red-400">
          <HelpCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium">
            {disclaimer}
          </p>
        </div>
      )}

    </div>
  );
};

export default SymptomChecker;
