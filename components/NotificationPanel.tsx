
import React, { useEffect, useRef } from 'react';
import type { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { BellIcon } from './Icons';

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onClearAllRead: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onNotificationClick,
  onMarkAllAsRead,
  onClearAllRead,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-surface-card rounded-lg shadow-2xl border border-border-main z-50 animate-fade-in-up"
      style={{ animationDuration: '0.2s' }}
    >
      <div className="p-4 border-b border-border-main flex justify-between items-center">
        <h3 className="font-bold text-text-primary">Notifications</h3>
        <div className="flex gap-4">
          {unreadNotifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
          {readNotifications.length > 0 && (
            <button
              onClick={onClearAllRead}
              className="text-sm font-medium text-gray-500 hover:underline"
            >
              Clear Read
            </button>
          )}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <>
            {unreadNotifications.length > 0 && (
              <div className="p-2">
                <h4 className="px-2 py-1 text-xs font-bold text-text-secondary uppercase">New</h4>
                <ul>
                  {unreadNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      onClick={() => onNotificationClick(notification)}
                      className="rounded-md p-3 cursor-pointer transition-colors bg-blue-50 hover:bg-blue-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                        <div>
                          <p className="text-sm text-text-primary">{notification.message}</p>
                          <p className="text-xs text-text-secondary mt-1">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
             {readNotifications.length > 0 && (
              <div className="p-2">
                <h4 className={`px-2 py-1 text-xs font-bold text-text-secondary uppercase ${unreadNotifications.length > 0 ? 'mt-2 pt-2 border-t border-border-main' : ''}`}>
                  Recent
                </h4>
                <ul>
                  {readNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      onClick={() => onNotificationClick(notification)}
                      className="rounded-md p-3 cursor-pointer transition-colors hover:bg-surface-main"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0"></div>
                        <div>
                          <p className="text-sm text-text-secondary">{notification.message}</p>
                          <p className="text-xs text-text-secondary mt-1">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 text-text-secondary flex flex-col items-center gap-2">
            <BellIcon className="w-8 h-8 text-slate-300"/>
            <p className="font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;