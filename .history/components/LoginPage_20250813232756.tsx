
import React, { useState } from 'react';
import { UserIcon, LockIcon } from './Icons';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string;
}

const PersijaLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1_2)">
      <path d="M9.1,5.2h81.8c5,0,9.1,4.1,9.1,9.1v91.6c0,5-4.1,9.1-9.1,9.1H9.1c-5,0-9.1-4.1-9.1-9.1V14.3C0,9.3,4.1,5.2,9.1,5.2Z" fill="#CE0A0A"/>
      <path d="M50,13.8c-18.9,0-34.2,15.3-34.2,34.2v0c0,18.9,15.3,34.2,34.2,34.2h0c18.9,0,34.2-15.3,34.2-34.2v0C84.2,29.1,68.9,13.8,50,13.8Z" fill="#FFF"/>
      <path d="M49.9,25.3c-12.5,0-22.6,10.1-22.6,22.6c0,12.5,10.1,22.6,22.6,22.6c12.5,0,22.6-10.1,22.6-22.6C72.5,35.4,62.4,25.3,49.9,25.3Z" fill="#ED7D0B"/>
      <path d="M50,33.5c-4.6-2.5-10.3-2.7-14.8-0.1c-1.9,1.1-3.9,2.6-5.8,4.1c-0.2-0.1-0.4-0.1-0.6-0.2c-1.7-0.7-3.4-1.3-5.2-1.9c-0.6-0.2-1.2-0.4-1.8-0.6c-4.4-1.6-9.2-1.6-13.3,0.6c0.6,3.3,1.4,6.4,2.5,9.4c1.1,3,2.5,5.9,4.2,8.6c1.7,2.7,3.6,5.2,5.8,7.5c2.2,2.3,4.6,4.4,7.3,6.2c0.2,0.1,0.3,0.2,0.5,0.3c2.7,1.8,5.6,3.3,8.7,4.3c2.9,1,5.9,1.5,8.9,1.5c3.2,0,6.3-0.5,9.3-1.7c3-1.1,5.8-2.6,8.4-4.5c2.6-1.9,5-4.1,7.1-6.6c2.1-2.5,3.8-5.3,5.2-8.3c1.4-3,2.5-6.2,3.2-9.5c0.7-3.3,1-6.8,0.7-10.2c-2.3-1-4.7-1.8-7.2-2.5c-2.5-0.7-5-1.2-7.6-1.5c-2.6-0.3-5.1-0.4-7.7-0.4c-2.1,0-4.2,0.1-6.3,0.4C55,33.1,52.5,33,50,33.5Z" fill="#CE0A0A"/>
      <path d="M37.1,98.6c-0.1,0-0.2,0-0.3,0c-0.1,0-0.2,0-0.3-0.1c-0.2-0.1-0.4-0.1-0.6-0.2c-3.1-1.3-6-3-8.6-5.2c-0.6-0.5-1.2-1-1.8-1.5c-2.4-2.2-4.5-4.7-6.2-7.5c-1.8-2.8-3.2-5.9-4.3-9c-1.1-3.1-2-6.5-2.5-9.9c-0.6-3.4-0.8-6.9-0.5-10.3c0.1-1.1,0.2-2.2,0.4-3.3c3-1.6,6.3-2.6,9.6-2.9c3.3-0.3,6.6-0.2,9.8,0.5c3.2,0.7,6.3,1.9,9.2,3.5c1,0.6,1.9,1.1,2.9,1.7c0.1,0.1,0.2,0.1,0.4,0.2c1.8,0.9,3.6,1.9,5.5,2.9c1.9,1,3.8,1.9,5.8,2.7c2,0.8,4,1.5,6.1,2c-0.3,4.4-1.4,8.6-3.2,12.5c-1.8,3.9-4.3,7.4-7.5,10.2c-3.1,2.8-6.8,5-10.8,6.4c-4,1.4-8.2,2.1-12.5,2.1C38.9,98.6,38,98.6,37.1,98.6Z" fill="#FFF"/>
    </g>
    <defs>
      <clipPath id="clip0_1_2">
        <path d="M0,14.3c0-5,4.1-9.1,9.1-9.1h81.8c5,0,9.1,4.1,9.1,9.1v91.6c0,5-4.1,9.1-9.1,9.1H9.1c-5,0-9.1-4.1-9.1-9.1V14.3Z" fill="#FFF"/>
      </clipPath>
    </defs>
  </svg>
);


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
    <div className="bg-surface-main min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-100">
      <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Visual Side */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
            <PersijaLogo className="w-40 h-auto mb-6" />
            <h1 className="text-4xl font-bold text-center mb-2">PJH Task Manager</h1>
            <p className="text-xl text-center text-red-200">Powering Victory, One Task at a Time.</p>
        </div>

        {/* Form Side */}
        <div className="bg-white/60 backdrop-blur-lg p-8 md:p-12 w-full">
            <div className="md:hidden text-center mb-8">
                <PersijaLogo className="w-20 h-auto mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Zenith Task Manager</h1>
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
                            className="bg-surface-main border border-border-main rounded-lg w-full py-3 pl-10 pr-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
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
