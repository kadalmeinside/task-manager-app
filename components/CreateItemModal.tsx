import React, { useState, useEffect, useMemo } from 'react';
import type { User, AppItem } from '../types';
import { Role, ItemType, ItemStatus } from '../types';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<AppItem, 'id' | 'createdAt' | 'color'>) => void;
  currentUser: User;
  staffList: User[];
  items: AppItem[];
}

const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  staffList,
  items,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>(currentUser.id);
  const [itemType, setItemType] = useState<ItemType>(ItemType.TASK);
  const [projectId, setProjectId] = useState<string>('');

  const projects = useMemo(() => items.filter(item => item.type === ItemType.PROJECT), [items]);

  useEffect(() => {
    if (currentUser.role === Role.STAFF) {
      setAssigneeId(currentUser.id);
    } else {
      setAssigneeId(staffList[0]?.id || '');
    }
  }, [currentUser, staffList]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setItemType(ItemType.TASK);
    setProjectId('');
    if (currentUser.role === Role.DIRECTOR) {
        setAssigneeId(staffList[0]?.id || '');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !assigneeId) {
      alert('Please fill out title, due date, and select an assignee.');
      return;
    }

    const newItemBase = {
      title,
      description,
      dueDate: new Date(dueDate + 'T23:59:59'), // Set to end of day
      status: ItemStatus.TODO,
      assigneeId,
      createdById: currentUser.id,
    };
    
    const newItem = itemType === ItemType.PROJECT
      ? { ...newItemBase, type: ItemType.PROJECT, tasks: [] }
      : { ...newItemBase, type: ItemType.TASK, ...(projectId ? { projectId } : {}) };

    onSubmit(newItem);
    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-surface-card rounded-lg shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Create New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2 focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2 h-24 resize-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-medium text-text-secondary mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2 focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          
          {currentUser.role === Role.DIRECTOR && (
            <div className="mb-4">
              <label htmlFor="itemType" className="block text-sm font-medium text-text-secondary mb-2">
                Item Type
              </label>
              <select
                id="itemType"
                value={itemType}
                onChange={(e) => setItemType(e.target.value as ItemType)}
                className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2 focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value={ItemType.TASK}>Task</option>
                <option value={ItemType.PROJECT}>Project</option>
              </select>
            </div>
          )}
          
          {itemType === ItemType.TASK && (
            <div className="mb-4">
              <label htmlFor="projectId" className="block text-sm font-medium text-text-secondary mb-2">
                Assign to Project (Optional)
              </label>
              <select
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2 focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="">No Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}

          {currentUser.role === Role.DIRECTOR && (
            <div className="mb-6">
              <label htmlFor="assignee" className="block text-sm font-medium text-text-secondary mb-2">
                Assign To
              </label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2 focus:ring-brand-primary focus:border-brand-primary"
              >
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItemModal;