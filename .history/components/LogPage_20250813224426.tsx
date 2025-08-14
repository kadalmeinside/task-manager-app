
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

const LogPage: React.FC<LogPageProps> = ({ logs, onLoadMore, hasMore, isLoadingMore, onGoBack }) => {
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
            {!isLoadingMore && !hasMore && logs.length > 0 && <p className="text-text-secondary">End of logs.</p>}
        </div>
      </div>
    </div>
  );
};

export default LogPage;
