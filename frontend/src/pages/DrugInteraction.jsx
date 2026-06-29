import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle, Activity } from 'lucide-react';

const DrugInteraction = () => {
  const { showToast } = useApp();
  const [med1, setMed1] = useState('');
  const [med2, setMed2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testChips = [
    { name1: 'Dexorange Syrup', name2: 'Gelusil Liquid MPS', label: 'Iron + Antacid (Warning)' },
    { name1: 'Crocin Pain Relief', name2: 'Mox-500 Capsule', label: 'Paracetamol + Amoxicillin (Safe)' },
    { name1: 'Crocin Pain Relief', name2: 'Ibugesic 400', label: 'Paracetamol + Ibuprofen (Warning)' },
    { name1: 'Mox-500 Capsule', name2: 'Lipivas 10', label: 'Amoxicillin + Cholesterol (Safe)' }
  ];

  const handleCheckInteraction = async (e, customMed1, customMed2) => {
    if (e) e.preventDefault();
    
    const m1 = customMed1 || med1;
    const m2 = customMed2 || med2;

    if (!m1 || !m2) {
      showToast('Please enter both medicine names to run check.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/drug-interactions?med1=${encodeURIComponent(m1)}&med2=${encodeURIComponent(m2)}`);
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        showToast(data.message || 'Verification failed. Make sure names are spelled correctly.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Interaction checker error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip) => {
    setMed1(chip.name1);
    setMed2(chip.name2);
    handleCheckInteraction(null, chip.name1, chip.name2);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Drug Interaction Checker</h1>
        <p className="text-slate-400 text-sm">Verify safety parameters and matching chemical conflicts before taking multiple medicines</p>
      </div>

      {/* Main Checker Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Input Form Column (5 cols) */}
        <form onSubmit={handleCheckInteraction} className="md:col-span-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">First Medicine Name</label>
            <input
              type="text"
              required
              placeholder="E.g. Crocin Pain Relief"
              value={med1}
              onChange={(e) => setMed1(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-colors font-medium"
            />
          </div>

          <div className="flex justify-center py-1">
            <span className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-xs text-slate-400 select-none">
              VS
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Second Medicine Name</label>
            <input
              type="text"
              required
              placeholder="E.g. Gelusil Liquid MPS"
              value={med2}
              onChange={(e) => setMed2(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-colors font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow btn-scale"
          >
            {loading ? 'Analyzing Compounds...' : 'Check Interactions'}
          </button>
        </form>

        {/* Results/Instructions Column (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-center min-h-[220px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 pt-6 md:pt-0 md:pl-8">
          {result ? (
            <div className="space-y-4">
              
              {/* Outcome Badge Card */}
              {result.status === 'Safe' && (
                <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-center gap-3 text-secondary-dark dark:text-secondary">
                  <CheckCircle2 className="h-6 w-6 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-sm">Outcome: SAFE CHECK</h3>
                    <p className="text-[10px] opacity-90 mt-0.5">No immediate compound conflict found in directory.</p>
                  </div>
                </div>
              )}

              {result.status === 'Warning' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 text-amber-600 dark:text-amber-300">
                  <AlertTriangle className="h-6 w-6 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-sm">Outcome: WARNING WARNING</h3>
                    <p className="text-[10px] opacity-90 mt-0.5">Minor absorption delay or gastric discomfort possible.</p>
                  </div>
                </div>
              )}

              {result.status === 'Dangerous' && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                  <ShieldAlert className="h-6 w-6 shrink-0 animate-bounce" />
                  <div>
                    <h3 className="font-extrabold text-sm">Outcome: DANGEROUS CONFLICT</h3>
                    <p className="text-[10px] opacity-90 mt-0.5">High clinical risk. Severe side-effects or toxicity possible.</p>
                  </div>
                </div>
              )}

              {/* Composition detail summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2 text-xs">
                <p className="text-slate-600 dark:text-slate-350">
                  <span className="font-bold text-slate-800 dark:text-white">{result.med1.name}:</span> {result.med1.salt}
                </p>
                <p className="text-slate-600 dark:text-slate-350">
                  <span className="font-bold text-slate-800 dark:text-white">{result.med2.name}:</span> {result.med2.salt}
                </p>
              </div>

              {/* Description explanation */}
              <p className="text-xs text-slate-500 leading-relaxed">
                {result.description}
              </p>

            </div>
          ) : (
            <div className="text-center md:text-left space-y-3 py-6">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary dark:bg-secondary/10 dark:text-secondary mx-auto md:mx-0">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Run a Chemical Analysis</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Enter two medicine names exactly as they are named in our shop. Our algorithm matches active ingredients (salts) to find risks like absorption blocking, bleeding risks, or liver toxicity.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Quick Test Chips section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Quick Test Examples</h3>
        <div className="flex flex-wrap gap-2">
          {testChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-855 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary transition-colors flex items-center gap-1.5 btn-scale"
            >
              🚀 {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
          Disclaimer: This check is generated based on standard chemical compound indexes. It is NOT a substitute for professional clinical advice. Always consult your doctor or registered physician before modifying or combined taking any medications.
        </p>
      </div>

    </div>
  );
};

export default DrugInteraction;
