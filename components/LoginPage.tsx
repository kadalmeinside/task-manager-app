import React, { useState } from 'react';
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from './Icons';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      // Error is set by parent component via the `error` prop
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-main min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-100">
      <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Visual Side */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
            <img src="/persija_development_logo.png" alt="Persija Development Logo" className="w-full max-w-md mb-6" />
            <p className="text-xl text-center text-red-200">Menuju Tim Utama.</p>
        </div>

        {/* Form Side */}
        <div className="bg-white/60 backdrop-blur-lg p-8 md:p-12 w-full">
            <div className="md:hidden mb-8">
                <img src="/persija_development_logo_black.png" alt="Persija Development Logo" className="h-10 w-auto" />
            </div>

            <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome Back</h2>
                <p className="text-text-secondary mb-8">Please sign in to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="bg-red-100 border border-red-200 text-red-700 text-sm p-3 rounded-md mb-4">{error}</p>}
                
                <div>
                    <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
                    Email Address
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <UserIcon className="h-5 w-5 text-text-secondary" />
                        </span>
                        <input
                            className="bg-surface-main border border-border-main rounded-lg w-full py-3 pl-10 pr-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                            id="email"
                            type="email"
                            placeholder="you@persijadevelopment.id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
                    Password
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockIcon className="h-5 w-5 text-text-secondary" />
                        </span>
                        <input
                            className="bg-surface-main border border-border-main rounded-lg w-full py-3 pl-10 pr-12 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary hover:text-text-primary"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOffIcon className="h-5 w-5" />
                            ) : (
                                <EyeIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing In...
                        </>
                    ) : 'Sign In'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;