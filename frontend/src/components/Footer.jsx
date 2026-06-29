import React from 'react';
import { Stethoscope, MapPin, Phone, Mail, ExternalLink, Heart } from 'lucide-react';

const Footer = ({ setCurrentPage }) => {
  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-400 border-t border-slate-800 animate-slide-up">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/20 rounded-xl">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-black text-white">
                Med<span className="text-secondary">Care</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Your premium digital health partner. Genuine medicines, wellness items, and reliable medical diagnostics delivered right to your doorstep.
            </p>
            {/* Badge row */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['FSSAI Certified', 'ISO 9001:2015', '24/7 Support'].map(badge => (
                <span key={badge} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Medicines Shop',       page: 'shop' },
                { label: 'Symptom Checker',      page: 'symptom-checker' },
                { label: 'Drug Interaction',     page: 'interaction-checker' },
                { label: 'Medicine Reminders',   page: 'reminders' },
                { label: 'Prescription Upload',  page: 'prescriptions' },
              ].map(link => (
                <li key={link.page}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="hover:text-primary transition-colors text-left flex items-center gap-1.5 group"
                  >
                    <span className="h-1 w-1 bg-slate-600 group-hover:bg-primary rounded-full transition-colors" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Info */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Account & Info</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'My Profile',    page: 'profile' },
                { label: 'My Orders',     page: 'profile' },
                { label: 'Cart',          page: 'cart' },
              ].map(link => (
                <li key={link.label}>
                  <button onClick={() => navigate(link.page)} className="hover:text-primary transition-colors text-left flex items-center gap-1.5 group">
                    <span className="h-1 w-1 bg-slate-600 group-hover:bg-primary rounded-full transition-colors" />
                    {link.label}
                  </button>
                </li>
              ))}
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Refund Policy', href: '#' },
              ].map(link => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                    <span className="h-1 w-1 bg-slate-600 group-hover:bg-primary rounded-full transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Connect With Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>101, Medical Park Drive, Koramangala, Bangalore – 560034</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+918044556677" className="hover:text-primary transition-colors">+91 80 4455 6677</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:support@medcare.com" className="hover:text-primary transition-colors">support@medcare.com</a>
              </li>
            </ul>
            <div className="mt-4 text-[11px] text-slate-600 border-t border-slate-800 pt-3">
              <p>GST Reg: 29AAAAA1111A1Z1</p>
              <p className="mt-0.5">Drug License: KA-B1-1234567</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>© 2026 MedCare Store. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for better healthcare.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
