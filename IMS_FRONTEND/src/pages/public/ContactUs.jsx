import React, { useState } from 'react';
import { CheckCircle, Phone, Mail, MapPin, Send, Loader } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:4000';

const COURSES = [
  'B.Tech', 'M.Tech', 'MBA', 'BBA', 'B.Sc', 'M.Sc',
  'B.Com', 'M.Com', 'BCA', 'MCA', 'B.Ed', 'Other',
];

const SOURCES = ['Website', 'Google', 'Facebook', 'Instagram', 'Friend / Referral', 'Other'];

export default function ContactUs() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', course: '', source: 'Website', city: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');
    try {
      await axios.post(`${API_BASE}/api/public/leads`, {
        name:   form.name.trim(),
        email:  form.email.trim() || undefined,
        phone:  form.phone.trim(),
        source: form.source,
        course: form.course || undefined,
        city:   form.city.trim() || undefined,
        notes:  form.notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `block w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field]
        ? 'border-red-400 bg-red-50 text-gray-900'
        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
    }`;

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-9 w-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">We'll be in touch!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Thanks for reaching out, <span className="font-medium text-gray-700">{form.name}</span>.
            One of our counselors will contact you shortly on <span className="font-medium text-gray-700">{form.phone}</span>.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', course: '', source: 'Website', city: '', notes: '' }); }}
            className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-14 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-blue-100 text-base md:text-lg max-w-xl mx-auto">
          Interested in our programs? Fill in your details and a counselor will reach out to you within 24 hours.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Contact info sidebar */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              {[
                { icon: Phone, label: 'Call Us', value: '+91 98765 43210' },
                { icon: Mail,  label: 'Email Us', value: 'admissions@institute.edu' },
                { icon: MapPin, label: 'Visit Us', value: '123 Education Lane, Knowledge City' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="text-sm text-gray-800 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Office hours */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Office Hours</h3>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="flex justify-between"><span>Mon – Fri</span><span className="font-medium">9:00 AM – 6:00 PM</span></div>
              <div className="flex justify-between"><span>Saturday</span><span className="font-medium">10:00 AM – 4:00 PM</span></div>
              <div className="flex justify-between"><span>Sunday</span><span className="font-medium text-blue-400">Closed</span></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enquiry Form</h2>
            <p className="text-sm text-gray-500 mb-6">All fields marked <span className="text-red-500">*</span> are required.</p>

            {serverError && (
              <div className="mb-5 rounded-lg p-4 bg-red-50 border border-red-200 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Your full name"
                    className={inputCls('name')}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className={inputCls('phone')}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder="Your city"
                    className={inputCls('city')}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Course of Interest</label>
                  <select value={form.course} onChange={e => set('course', e.target.value)} className={inputCls('course')}>
                    <option value="">Select a course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">How did you hear about us?</label>
                  <select value={form.source} onChange={e => set('source', e.target.value)} className={inputCls('source')}>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message / Questions</label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Tell us anything you'd like us to know — preferred batch, specific queries, etc."
                  className={inputCls('notes')}
                />
              </div>

              {/* Privacy note */}
              <p className="text-xs text-gray-400 leading-relaxed">
                By submitting this form you agree to be contacted by our admissions team. We respect your privacy and will never share your information with third parties.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? (
                  <><Loader className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="h-4 w-4" /> Submit Enquiry</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-gray-200 bg-white py-5 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Institute Management System. All rights reserved.
      </div>
    </div>
  );
}
