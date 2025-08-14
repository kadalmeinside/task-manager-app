import React from 'react';
import type { User } from '../types';
import { Role } from '../types';
import { PlusIcon } from './Icons';

interface UserManagementListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateModal: () => void;
  users: User[];
}

const UserManagementListModal: React.FC<UserManagementListModalProps> = ({ isOpen, onClose, onOpenCreateModal, users }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-surface-card rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border-main flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
          <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 py-2 px-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg transition-colors"
          >
              <PlusIcon className="w-5 h-5" />
              Create User
          </button>
        </div>

        <div className="overflow-y-auto p-6">
            <ul className="divide-y divide-border-main">
            {users
              .sort((a,b) => a.name.localeCompare(b.name))
              .map(user => (
                <li key={user.id} className="py-3 flex justify-between items-center">
                    <div>
                        <p className="font-medium text-text-primary">{user.name}</p>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === Role.SUPER_ADMIN ? 'bg-red-100 text-red-800' :
                        user.role === Role.DIRECTOR ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {user.role}
                    </span>
                </li>
            ))}
            </ul>
        </div>
        
        <div className="mt-auto p-6 flex justify-end gap-4 shrink-0 border-t border-border-main">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-text-primary rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementListModal;
