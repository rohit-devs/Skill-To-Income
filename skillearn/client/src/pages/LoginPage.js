import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_USERS = [
  ['student@demo.com',  '🎓 Student'],
  ['business@demo.com', '🏪 Business'],
  ['admin@demo.com',    '🛡️ Admin'],
];

const InputField = ({ label, id, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-on-sv">
      {label}
    </label>
    <input
      id={id}
      className={`w-full px-4 py-3 bg-s-mid rounded-xl text-[14px] text-on-surface
        border transition-all duration-200 outline-none
        placeholder:text-outline
        focus:border-primary focus:ring-2 focus:ring-primary/20
        ${error ? 'border-error/50' : 'border-outline-v/30'}`}
      {...props}
    />
    {error && <p className="text-[11px] text-error font-semibold">{error}</p>}
  </div>
);

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(form.email, form.password);
      if (u?.role === 'admin')                                  navigate('/admin');
      else if (u?.role === 'business' || u?.role === 'company') navigate('/business');
      else                                                      navigate('/student');
    } catch { /* AuthContext exposes error */ }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3525CD] to-[#4F46E5] shadow-xl shadow-indigo-950/50 mb-5 hover:-translate-y-0.5 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl icon-fill">trending_up</span>
          </Link>
          <h1 className="text-[26px] font-extrabold tracking-tight text-on-surface mb-1.5">Welcome back</h1>
          <p className="text-[14px] text-on-sv">Sign in to your Skill-To-Income account</p>
        </div>

        {/* Card */}
        <div className="bg-s-low rounded-2xl border border-outline-v/30 shadow-2xl shadow-black/30 p-7 flex flex-col gap-5">
          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-2.5 bg-error/10 border border-error/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">error</span>
              <p className="text-[13px] text-error font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              id="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-on-sv">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-s-mid rounded-xl text-[14px] text-on-surface
                    border border-outline-v/30 transition-all duration-200 outline-none
                    placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-sv hover:text-on-surface transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3 px-6 bg-gradient-to-br from-[#3525CD] to-[#4F46E5] text-white font-bold text-[14.5px] rounded-xl
                shadow-lg shadow-indigo-950/40 hover:shadow-xl hover:shadow-indigo-950/50 hover:-translate-y-px
                active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="border-t border-outline-v/20 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-outline text-center mb-3">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.map(([email, label]) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => setForm({ email, password: 'demo123' })}
                  className="py-2 px-1 rounded-xl bg-s-mid border border-outline-v/30 text-[11px] font-semibold text-on-sv
                    hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-150"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-outline mt-2">Password: <span className="font-bold text-on-sv">demo123</span></p>
          </div>

          <p className="text-center text-[13px] text-on-sv">
            No account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Join free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
