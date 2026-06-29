import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, BellOff, Plus, Trash2, Edit, Calendar, Clock, Sparkles } from 'lucide-react';

const Reminder = ({ setCurrentPage }) => {
  const { token, reminders, saveReminder, deleteReminder, showToast } = useApp();
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  // Form states
  const [editId, setEditId] = useState('');
  const [medName, setMedName] = useState('');
  const [remTime, setRemTime] = useState('08:00');
  const [remFreq, setRemFreq] = useState('Daily');
  const [remSlot, setRemSlot] = useState('Morning'); // Morning | Afternoon | Night
  const [formOpen, setFormOpen] = useState(false);

  // Ask for permission
  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        showToast('Browser notifications enabled successfully!', 'success');
      } else {
        showToast('Browser notifications permission denied.', 'warning');
      }
    } else {
      showToast('This browser does not support desktop notifications.', 'error');
    }
  };

  // Automated notification checker
  useEffect(() => {
    if (notificationPermission !== 'granted' || reminders.length === 0) return;

    // Check every 60 seconds
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      reminders.forEach((r) => {
        if (r.active && r.time === currentTimeString) {
          // Fire notification
          try {
            new Notification(`MedCare Reminder: ${r.medicineName}`, {
              body: `Time to take your scheduled dosage (${r.slot} slot - ${r.time})`,
              icon: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100'
            });
            console.log(`[Notification Fired] MedCare alarm for: ${r.medicineName}`);
          } catch (err) {
            console.error("Failed to trigger desktop notification:", err);
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders, notificationPermission]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!medName || !remTime) {
      showToast('Please fill medicine name and alarm time.', 'error');
      return;
    }

    const payload = {
      medicineName: medName,
      time: remTime,
      frequency: remFreq,
      slot: remSlot
    };

    if (editId) payload.id = editId;

    const success = await saveReminder(payload);
    if (success) {
      // Reset form
      setMedName('');
      setRemTime('08:00');
      setRemFreq('Daily');
      setRemSlot('Morning');
      setEditId('');
      setFormOpen(false);
    }
  };

  const handleEditInit = (r) => {
    setEditId(r._id);
    setMedName(r.medicineName);
    setRemTime(r.time);
    setRemFreq(r.frequency);
    setRemSlot(r.slot);
    setFormOpen(true);
  };

  const handleToggleActive = async (r) => {
    const payload = {
      id: r._id,
      medicineName: r.medicineName,
      time: r.time,
      frequency: r.frequency,
      slot: r.slot,
      active: !r.active
    };
    await saveReminder(payload);
  };

  // Group reminders by slots for schedule view
  const morningReminders = reminders.filter(r => r.slot === 'Morning');
  const afternoonReminders = reminders.filter(r => r.slot === 'Afternoon');
  const nightReminders = reminders.filter(r => r.slot === 'Night');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Medicine Reminders</h1>
          <p className="text-slate-400 text-sm">Schedule pill intake alarms and configure browser desktop alerts</p>
        </div>

        {/* Notification Status */}
        <div className="shrink-0 flex items-center gap-3">
          {notificationPermission === 'granted' ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-secondary/15 text-secondary-dark dark:text-secondary rounded-xl text-xs font-semibold">
              <Bell className="h-4 w-4" /> Notifications Enabled
            </span>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold transition-transform btn-scale"
            >
              <BellOff className="h-4 w-4" /> Enable Browser Notifications
            </button>
          )}

          <button
            onClick={() => setFormOpen(!formOpen)}
            className="px-4 py-1.5 bg-slate-850 dark:bg-slate-700 text-white rounded-xl text-xs font-bold transition-transform btn-scale flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> {formOpen ? 'Close Form' : 'Add Alarms'}
          </button>
        </div>
      </div>

      {/* Form Dialog Box */}
      {formOpen && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm max-w-xl">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 mb-4">
            {editId ? 'Modify Medicine Alarm' : 'Create Pill Intake Alarm'}
          </h3>
          
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Medicine Name</label>
              <input
                type="text"
                required
                placeholder="E.g. Crocin 650mg"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Daily Slot</label>
              <select
                value={remSlot}
                onChange={(e) => setRemSlot(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-350"
              >
                <option value="Morning">Morning Schedule</option>
                <option value="Afternoon">Afternoon Schedule</option>
                <option value="Night">Night Schedule</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Alarm Time (HH:MM)</label>
              <input
                type="time"
                required
                value={remTime}
                onChange={(e) => setRemTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-1.5 text-xs outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Frequency</label>
              <select
                value={remFreq}
                onChange={(e) => setRemFreq(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-350"
              >
                <option value="Daily">Everyday (Daily)</option>
                <option value="Weekly">Alternate Days (Weekly)</option>
              </select>
            </div>

            <div className="col-span-2 pt-2 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow btn-scale"
              >
                {editId ? 'Save Edits' : 'Save Alarm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditId('');
                  setMedName('');
                  setFormOpen(false);
                }}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Morning / Afternoon / Night slots view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Morning Slot Column */}
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-b-2 border-amber-400 rounded-t-2xl flex items-center justify-between">
            <span className="font-bold text-sm text-amber-700 dark:text-amber-300">🌅 Morning Alarms</span>
            <span className="text-xs font-semibold text-amber-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">
              {morningReminders.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {morningReminders.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-b-2xl text-center text-slate-400 text-xs">
                No morning pills scheduled.
              </div>
            ) : (
              morningReminders.map(r => (
                <ReminderCard key={r._id} r={r} onEdit={handleEditInit} onDelete={deleteReminder} onToggle={handleToggleActive} />
              ))
            )}
          </div>
        </div>

        {/* Afternoon Slot Column */}
        <div className="space-y-4">
          <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border-b-2 border-sky-400 rounded-t-2xl flex items-center justify-between">
            <span className="font-bold text-sm text-sky-700 dark:text-sky-300">☀️ Afternoon Alarms</span>
            <span className="text-xs font-semibold text-sky-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">
              {afternoonReminders.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {afternoonReminders.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-b-2xl text-center text-slate-400 text-xs">
                No afternoon pills scheduled.
              </div>
            ) : (
              afternoonReminders.map(r => (
                <ReminderCard key={r._id} r={r} onEdit={handleEditInit} onDelete={deleteReminder} onToggle={handleToggleActive} />
              ))
            )}
          </div>
        </div>

        {/* Night Slot Column */}
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border-b-2 border-indigo-400 rounded-t-2xl flex items-center justify-between">
            <span className="font-bold text-sm text-indigo-700 dark:text-indigo-300">🌙 Night Alarms</span>
            <span className="text-xs font-semibold text-indigo-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">
              {nightReminders.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {nightReminders.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-b-2xl text-center text-slate-400 text-xs">
                No night pills scheduled.
              </div>
            ) : (
              nightReminders.map(r => (
                <ReminderCard key={r._id} r={r} onEdit={handleEditInit} onDelete={deleteReminder} onToggle={handleToggleActive} />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Browser trigger info bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed">
          <h4 className="font-bold text-slate-700 dark:text-white mb-0.5">Automated Desktop Reminders</h4>
          <p>MedCare keeps a client-side timer checking active reminders. When the timer hits the schedule (e.g. 08:00), a native browser pop-up is fired directly. Keep this page open in a tab to receive alerts.</p>
        </div>
      </div>

    </div>
  );
};

// Sub-component card
const ReminderCard = ({ r, onEdit, onDelete, onToggle }) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm flex justify-between items-center hover:border-primary/20 transition-all">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
            {r.medicineName}
          </span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {r.frequency}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-[11px] text-primary dark:text-secondary font-bold">
          <Clock className="h-3.5 w-3.5" /> {r.time}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(r)}
          className={`h-5 w-10 rounded-full p-0.5 transition-colors ${r.active ? 'bg-secondary' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <div className={`h-4 w-4 bg-white rounded-full transition-transform shadow-sm ${r.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(r)}
          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600"
          title="Edit Alarm"
        >
          <Edit className="h-4 w-4" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(r._id)}
          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-500"
          title="Delete Alarm"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Reminder;
