import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns/format';
import type { User, AppItem, Task, Project } from '../types';
import { Role, ItemType, ItemStatus } from '../types';
import { GitHubIcon, GoogleDriveIcon, LinkIcon, CheckCircleIcon } from './Icons';

interface TaskDetailModalProps {
  isOpen: boolean;
  item: AppItem | null;
  allItems: AppItem[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onUpdate: (item: AppItem) => void;
  onSelectItem: (item: AppItem) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, item, allItems, users, currentUser, onClose, onUpdate, onSelectItem }) => {
  // --- HOOKS (must be called unconditionally at the top) ---
  const [status, setStatus] = useState<ItemStatus>(ItemStatus.TODO);
  const [completionUrl, setCompletionUrl] = useState('');
  const [note, setNote] = useState('');
  const [urlError, setUrlError] = useState('');

  const isProject = item?.type === ItemType.PROJECT;
  const isTask = item?.type === ItemType.TASK;
  const projectItem = isProject ? (item as Project) : null;
  const taskItem = isTask ? (item as Task) : null;

  const projectTasks = useMemo(() => {
    if (!isProject || !projectItem) return [];
    return allItems
      .filter((i): i is Task => i.type === ItemType.TASK && i.projectId === projectItem.id)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [allItems, projectItem, isProject]);
  
  const parentProject = useMemo(() => {
    if (!isTask || !taskItem?.projectId) return null;
    return allItems.find(i => i.id === taskItem.projectId);
  }, [allItems, taskItem, isTask]);

  useEffect(() => {
    if (item) {
      setStatus(item.status);
      if (item.type === ItemType.TASK) {
        setCompletionUrl(item.completionUrl || '');
        setNote(item.note || '');
      } else {
        setCompletionUrl('');
        setNote('');
      }
      setUrlError('');
    }
  }, [item]);
  
  // --- Early return AFTER hooks ---
  if (!isOpen || !item) {
    return null;
  }

  // --- Component Logic & Render ---
  const assignee = users.find(u => u.id === item.assigneeId);
  const canEdit = (currentUser.role === Role.STAFF && currentUser.id === item.assigneeId) || currentUser.role === Role.DIRECTOR || currentUser.role === Role.SUPER_ADMIN;
  
  const handleUpdate = () => {
    if (status === ItemStatus.COMPLETED && isTask && !completionUrl) {
      setUrlError('Completion URL is required to mark this task as completed.');
      return;
    }

    let updatedItem: AppItem;
    if (isTask) {
      updatedItem = { ...item, status, completionUrl, note };
    } else {
      updatedItem = { ...item, status };
    }

    onUpdate(updatedItem);
    if (!isProject) { // Don't close when updating a project, to allow task navigation
      onClose();
    }
  };
  
  const handleStatusChange = (newStatus: ItemStatus) => {
    setStatus(newStatus);
    if (newStatus !== ItemStatus.COMPLETED) {
      setUrlError('');
    }
  }

  const getLinkIcon = (url: string) => {
    if (!url) return null;
    if (url.includes('github.com')) {
      return <GitHubIcon className="w-5 h-5 text-text-secondary" />;
    }
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      return <GoogleDriveIcon className="w-5 h-5 text-blue-500" />;
    }
    return <LinkIcon className="w-5 h-5 text-text-secondary" />;
  };

  const statusStyles: { [key in ItemStatus]: { text: string, bg: string } } = {
    [ItemStatus.TODO]: { text: 'text-amber-800', bg: 'bg-amber-100' },
    [ItemStatus.IN_PROGRESS]: { text: 'text-blue-800', bg: 'bg-blue-100' },
    [ItemStatus.COMPLETED]: { text: 'text-green-800', bg: 'bg-green-100' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-surface-card rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start shrink-0">
            <div>
                <span 
                    className="text-xs font-semibold text-white px-3 py-1 rounded-full mb-2 inline-block"
                    style={{ backgroundColor: item.color }}
                >
                    {item.type}
                </span>
                <h2 className="text-2xl font-bold text-text-primary mb-2">{item.title}</h2>
            </div>
            <div className="text-right">
                <p className="text-text-secondary text-sm">Due Date</p>
                <p className="text-text-primary font-semibold">{format(item.dueDate, 'MMMM d, yyyy')}</p>
                {taskItem?.status === ItemStatus.COMPLETED && taskItem.overdueDays && taskItem.overdueDays > 0 && (
                    <p className="text-sm text-red-600 font-semibold mt-1">
                        Completed {taskItem.overdueDays} day{taskItem.overdueDays > 1 ? 's' : ''} late
                    </p>
                )}
            </div>
        </div>
        
        <div className="my-4 text-text-secondary shrink-0">
            Assigned to: <span className="text-text-primary font-medium">{assignee?.name || 'Unassigned'}</span>
            {parentProject && (
                <>
                 <span className="mx-2">·</span>
                 <span>Part of: <button onClick={() => onSelectItem(parentProject)} className="text-brand-primary font-medium hover:underline">{parentProject.title}</button></span>
                </>
            )}
        </div>
        
        <div className="overflow-y-auto flex-grow pr-2 -mr-2">
            <p className="text-text-primary bg-surface-main p-4 rounded-lg border border-border-main whitespace-pre-wrap">
              {item.description || 'No description provided.'}
            </p>
            
            {isProject && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Tasks in this Project ({projectTasks.length})</h3>
                    <div className="space-y-2 bg-surface-main p-3 rounded-lg border border-border-main">
                        {projectTasks.length > 0 ? projectTasks.map(task => {
                            const taskAssignee = users.find(u => u.id === task.assigneeId);
                            const statusStyle = statusStyles[task.status];
                            return (
                                <div key={task.id} onClick={() => onSelectItem(task)} className="bg-surface-card p-3 rounded-lg shadow-sm border border-transparent hover:border-brand-primary cursor-pointer">
                                    <div className="flex justify-between items-center">
                                        <p className={`font-medium ${task.status === ItemStatus.COMPLETED ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.title}</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{task.status}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1">Due: {format(task.dueDate, 'MMM d')} · To: {taskAssignee?.name || 'N/A'}</p>
                                </div>
                            )
                        }) : <p className="text-text-secondary text-center p-4">No tasks have been assigned to this project yet.</p>}
                    </div>
                </div>
            )}

            {isTask && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Notes</h3>
                    {canEdit ? (
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add notes..."
                            className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-3 h-24 resize-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                    ) : (
                        <div className="text-text-primary bg-surface-main p-4 rounded-lg border border-border-main whitespace-pre-wrap min-h-[4rem]">
                            {taskItem?.note ? taskItem.note : <span className="text-text-secondary">No notes provided.</span>}
                        </div>
                    )}
                </div>
            )}

            {canEdit && (
                <div className="mt-6 pt-6 border-t border-border-main">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Update Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value as ItemStatus)}
                                className="w-full bg-surface-main border border-border-main rounded-lg text-text-primary p-2 focus:ring-brand-primary focus:border-brand-primary"
                            >
                                {Object.values(ItemStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {isTask && (
                            <div>
                                 <label htmlFor="completionUrl" className="block text-sm font-medium text-text-secondary mb-2">Completion URL (GitHub, Drive, etc.)</label>
                                 <input 
                                    id="completionUrl"
                                    type="url"
                                    value={completionUrl}
                                    onChange={(e) => {
                                        setCompletionUrl(e.target.value);
                                        if(urlError) setUrlError('');
                                    }}
                                    placeholder="https://github.com/..."
                                    className={`w-full bg-surface-main border rounded-lg text-text-primary p-2 focus:ring-brand-primary focus:border-brand-primary ${urlError ? 'border-red-500' : 'border-border-main'}`}
                                 />
                                  {urlError && <p className="text-red-600 text-xs mt-1">{urlError}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isTask && taskItem?.completionUrl && (
                 <div className="mt-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Completion Link</h3>
                     <div className="flex items-center gap-3 bg-surface-main p-3 rounded-lg border border-border-main">
                        {getLinkIcon(taskItem.completionUrl)}
                        <a href={taskItem.completionUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline truncate block">
                            {taskItem.completionUrl}
                        </a>
                    </div>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-border-main shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-text-primary rounded-lg transition-colors"
          >
            Close
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={handleUpdate}
              className="py-2 px-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;