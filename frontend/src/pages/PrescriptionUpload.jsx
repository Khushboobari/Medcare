import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UploadCloud, FileText, CheckCircle, Clock, XCircle, ArrowUpRight, Plus } from 'lucide-react';

const PrescriptionUpload = ({ setCurrentPage }) => {
  const { token, showToast } = useApp();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Upload states
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.prescriptions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    } else {
      setLoadingHistory(false);
    }
  }, [token]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Please login to upload prescriptions.', 'warning');
      setCurrentPage('auth');
      return;
    }
    if (!file) {
      showToast('Please select a file to upload.', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('prescription', file);
    formData.append('doctorName', doctorName);
    formData.append('notes', notes);

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('Prescription uploaded successfully! Under review.', 'success');
        setFile(null);
        setPreview('');
        setDoctorName('');
        setNotes('');
        fetchHistory(); // Refresh history
      } else {
        showToast(data.message || 'Upload failed.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Network error during upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Prescription Uploads</h1>
        <p className="text-slate-400 text-sm">Upload medical prescriptions for pharmacist authorization and quick order enablement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Upload Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" /> Upload New Prescription
          </h2>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Doctor Name</label>
              <input
                type="text"
                placeholder="Dr. Rajesh Kumar"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Additional Notes</label>
              <textarea
                rows={3}
                placeholder="E.g. Repeat dosage instructions or specific brand replacements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="h-10 w-10 text-primary mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">Drag & Drop prescription copy</p>
              <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>

            {/* Preview display */}
            {preview && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border flex flex-col items-center">
                {file?.name?.endsWith('.pdf') ? (
                  <div className="p-4 bg-primary/10 rounded-xl text-primary font-bold text-xs">
                    📄 PDF Document attached
                  </div>
                ) : (
                  <img src={preview} alt="attached preview" className="h-28 max-w-full object-contain rounded-lg border shadow-sm" />
                )}
                <p className="text-[10px] text-slate-500 font-semibold truncate max-w-xs mt-2">{file?.name}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow btn-scale flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {uploading ? 'Uploading File...' : 'Upload Prescription'}
            </button>
          </form>
        </div>

        {/* Right Side: Upload History (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Upload History
          </h2>

          {!token ? (
            <div className="text-center p-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 rounded-xl">
              Please log in to view your prescription records history.
            </div>
          ) : loadingHistory ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 rounded-xl">
              No prescription uploads found in your history log.
            </div>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {history.map((rx) => {
                let statusColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
                let statusIcon = <Clock className="h-4 w-4" />;
                if (rx.status === 'Verified') {
                  statusColor = 'text-secondary bg-secondary/15';
                  statusIcon = <CheckCircle className="h-4 w-4" />;
                } else if (rx.status === 'Rejected') {
                  statusColor = 'text-red-500 bg-red-50 dark:bg-red-950/20';
                  statusIcon = <XCircle className="h-4 w-4" />;
                }

                return (
                  <div key={rx._id} className="p-4 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 rounded-2xl flex justify-between items-center gap-4 hover:border-primary/20 transition-all">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${statusColor}`}>
                          {statusIcon} {rx.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(rx.date || rx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Doctor: {rx.doctorName || 'Self/Unknown'}
                      </p>

                      {rx.notes && (
                        <p className="text-[10px] text-slate-500 italic truncate max-w-md">
                          Note: "{rx.notes}"
                        </p>
                      )}
                    </div>

                    <a
                      href={rx.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-sm shrink-0 flex items-center gap-1 text-[10px] font-bold"
                    >
                      View File <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default PrescriptionUpload;
