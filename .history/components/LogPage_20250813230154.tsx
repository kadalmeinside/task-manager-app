
import React, { useRef, useCallback } from 'react';
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
  onRetry: () => void;
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
    <>
      <p className="text-text-primary">{formatLogMessage(log)}</p>
      <p className="text-sm text-text-secondary mt-1">
        {formatDistanceToNow(log.timestamp, { addSuffix: true })} by <span className="font-medium">{log.userName}</span>
      </p>
    </>
  );
};

const DatabaseIndexError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
    <div className="m-6 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
        <div className="flex">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.636-1.026 2.092-1.026 2.728 0l6.98 11.25a1.75 1.75 0 01-1.364 2.651H2.642a1.75 1.75 0 01-1.364-2.651l6.98-11.25zM10 12a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800">Database Index Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                    <p>To view activity logs for Staff, a composite index must be created in your Firebase Firestore database.</p>
                    <p className="mt-2 font-mono text-xs bg-yellow-100 p-2 rounded">
                        <strong>Collection ID:</strong> activity_logs<br />
                        <strong>Fields to index:</strong><br />
                        1. `userId` (Ascending)<br />
                        2. `timestamp` (Descending)
                    </p>
                    <p className="mt-2">The application will work correctly once the index is built. The error log in your browser's developer console may contain a direct link to create it.</p>
                </div>
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        </div>
    </div>
);


const LogPage: React.FC<LogPageProps> = ({ logs, onLoadMore, hasMore, isLoadingMore, onGoBack, indexError, onRetry }) => {
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
        return <DatabaseIndexError onRetry={onRetry} />;
    }
  
    if (logs.length > 0) {
        return (
            <ul className="divide-y divide-border-main px-6">
                {logs.map((log, index) => {
                    const isLastElement = logs.length === index + 1;
                    return (
                        <li ref={isLastElement ? lastLogElementRef : null} key={log.id} className="py-4">
                            <LogItem log={log} />
                        </li>
                    );
                })}
            </ul>
        );
    }
    
    // Don't show "No logs" if we're in an initial loading state (but not loading more)
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
