
import React, { useRef, useEffect, useCallback } from 'react';
import type { ActivityLog } from '../types';
import { LogActionType } from '../types';
import { formatDistanceToNow } from 'date-fns';
import Spinner from './Spinner';

interface LogPageProps {
  logs: ActivityLog[];
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  onGoBack: () => void;
  indexError: boolean;
}

const formatLogMessage = (log: ActivityLog): string => {
  const { action, details } = log;
  switch(action) {
    case LogActionType.CREATE_ITEM:
      return `${details.itemType} "${details.itemTitle}" was created and assigned to ${details.assigneeName}.`;
    case LogActionType.UPDATE_ITEM_STATUS:
      return `Status of "${details.itemTitle}" was changed from "${details.oldStatus}" to "${details.newStatus}".`;
    case LogActionType.CREATE_USER:
      return `A new user "${details.newUserName}" was created with the role of ${details.newUserRole}.`;
    default:
      return 'An unknown action was performed.';
  }
};

const LogItem: React.FC<{ log: ActivityLog }> = ({ log }) => {
  return (
    <li className="py-4">
      <p className="text-text-primary">{formatLogMessage(log)}</p>
      <p className="text-sm text-text-secondary mt-1">
        {formatDistanceToNow(log.timestamp, { addSuffix: true })} by <span className="font-medium">{log.userName}</span>
      </p>
    </li>
  );
};

const LogPage: React.FC<LogPageProps> = ({ logs, onLoadMore, hasMore, isLoadingMore, onGoBack, indexError }) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastLogElementRef = useCallback((node: HTMLLIElement | null) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, onLoadMore]);

  const renderContent = () => {
    if (indexError) {
        return (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg m-6">
                <h3 className="text-xl font-bold text-red-800">Database Index Required</h3>
                <p className="mt-2 text-red-700">
                    To view activity logs for Staff, a composite index must be created in your Firebase Firestore database.
                </p>
                <div className="mt-4 text-left bg-red-100 p-4 rounded-md text-sm text-red-900">
                    <p className="font-semibold">Please create the following index in your Firebase Console:</p>
                    <ul className="list-disc list-inside mt-2 font-mono">
                        <li><strong>Collection ID:</strong> activity_logs</li>
                        <li><strong>Fields to index:</strong></li>
                        <li className="ml-4">1. `userId` (Ascending)</li>
                        <li className="ml-4">2. `timestamp` (Descending)</li>
                    </ul>
                </div>
                <p className="mt-4 text-sm text-red-600">
                    The application will work correctly once the index is built. The error log in your browser's developer console contains a direct link to create it.
                </p>
            </div>
        );
    }
    
    if (logs.length > 0) {
        return (
            <ul className="divide-y divide-border-main px-6">
                {logs.map((log, index) => {
                    const isLastElement = logs.length === index + 1;
                    return (
                        <li ref={isLastElement ? lastLogElementRef : null} key={log.id}>
                            <LogItem log={log} />
                        </li>
                    );
                })}
            </ul>
        );
    }
    
    if (!isLoadingMore) {
        return <p className="text-center text-text-secondary p-8">No activity logs found.</p>;
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-surface-main">
      <div className="p-4 bg-surface-card border-b border-border-main flex items-center justify-between shrink-0 sticky top-[68px] z-20">
        <h1 className="text-2xl font-bold text-text-primary">Activity Log</h1>
        <button
          onClick={onGoBack}
          className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
        >
          Back to Dashboard
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
        <div className="h-16 flex items-center justify-center">
            {isLoadingMore && <Spinner />}
            {!isLoadingMore && !hasMore && logs.length > 0 && !indexError && <p className="text-text-secondary">End of logs.</p>}
        </div>
      </div>
    </div>
  );
};

export default LogPage;
