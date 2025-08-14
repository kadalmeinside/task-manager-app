
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="bg-surface-main min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">PJHTask Manager</h1>
            <p className="text-text-secondary mt-2">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-surface-card shadow-xl rounded-lg p-8">
          {error && <p className="bg-red-100 border border-red-200 text-red-700 text-sm p-3 rounded-md mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="bg-surface-main border border-border-main rounded-lg w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary"
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="bg-surface-main border border-border-main rounded-lg w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;