import React, { useState } from 'react';
import { Role } from '../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (details: { name: string; email: string; pass: string; role: Role; }) => Promise<void>;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onCreateUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.STAFF);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const resetFormAndClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole(Role.STAFF);
    setError('');
    setSuccess('');
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await onCreateUser({ name, email, pass: password, role });
      setSuccess(`User "${name}" created successfully!`);
      setTimeout(() => {
        resetFormAndClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={resetFormAndClose}>
      <div className="bg-surface-card rounded-lg shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Create New User</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-red-100 text-red-700 text-sm p-3 rounded-md mb-4">{error}</p>}
          {success && <p className="bg-green-100 text-green-700 text-sm p-3 rounded-md mb-4">{success}</p>}

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2" required />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2">
              <option value={Role.STAFF}>Staff</option>
              <option value={Role.DIRECTOR}>Director</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={resetFormAndClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg transition-colors" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;