import React, { useState, useEffect } from 'react';

const InstallPWAButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }
        setIsVisible(false);
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        setDeferredPrompt(null);
    };
    
    const handleDismiss = () => {
        setIsVisible(false);
    }

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-4 shadow-lg z-50 flex items-center justify-between animate-fade-in-up">
            <div className="font-medium">
                <p className="font-bold">Dapatkan Aplikasi Zenith Tasks</p>
                <p className="text-sm text-red-200">Instal ke layar utama Anda untuk pengalaman yang lebih baik.</p>
            </div>
            <div className="flex items-center gap-4">
                 <button
                    onClick={handleInstallClick}
                    className="bg-white text-brand-primary font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-100 transition-colors"
                >
                    Instal
                </button>
                <button onClick={handleDismiss} className="text-white hover:bg-white/20 p-2 rounded-full" aria-label="Dismiss">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>
    );
};

export default InstallPWAButton;
