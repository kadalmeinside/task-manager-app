import React, { useState } from 'react';
import type { User, Notification } from '../types';
import { Role } from '../types';
import { LogOutIcon, BellIcon, BellPlusIcon } from './Icons';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onManageUsers: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onClearAllRead: () => void;
  isPushSupported: boolean;
  isPushSubscribed: boolean;
  onSubscribeToPush: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onManageUsers,
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  onClearAllRead,
  isPushSupported,
  isPushSubscribed,
  onSubscribeToPush,
}) => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-4">
        <img src="/public/persija_development_logo.png" alt="Persija Development Logo" className="h-8 w-auto" />
      </div>
      <div className="flex items-center gap-2">
        {user.role === Role.SUPER_ADMIN && (
          <button
            onClick={onManageUsers}
            className="hidden md:inline-flex items-center gap-2 text-white hover:text-white font-medium py-2 px-3 rounded-lg transition-colors hover:bg-white/20"
          >
            Manage Users
          </button>
        )}
        
        {isPushSupported && !isPushSubscribed && (
          <button
            onClick={onSubscribeToPush}
            className="relative p-2 rounded-full transition-colors hover:bg-white/20"
            aria-label="Enable Push Notifications"
            title="Enable Push Notifications"
          >
            <BellPlusIcon className="w-6 h-6 text-white" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setPanelOpen(prev => !prev)}
            className="relative p-2 rounded-full transition-colors hover:bg-white/20"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <BellIcon className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white text-brand-primary text-xs font-bold items-center justify-center">{unreadCount}</span>
              </span>
            )}
          </button>
          <NotificationPanel
            isOpen={isPanelOpen}
            notifications={notifications}
            onClose={() => setPanelOpen(false)}
            onNotificationClick={(notification) => {
              onNotificationClick(notification);
              setPanelOpen(false);
            }}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearAllRead={() => {
              onClearAllRead();
              if (notifications.filter(n => n.read).length > 0 && notifications.filter(n => !n.read).length === 0) {
                 setPanelOpen(false);
              }
            }}
          />
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-white">{user.name}</div>
          <div className="text-xs text-red-200">{user.role}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-red-200 hover:text-white font-medium py-2 px-3 rounded-lg transition-colors hover:bg-white/20"
          aria-label="Logout"
        >
          <LogOutIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;