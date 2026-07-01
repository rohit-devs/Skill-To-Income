import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SKILLS = ['Design','Writing','Data','Social Media','Video','Coding','Research','Excel','Canva','Marketing'];

const ROLES = [
  { id: 'student',  label: 'Student',  icon: 'school',    desc: 'Earn by completing tasks' },
  { id: 'business', label: 'Business', icon: 'storefront', desc: 'Post tasks, hire talent' },
  { id: 'company',  label: 'Company',  icon: 'domain',    desc: 'Scale with verified talent' },
];

function InputField({ label, id, hint, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-on-sv">{label}</label>
      {children || (
        <input
          id={id}
          className={`w-full px-4 py-3 bg-s-mid rounded-xl text-[14px] text-on-surface
            border transition-all duration-200 outline-none placeholder:text-outline
            focus:border-primary focus:ring-2 focus:ring-primary/20
            ${error ? 'border-error/50' : 'border-outline-v/30'}`}
          {...props}
        />
      )}
      {hint  && <p className="text-[11px] text-on-sv/60">{hint}</p>}
      {error && <p className="text-[11px] text-error font-semibold">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [params]   = useSearchParams();
  const { register, loading, error } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: params.get('role') || 'student',
    college: '', city: '', skills: [],
    whatsapp: '', businessName: '',
  });
  const [otpSent, setOtpSent]         = useState(false);
  const [otp, setOtp]                 = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [localErr, setLocalErr]       = useState('');

  useEffect(() => {
    setForm(f => ({ ...f, role: params.get('role') || 'student' }));
  }, [params]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleSkill = (s) =>
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s],
    }));

  const sendOtp = () => {
    if (!form.whatsapp || form.whatsapp.replace(/\D/g, '').length < 10) {
      setLocalErr('Enter a valid 10-digit WhatsApp number first');
      return;
    }
    setOtpSent(true);
    setLocalErr('');
  };

  const verifyOtp = () => {
    if (otp === '123456' || otp.length >= 4) {
      setOtpVerified(true);
      setLocalErr('');
    } else {
      setLocalErr('Invalid OTP. Use 123456 for demo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr('');
    if (form.role === 'student' && form.skills.length === 0) {
      setLocalErr('Please select at least one skill.');
      return;
    }
    try {
      const u = await register({ ...form, isVerified: otpVerified });
      navigate(u.role === 'student' ? '/dashboard' : '/my-tasks');
    } catch { /* AuthContext exposes error */ }
  };

  const isStudent  = form.role === 'student';
  const displayErr = error || localErr;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 py-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/4 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3525CD] to-[#4F46E5] shadow-xl shadow-indigo-950/50 mb-5 hover:-translate-y-0.5 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl icon-fill">trending_up</span>
          </Link>
          <h1 className="text-[24px] font-extrabold tracking-tight text-on-surface mb-1.5">Join Skill-To-Income</h1>
          <p className="text-[14px] text-on-sv">Start earning from your skills — completely free</p>
        </div>

        <div className="bg-s-low rounded-2xl border border-outline-v/30 shadow-2xl shadow-black/30 p-7 flex flex-col gap-5">

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(({ id, label, icon, desc }) => {
              const active = form.role === id;
              return (
                <button
                  key={id} type="button"
                  onClick={() => setForm(f => ({ ...f, role: id }))}
                  className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border text-center transition-all duration-200
                    ${active
                      ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                      : 'border-outline-v/30 bg-s-mid hover:border-outline/50 hover:bg-s-high'
                    }`}
                >
                  <span className={`material-symbols-outlined text-[22px] icon-fill ${active ? 'text-primary' : 'text-on-sv'}`}>
                    {icon}
                  </span>
                  <span className={`text-[12px] font-bold ${active ? 'text-primary' : 'text-on-sv'}`}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {displayErr && (
            <div className="flex items-start gap-2.5 bg-error/10 border border-error/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">error</span>
              <p className="text-[13px] text-error font-semibold">{displayErr}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Common fields */}
            <InputField id="name" label="Full name" value={form.name} onChange={set('name')} placeholder="Priya Sharma" required />
            <InputField id="email" label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            <InputField id="password" label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" required minLength={6}
              hint="Minimum 6 characters" />

            {/* Student fields */}
            {isStudent && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <InputField id="college" label="College" value={form.college} onChange={set('college')} placeholder="FAMT Ratnagiri" />
                  <InputField id="city"    label="City"    value={form.city}    onChange={set('city')}    placeholder="Ratnagiri" />
                </div>

                {/* WhatsApp + OTP */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-on-sv">WhatsApp</span>
                    {otpVerified
                      ? <span className="text-[10px] font-black text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                      : <span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">Unverified</span>
                    }
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-4 py-3 bg-s-mid rounded-xl text-[14px] text-on-surface border border-outline-v/30 outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
                      value={form.whatsapp} onChange={set('whatsapp')}
                      placeholder="+91 98765 43210" disabled={otpSent}
                    />
                    {!otpSent && !otpVerified && (
                      <button type="button" onClick={sendOtp}
                        className="px-4 py-2 bg-s-highest text-primary font-bold text-[12.5px] rounded-xl border border-outline-v/30 hover:border-primary/30 hover:bg-primary/5 transition-all">
                        Verify
                      </button>
                    )}
                  </div>
                  {otpSent && !otpVerified && (
                    <div className="flex gap-2 mt-1">
                      <input
                        className="flex-1 px-4 py-3 bg-s-mid rounded-xl text-[14px] text-on-surface border border-outline-v/30 outline-none placeholder:text-outline focus:border-primary transition-all"
                        value={otp} onChange={e => setOtp(e.target.value)}
                        placeholder="Enter OTP (123456 for demo)"
                      />
                      <button type="button" onClick={verifyOtp}
                        className="px-4 py-2 bg-gradient-to-br from-[#3525CD] to-[#4F46E5] text-white font-bold text-[12.5px] rounded-xl shadow-md hover:shadow-lg transition-all">
                        Confirm
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-on-sv/60">Verified students get 3× more task assignments</p>
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-on-sv">
                    Your skills <span className="text-error">*</span>
                    {form.skills.length > 0 && (
                      <span className="ml-2 text-primary font-black normal-case">{form.skills.length} selected</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map(s => (
                      <button
                        key={s} type="button" onClick={() => toggleSkill(s)}
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all duration-150
                          ${form.skills.includes(s)
                            ? 'bg-primary/15 text-primary border-primary/30 shadow-sm'
                            : 'bg-s-mid text-on-sv border-outline-v/30 hover:border-outline/50 hover:text-on-surface'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Business-only field */}
            {!isStudent && (
              <InputField id="businessName" label="Business / Company name" value={form.businessName} onChange={set('businessName')} placeholder="Ravi's Bakery" />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3.5 px-6 bg-gradient-to-br from-[#3525CD] to-[#4F46E5] text-white font-bold text-[14.5px] rounded-xl
                shadow-lg shadow-indigo-950/40 hover:shadow-xl hover:shadow-indigo-950/50 hover:-translate-y-px
                active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create Account <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
              }
            </button>
          </form>

          <p className="text-center text-[13px] text-on-sv">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
