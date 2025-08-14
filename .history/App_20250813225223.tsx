

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns/format';
import { subMonths } from 'date-fns/subMonths';
import { addMonths } from 'date-fns/addMonths';
import { differenceInDays } from 'date-fns/differenceInDays';
import { isBefore } from 'date-fns/isBefore';
import { startOfDay } from 'date-fns/startOfDay';
import type { User, AppItem, Task, ActivityLog } from './types';
import { Role, ItemType, ItemStatus, LogActionType } from './types';
import Header from './components/Header';
import { DateView, MonthView } from './components/CalendarViews';
import CreateUserModal from './components/CreateUserModal';
import LoginPage from './components/LoginPage';
import TaskDetailModal from './components/TaskDetailModal';
import { PlusIcon, CalendarIcon, ListIcon, ChevronLeftIcon, ChevronRightIcon } from './components/Icons';
import UserManagementListModal from './components/UserManagementListModal';
import InstallPWAButton from './components/InstallPWAButton';
import CreateItemModal from './components/CreateItemModal';
import { AppSkeleton } from './components/Skeleton';
import LogPage from './components/LogPage';

import { auth, db, firestore } from './firebase';
import firebase from 'firebase/compat/app';


const PALETTE = ['#0891b2', '#059669', '#6d28d9', '#be185d', '#c2410c'];
const LOGS_PER_PAGE = 20;

// --- APP COMPONENT ---
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthResolved, setAuthResolved] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [users, setUsers] = useState<User[] | null>(null);
  const [items, setItems] = useState<AppItem[] | null>(null);
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'date'>('month');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
  const [isUserListModalOpen, setUserListModalOpen] = useState(false);
  const [isCreateUserModalOpen, setCreateUserModalOpen] = useState(false);
  
  // New state for Log page
  const [activeView, setActiveView] = useState<'dashboard' | 'log'>('dashboard');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [lastLogDoc, setLastLogDoc] = useState<firebase.firestore.DocumentSnapshot | null>(null);
  const [isLoadingMoreLogs, setIsLoadingMoreLogs] = useState(false);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [logIndexError, setLogIndexError] = useState(false);


  // Initialize Super Admin on first load
  useEffect(() => {
    const initializeSuperAdmin = async () => {
      // Use a flag in localStorage to ensure this only runs once per browser.
      if (localStorage.getItem('super_admin_initialized_v2')) return;
  
      const superAdminEmail = 'superadmin@test.com';
      const superAdminPassword = 'password123';
      
      try {
        // This will throw an error if the user already exists, which is what we want.
        const userCredential = await auth.createUserWithEmailAndPassword(superAdminEmail, superAdminPassword);
        const user = userCredential.user;

        // If creation succeeds, create the corresponding Firestore document.
        if (user) {
            const userDocRef = db.collection('users').doc(user.uid);
            await userDocRef.set({
              name: 'Super Admin',
              email: superAdminEmail,
              role: Role.SUPER_ADMIN,
            });
            console.log("Super Admin account created successfully.");
            // Immediately sign the new user out so the login screen is presented.
            await auth.signOut();
        }
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log("Super Admin account already exists in Firebase Auth.");
        } else if (error.code !== 'auth/operation-not-allowed') { // Ignore error if email/pass auth is not enabled yet
          console.error("Error initializing Super Admin:", error);
        }
      } finally {
        // Mark as initialized to prevent re-running.
        localStorage.setItem('super_admin_initialized_v2', 'true');
      }
    };
  
    initializeSuperAdmin();
  }, []);
  
  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = db.collection('users').doc(firebaseUser.uid);
        const userDocSnap = await userDocRef.get();
        if (userDocSnap.exists) {
          setCurrentUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
        } else {
          console.error("No user document found for logged-in user! Logging out.");
          await auth.signOut();
        }
      } else {
        // When user logs out, reset all user-specific data to ensure no data leaks between sessions.
        setCurrentUser(null);
        setUsers(null);
        setItems(null);
        setLogs([]);
        setLastLogDoc(null);
        setHasMoreLogs(true);
        setActiveView('dashboard');
        setLogIndexError(false);
      }
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);
  
  // User list listener
  useEffect(() => {
    if (!currentUser) {
      setUsers(null);
      return;
    }
    // All authenticated users get the full user list.
    // UI components are already responsible for handling permissions.
    const usersCollectionRef = db.collection('users');
    const unsubscribe = usersCollectionRef.onSnapshot((snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersList);
    });
    return () => unsubscribe();
  }, [currentUser]);
  
  // Items listener
  useEffect(() => {
    if (!currentUser) {
      setItems(null);
      return;
    }
    
    const itemsCollectionRef = db.collection('items');
    let itemsQuery: firebase.firestore.Query;
    
    if (currentUser.role === Role.DIRECTOR || currentUser.role === Role.SUPER_ADMIN) {
      itemsQuery = itemsCollectionRef;
    } else { // Staff
      itemsQuery = itemsCollectionRef.where('assigneeId', '==', currentUser.id);
    }
    
    const unsubscribe = itemsQuery.onSnapshot((snapshot) => {
      const itemsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as firebase.firestore.Timestamp).toDate(),
          dueDate: (data.dueDate as firebase.firestore.Timestamp).toDate(),
          completedOn: data.completedOn ? (data.completedOn as firebase.firestore.Timestamp).toDate() : undefined,
        } as AppItem;
      });
      setItems(itemsList);
    });
    return () => unsubscribe();
  }, [currentUser]);
  
  // Fetch initial logs when view changes
  useEffect(() => {
    if (activeView === 'log' && currentUser) {
      fetchLogs();
    }
  }, [activeView, currentUser]);

  const staffList = useMemo(() => (users || []).filter(u => u.role === Role.STAFF), [users]);

  // --- LOGGING ---
  const logActivity = async (action: LogActionType, details: ActivityLog['details']) => {
    if (!currentUser) return;
    try {
      await db.collection('activity_logs').add({
        action,
        details,
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: firestore.Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  const fetchLogs = async (loadMore = false) => {
    if (isLoadingMoreLogs || !currentUser) return;
    
    if (!loadMore) {
        setLogIndexError(false); // Reset error on a fresh fetch/retry.
        setLogs([]); // Clear stale logs
    }

    setIsLoadingMoreLogs(true);

    let query: firebase.firestore.Query = db.collection('activity_logs')
                  .orderBy('timestamp', 'desc');

    // Filter logs by userId if the current user is Staff
    if (currentUser.role === Role.STAFF) {
        query = query.where('userId', '==', currentUser.id);
    }
    
    query = query.limit(LOGS_PER_PAGE);
    
    if (loadMore && lastLogDoc) {
      query = query.startAfter(lastLogDoc);
    }

    try {
      const snapshot = await query.get();
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as firebase.firestore.Timestamp).toDate(),
      } as ActivityLog));
      
      setLogs(prev => loadMore ? [...prev, ...fetchedLogs] : fetchedLogs);
      setLastLogDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreLogs(snapshot.docs.length === LOGS_PER_PAGE);

    } catch (error: any) {
      if (error.code === 'failed-precondition') {
          console.error("FIRESTORE HINT: The current query requires a composite index for staff members to filter logs. Please create it in your Firebase console. The required index is on the 'activity_logs' collection, with fields 'userId' (Ascending) and 'timestamp' (Descending).", error);
          setLogIndexError(true);
          setLogs([]);
          setHasMoreLogs(false);
      } else {
        console.error("Error fetching logs:", error);
      }
    } finally {
      setIsLoadingMoreLogs(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginError('');
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      setLoginError(error.message || 'Invalid email or password.');
      throw error;
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };
  
  const handleCreateUser = async (details: { name: string; email: string; pass: string; role: Role; }) => {
      let tempApp: firebase.app.App | undefined;
      try {
          tempApp = firebase.initializeApp({ ...auth.app.options }, 'temp-user-creation');
          const userCredential = await tempApp.auth().createUserWithEmailAndPassword(details.email, details.pass);
          const newUser = userCredential.user;

          if (newUser) {
            await db.collection('users').doc(newUser.uid).set({
                name: details.name,
                email: details.email,
                role: details.role,
            });
            logActivity(LogActionType.CREATE_USER, {
                newUserName: details.name,
                newUserRole: details.role,
            });
          }
      } catch (error: any) {
          console.error("Error creating user:", error);
          throw new Error(error.message || "Could not create user.");
      } finally {
        if (tempApp) {
          await tempApp.delete();
        }
      }
  };

  const handleCreateItem = async (newItemData: Omit<AppItem, 'id' | 'createdAt' | 'color'>) => {
    const commonProps = {
      createdAt: firestore.Timestamp.fromDate(new Date()),
      color: PALETTE[(items || []).length % PALETTE.length],
    };
    
    const dataToSave: any = {
        ...newItemData,
        ...commonProps,
        dueDate: firestore.Timestamp.fromDate(newItemData.dueDate)
    };
    
    const docRef = await db.collection('items').add(dataToSave);
    
    // If a task was created and assigned to a project, update the project's task list
    if (dataToSave.type === ItemType.TASK && dataToSave.projectId) {
        const projectRef = db.collection('items').doc(dataToSave.projectId);
        await projectRef.update({
            tasks: firestore.FieldValue.arrayUnion(docRef.id)
        });
    }

    const assigneeName = users?.find(u => u.id === dataToSave.assigneeId)?.name || 'Unknown';
    logActivity(LogActionType.CREATE_ITEM, {
        itemTitle: dataToSave.title,
        itemType: dataToSave.type,
        assigneeName,
        itemId: docRef.id,
    });
  };

  const handleUpdateItem = async (updatedItemData: AppItem) => {
    const originalItem = items?.find(i => i.id === updatedItemData.id);
    if (!originalItem) return;

    // Log status change
    if (originalItem.status !== updatedItemData.status) {
        logActivity(LogActionType.UPDATE_ITEM_STATUS, {
            itemId: originalItem.id,
            itemTitle: originalItem.title,
            oldStatus: originalItem.status,
            newStatus: updatedItemData.status,
        });
    }

    let finalUpdatedData: any = { ...updatedItemData };
    delete finalUpdatedData.id; // Don't save id in the document body

    const isCompletingTask =
        finalUpdatedData.type === ItemType.TASK &&
        finalUpdatedData.status === ItemStatus.COMPLETED &&
        originalItem.status !== ItemStatus.COMPLETED;

    if (isCompletingTask) {
        const task = finalUpdatedData as Task;
        const completionDate = new Date();
        task.completedOn = completionDate;
        
        if (isBefore(startOfDay(task.dueDate), startOfDay(completionDate))) {
            task.overdueDays = differenceInDays(startOfDay(completionDate), startOfDay(task.dueDate));
        } else {
            task.overdueDays = 0;
        }
    }
    
    // Convert Dates to Timestamps before saving
    finalUpdatedData.createdAt = firestore.Timestamp.fromDate(finalUpdatedData.createdAt);
    finalUpdatedData.dueDate = firestore.Timestamp.fromDate(finalUpdatedData.dueDate);
    if (finalUpdatedData.completedOn) {
        finalUpdatedData.completedOn = firestore.Timestamp.fromDate(finalUpdatedData.completedOn);
    } else {
        delete finalUpdatedData.completedOn; // FIX: Prevent sending 'undefined' to Firestore
    }
    
    const itemDocRef = db.collection('items').doc(updatedItemData.id);
    await itemDocRef.update(finalUpdatedData);
  };

  const showLogin = isAuthResolved && !currentUser;
  if (showLogin) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }
  
  const isAppReady = currentUser && users && items;
  if (!isAppReady) {
    return <AppSkeleton />;
  }

  return (
    <div className="bg-surface-main text-text-primary min-h-screen font-sans flex flex-col h-screen">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onManageUsers={() => setUserListModalOpen(true)}
        onGoToLog={() => setActiveView('log')}
      />

      {activeView === 'log' ? (
        <LogPage
          logs={logs}
          onLoadMore={() => fetchLogs(true)}
          isLoadingMore={isLoadingMoreLogs}
          hasMore={hasMoreLogs}
          onGoBack={() => setActiveView('dashboard')}
          indexError={logIndexError}
          onRetry={() => fetchLogs(false)}
        />
      ) : (
        <>
          <div className="p-4 bg-surface-card border-b border-border-main flex flex-col md:flex-row items-center justify-between gap-y-4 gap-x-2 sticky top-[68px] z-20 shrink-0">
            <div className="flex items-center justify-between md:justify-start w-full md:w-auto">
              <h2 className="text-2xl font-bold text-text-primary">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-slate-200"><ChevronLeftIcon className="w-6 h-6 text-text-secondary" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-1 border border-border-main rounded-lg hover:bg-slate-200">Today</button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-slate-200"><ChevronRightIcon className="w-6 h-6 text-text-secondary" /></button>
                </div>
            </div>

            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                <div className="flex items-center bg-surface-main p-1 rounded-lg">
                    <button onClick={() => setView('month')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${ view === 'month' ? 'bg-brand-primary text-white shadow' : 'text-text-secondary hover:bg-surface-card' }`}>
                        <CalendarIcon className="w-5 h-5" /> Month
                    </button>
                    <button onClick={() => setView('date')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${ view === 'date' ? 'bg-brand-primary text-white shadow' : 'text-text-secondary hover:bg-surface-card' }`}>
                        <ListIcon className="w-5 h-5" /> Date
                    </button>
                </div>

                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-bold transition-all shadow-lg
                            fixed bottom-6 right-6 z-40 rounded-full p-4 
                            md:static md:flex md:items-center md:gap-2 md:rounded-lg md:p-0 md:py-2 md:px-4 md:shadow-none"
                  aria-label="Add or Assign Task"
                >
                  <PlusIcon className="h-6 w-6 md:h-5 md:w-5" />
                  <span className="hidden md:inline">Add Task</span>
                </button>
            </div>
          </div>
          
          <main className="flex-grow overflow-hidden">
            {view === 'month' ? (
              <MonthView items={items} users={users} currentDate={currentDate} onSelectItem={setSelectedItem} />
            ) : (
              <DateView items={items} users={users} currentDate={currentDate} onSelectItem={setSelectedItem} onVisibleDateChange={setCurrentDate} />
            )}
          </main>
        </>
      )}

      <CreateItemModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateItem}
        currentUser={currentUser}
        staffList={staffList}
        items={items}
      />

      <TaskDetailModal 
        isOpen={!!selectedItem}
        item={selectedItem}
        allItems={items}
        users={users}
        currentUser={currentUser}
        onClose={() => setSelectedItem(null)}
        onUpdate={handleUpdateItem}
        onSelectItem={setSelectedItem}
      />
      
      {currentUser.role === Role.SUPER_ADMIN && (
        <>
            <UserManagementListModal 
                isOpen={isUserListModalOpen}
                onClose={() => setUserListModalOpen(false)}
                users={users}
                onOpenCreateModal={() => {
                    setUserListModalOpen(false);
                    setCreateUserModalOpen(true);
                }}
            />
            <CreateUserModal 
                isOpen={isCreateUserModalOpen}
                onClose={() => setCreateUserModalOpen(false)}
                onCreateUser={handleCreateUser}
            />
        </>
      )}

      <InstallPWAButton />
    </div>
  );
};

export default App;