import React, { useMemo } from 'react';
import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
import { subDays } from 'date-fns/subDays';
import { isSameDay } from 'date-fns/isSameDay';
import { isWithinInterval } from 'date-fns/isWithinInterval';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { startOfWeek } from 'date-fns/startOfWeek';
import { endOfWeek } from 'date-fns/endOfWeek';
import { isSameMonth } from 'date-fns/isSameMonth';
import { differenceInDays } from 'date-fns/differenceInDays';
import { isAfter } from 'date-fns/isAfter';
import { isBefore } from 'date-fns/isBefore';
import { areIntervalsOverlapping } from 'date-fns/areIntervalsOverlapping';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import type { AppItem, User, Task } from '../types';
import { ItemType, ItemStatus } from '../types'
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from './Icons';

// Helper to get assignee
const getAssignee = (item: AppItem, users: User[]) => users.find(u => u.id === item.assigneeId);



// TaskCard Component (Used by Date View)
interface TaskCardProps {
  item: AppItem;
  users: User[];
  onSelectItem: (item: AppItem) => void;
}
const TaskCard: React.FC<TaskCardProps> = ({ item, users, onSelectItem }) => {
  const assignee = getAssignee(item, users);
  const statusStyle = statusStyles[item.status];

  const getDateInfo = () => {
    if (item.type === ItemType.TASK && item.status === ItemStatus.COMPLETED) {
      const task = item as Task;
      if (task.completedOn) {
        const overdueText = task.overdueDays && task.overdueDays > 0 
          ? <span className="text-red-500 font-medium ml-2">({task.overdueDays}d late)</span> 
          : null;
        return (
          <span className="flex items-center">
            Completed: {format(task.completedOn, 'MMM d')}
            {overdueText}
          </span>
        );
      }
    }
    if (item.status !== ItemStatus.COMPLETED && isBefore(item.dueDate, startOfDay(new Date()))) {
        return <span className="text-red-600 font-medium">Due: {format(item.dueDate, 'MMM d')}</span>;
    }
    return <span>Due: {format(item.dueDate, 'MMM d')}</span>;
  };

  return (
    <div 
        className="bg-surface-card border border-border-main rounded-lg p-4 flex items-center gap-4 transition-all hover:border-brand-primary cursor-pointer shadow-sm hover:shadow-md"
        onClick={() => onSelectItem(item)}
    >
      <div className="flex-grow">
        <div className="flex items-center gap-2">
            <p className={`font-medium ${item.status === ItemStatus.COMPLETED ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{item.title}</p>
            {item.status === ItemStatus.COMPLETED && <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />}
        </div>
        <div className="text-sm text-text-secondary flex items-center gap-4 mt-1">
          {getDateInfo()}
          {assignee && <span>To: {assignee.name}</span>}
          {item.type === ItemType.PROJECT && <span className="text-xs font-semibold bg-brand-secondary text-white px-2 py-0.5 rounded-full">Project</span>}
        </div>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
          {item.status}
      </div>
    </div>
  );
};


// Date View Component (with 5-day Slider)
interface DateViewProps {
  items: AppItem[];
  users: User[];
  currentDate: Date;
  onSelectItem: (item: AppItem) => void;
  onVisibleDateChange: (date: Date) => void;
}

export const DateView: React.FC<DateViewProps> = ({ items, users, currentDate, onSelectItem, onVisibleDateChange }) => {
    const todayStart = useMemo(() => startOfDay(new Date()), []);
    
    const overdueItems = useMemo(() => {
        return items
            .filter(item => 
                item.status !== ItemStatus.COMPLETED && 
                isBefore(item.dueDate, todayStart)
            )
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }, [items, todayStart]);

    const tasksForSelectedDay = useMemo(() => {
        return items
        .filter(item => {
            const isOverdue = item.status !== ItemStatus.COMPLETED && isBefore(item.dueDate, todayStart);
            if (isOverdue) return false;
            
            // If task is completed, show it on its completion date
            if (item.type === ItemType.TASK && item.status === ItemStatus.COMPLETED) {
                const task = item as Task;
                if (task.completedOn) {
                    return isSameDay(currentDate, task.completedOn);
                }
            }
            
            // Otherwise, show it if it's active during the current date
            return isWithinInterval(currentDate, { start: startOfDay(item.createdAt), end: item.dueDate });
        })
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }, [items, currentDate, todayStart]);

  const handleDateChange = (newDate: Date) => {
    onVisibleDateChange(newDate);
  };

  const displayedDates = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(currentDate, i - 2));
  }, [currentDate]);

  return (
    <div className="h-full flex flex-col bg-surface-main">
      {/* Header with 5-day slider navigation */}
      <div className="p-4 bg-surface-card/50 border-b border-border-main shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {format(currentDate, 'EEEE, MMMM d')}
          </h2>
          <button onClick={() => handleDateChange(new Date())} className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-1 border border-border-main rounded-lg hover:bg-surface-card">
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleDateChange(subDays(currentDate, 1))} className="p-2 rounded-full hover:bg-surface-card" aria-label="Previous Day">
            <ChevronLeftIcon className="w-6 h-6 text-text-secondary" />
          </button>
          
          <div className="flex-grow grid grid-cols-5 gap-2">
            {displayedDates.map((day) => {
              const isSelected = isSameDay(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateChange(day)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-brand-primary text-white'
                      : 'hover:bg-surface-card text-text-secondary'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase">{format(day, 'EEE')}</span>
                  <span className={`text-lg font-bold ${isToday && !isSelected ? 'text-brand-primary' : ''}`}>{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>

          <button onClick={() => handleDateChange(addDays(currentDate, 1))} className="p-2 rounded-full hover:bg-surface-card" aria-label="Next Day">
            <ChevronRightIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto px-4 md:px-6 py-4">
        {overdueItems.length > 0 && (
            <div className="mb-6">
                <h3 className="text-base font-semibold text-red-600 mb-2 uppercase tracking-wider">Overdue</h3>
                <div className="space-y-3">
                    {overdueItems.map(item => <TaskCard key={item.id} item={item} users={users} onSelectItem={onSelectItem} />)}
                </div>
            </div>
        )}

        {overdueItems.length > 0 && tasksForSelectedDay.length > 0 && <hr className="border-t border-border-main my-6" />}

        {tasksForSelectedDay.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-3 uppercase tracking-wider">
                Tasks for {format(currentDate, 'MMMM d')}
            </h3>

            <div className="space-y-3">
              {tasksForSelectedDay.map(item => <TaskCard key={item.id} item={item} users={users} onSelectItem={onSelectItem} />)}
            </div>
          </div>
        )}

        {tasksForSelectedDay.length === 0 && overdueItems.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border-main rounded-lg bg-surface-card/30 mt-4">
              <p className="text-text-secondary">No tasks scheduled for this day.</p>
            </div>
        )}
      </div>
    </div>
  );
};


// --- Month View ---
interface MonthViewProps {
  items: AppItem[];
  users: User[];
  currentDate: Date;
  onSelectItem: (item: AppItem) => void;
}

const getEffectiveInterval = (item: AppItem): { start: Date, end: Date } => {
    if (item.type === ItemType.TASK && item.status === ItemStatus.COMPLETED) {
        const task = item as Task;
        // A completed task is a single-day event.
        const effectiveDate = startOfDay(task.completedOn || item.dueDate);
        return { start: effectiveDate, end: endOfDay(effectiveDate) };
    }
    // For all other tasks, normalize the interval to full days.
    return { start: startOfDay(item.createdAt), end: endOfDay(item.dueDate) };
};

export const MonthView: React.FC<MonthViewProps> = ({ items, currentDate, onSelectItem }) => {
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(lastDayOfMonth),
  });
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const weeks = useMemo(() => {
    const dayChunks = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
        dayChunks.push(daysInMonth.slice(i, i + 7));
    }
    return dayChunks;
  }, [daysInMonth]);

  const weeklyLayouts = useMemo(() => {
    return weeks.map(week => {
        const weekStart = startOfDay(week[0]);
        const weekEnd = endOfDay(week[6]);

        const weekItems = items
            .filter(item => areIntervalsOverlapping(getEffectiveInterval(item), { start: weekStart, end: weekEnd }))
            .sort((a, b) => {
                const aInterval = getEffectiveInterval(a);
                const bInterval = getEffectiveInterval(b);
                const startDiff = differenceInDays(aInterval.start, bInterval.start);
                if (startDiff !== 0) return startDiff;
                const durationDiff = differenceInDays(bInterval.end, bInterval.start) - differenceInDays(aInterval.end, aInterval.start);
                return durationDiff;
            });

        const itemSlots = new Map<string, number>();
        const occupiedSlots: { start: Date, end: Date }[][] = [];

        weekItems.forEach(item => {
            const itemInterval = getEffectiveInterval(item);
            let slotIndex = 0;
            while(true) {
                if (!occupiedSlots[slotIndex]) {
                    occupiedSlots[slotIndex] = [];
                }
                const collision = occupiedSlots[slotIndex].some(placedInterval =>
                    areIntervalsOverlapping(itemInterval, placedInterval, { inclusive: true })
                );
                if (!collision) {
                    occupiedSlots[slotIndex].push(itemInterval);
                    itemSlots.set(item.id, slotIndex);
                    break;
                }
                slotIndex++;
            }
        });

        const layout = weekItems.map(item => {
            const { start: itemStart, end: itemEnd } = getEffectiveInterval(item);
            const start = isAfter(itemStart, weekStart) ? itemStart : weekStart;
            const end = isBefore(itemEnd, weekEnd) ? itemEnd : weekEnd;
            const duration = differenceInDays(end, start) + 1;
            const offset = differenceInDays(start, weekStart);

            return {
                item,
                slot: itemSlots.get(item.id) || 0,
                duration: duration > 0 ? duration : 1,
                offset: offset >= 0 ? offset : 0,
            };
        });
        
        return {
            weekDays: week,
            layout,
            rowCount: occupiedSlots.length || 1
        };
    });
  }, [weeks, items]);

  return (
    <div className="p-4 md:p-6 flex flex-col bg-surface-card h-full">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 shrink-0">
          {weekdays.map(day => (
            <div key={day} className="text-center font-medium text-text-secondary text-sm py-2 border-b border-r border-border-main last:border-r-0 bg-surface-card">{day}</div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex-grow flex flex-col">
            {weeklyLayouts.map(({ weekDays, layout, rowCount }, weekIndex) => (
                // Each week row has uniform height (flex-1) and scrolls internally
                <div 
                    key={weekIndex}
                    className="relative border-b border-border-main flex-1 overflow-y-auto"
                >
                    {/* A tall inner "canvas" that holds all items. Its height is dynamic. */}
                    <div className="relative" style={{ minHeight: `calc(1.75rem + ${rowCount * 1.85}rem)` }}>
                        {/* Background day cells */}
                        <div className="grid grid-cols-7 absolute inset-0">
                            {weekDays.map((day) => {
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                return (
                                    <div key={day.toString()} className={`flex-1 border-r border-border-main last:border-r-0 ${isCurrentMonth ? '' : 'bg-surface-main'}`}></div>
                                );
                            })}
                        </div>
                        
                        {/* Day numbers (part of the scrollable canvas) */}
                        <div className="grid grid-cols-7 relative">
                            {weekDays.map(day => {
                                const isToday = isSameDay(day, new Date());
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                return (
                                    <div key={day.toString()} className="flex-1 p-1.5">
                                         <div className={`text-xs font-semibold ${isToday ? 'bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : isCurrentMonth ? 'text-text-primary' : 'text-text-secondary'}`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Positioned task items */}
                        {layout.map(({ item, slot, duration, offset }) => (
                            <div 
                                key={item.id}
                                className="absolute h-6 rounded text-white text-xs font-medium flex items-center px-2 overflow-hidden truncate cursor-pointer hover:ring-2 ring-slate-400"
                                onClick={() => onSelectItem(item)}
                                title={item.title}
                                style={{
                                    backgroundColor: item.color,
                                    opacity: item.status === ItemStatus.COMPLETED ? 0.7 : 1,
                                    top: `calc(1.75rem + ${slot * 1.85}rem)`,
                                    left: `calc(${(offset / 7) * 100}%)`,
                                    width: `calc(${(duration / 7) * 100}% - 8px)`,
                                    zIndex: 10 + slot,
                                }}
                            >
                                {item.status === ItemStatus.COMPLETED && <CheckCircleIcon className="w-4 h-4 text-white shrink-0 mr-1" />}
                                <span className={`flex-grow truncate ${item.status === ItemStatus.COMPLETED ? 'line-through' : ''}`}>
                                {item.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};