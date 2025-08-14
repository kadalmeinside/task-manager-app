

import React from 'react';
import type { User } from '../types';
import { Role } from '../types';
import { LogOutIcon, HistoryIcon } from './Icons';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onManageUsers: () => void;
  onGoToLog: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onManageUsers, onGoToLog }) => {
  return (
    <header className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">Zenith Task Manager</h1>
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