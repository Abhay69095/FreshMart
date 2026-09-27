import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FreshMartLogo } from '../components/FreshMartLogo';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSubmitted(true);
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error sending reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        <div className="text-center space-y-3">
          <FreshMartLogo size="lg" className="mx-auto" />
          <h1 className="text-2xl font-bold text-neutral-900 font-display">
            Reset Password
          </h1>
          <p className="text-xs text-neutral-500">
            Enter your registered email to receive account recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              If <strong>{email}</strong> is registered, password recovery details have been dispatched. For quick demo testing, default password is <code>customer123</code> or <code>admin123</code>.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{loading ? 'Submitting...' : 'Send Recovery Instructions'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
