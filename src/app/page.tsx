
'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { format, isToday, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { ChevronLeft, CalendarIcon, AlertCircle, PlusCircle, Trash2, Edit2, Wallet, Banknote, Landmark, Utensils, TShirt, Gift, Home, Car, Phone, Gamepad2, Briefcase, GraduationCap, Wrench, Handshake, PiggyBank, BarChart3, Settings, X, Plus, ShoppingCart, Bell, HandCoins, Target, TrendingUp, ArrowUp, ArrowDown, HeartPulse } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { toast, Toaster } from 'sonner';
import { auth, db } from '@/lib/firebase';
import { cn, formatCurrency } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';


// ============================================================================
// 1. App Context
// ============================================================================

const AppContext = createContext<{
    router: { push: (page: string) => void; back: () => void; };
    activePage: string;
    wallets: any[];
    transactions: any[];
    budgets: any[];
    expenseCategories: any[];
    incomeCategories: any[];
    addTransaction: (data: any) => Promise<void>;
    deleteTransaction: (transaction: any) => Promise<void>;
    addWallet: (walletData: any) => Promise<void>;
    addBudget: (budgetData: any) => Promise<void>;
    isLoading: boolean;
} | null>(null);

const useData = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useData must be used within an AppProvider');
    }
    return context;
};

// ============================================================================
// 2. Utility Functions & Data
// ============================================================================

const walletVisuals: Record<string, { name: string; Icon: React.ElementType; color: string }> = {
  wallet: { name: 'Dompet', Icon: Wallet, color: 'bg-indigo-500' },
  bank: { name: 'Bank', Icon: Banknote, color: 'bg-teal-500' },
  landmark: { name: 'Lainnya', Icon: Landmark, color: 'bg-orange-500' },
};
const getWalletVisuals = (key: string) => walletVisuals[key] || walletVisuals.wallet;

const categories = {
  expense: [
    { id: 'cat-e-1', name: 'Makanan & Minuman', icon: Utensils },
    { id: 'cat-e-2', name: 'Belanja', icon: ShoppingCart },
    { id: 'cat-e-3', name: 'Transportasi', icon: Car },
    { id: 'cat-e-4', name: 'Tagihan & Utilitas', icon: Phone },
    { id: 'cat-e-5', name: 'Hiburan', icon: Gamepad2 },
    { id: 'cat-e-6', name: 'Rumah', icon: Home },
    { id: 'cat-e-7', name: 'Pendidikan', icon: GraduationCap },
    { id: 'cat-e-8', name: 'Kesehatan', icon: HeartPulse },
    { id: 'cat-e-9', name: 'Lain-lain', icon: Wrench },
  ],
  income: [
    { id: 'cat-i-1', name: 'Gaji', icon: Briefcase },
    { id: 'cat-i-2', name: 'Bonus', icon: Gift },
    { id: 'cat-i-3', name: 'Investasi', icon: PiggyBank },
    { id: 'cat-i-4', name: 'Lain-lain', icon: Handshake },
  ],
};
const categoryDetails = (name: string) => {
  const allCategories = [...categories.expense, ...categories.income];
  const category = allCategories.find(c => c.name === name);
  return category || { name: 'Lain-lain', icon: Wrench };
};

// ============================================================================
// 3. Komponen UI Dasar
// ============================================================================

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => <label htmlFor={htmlFor} className="text-sm font-medium">{children}</label>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />;
const Button = ({ variant, size, className, ...props }: { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"; size?: "default" | "sm" | "lg" | "icon"; className?: string; [key: string]: any }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      {
        "default": "bg-primary text-primary-foreground hover:bg-primary/90",
        "destructive": "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        "outline": "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "ghost": "hover:bg-accent hover:text-accent-foreground",
        "link": "text-primary underline-offset-4 hover:underline",
      }[variant || "default"],
      {
        "default": "h-10 px-4 py-2",
        "sm": "h-9 rounded-md px-3",
        "lg": "h-11 rounded-md px-8",
        "icon": "h-10 w-10",
      }[size || "default"],
      className
    )}
    {...props}
  />
);

const RadioGroupItem = ({ value, id, className, labelClassName, children, ...props }: { value: string; id: string; className?: string; labelClassName?: string; children: React.ReactNode; [key: string]: any }) => (
  <>
    <input type="radio" value={value} id={id} className="sr-only" {...props} />
    <label
      htmlFor={id}
      className={cn(
        "flex h-10 w-full cursor-pointer items-center justify-center rounded-full px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        labelClassName
      )}
    >
      {children}
    </label>
  </>
);

// ============================================================================
// 4. Komponen Halaman dan Fungsionalitas
// ============================================================================

const useNavigation = () => {
    const { router } = useData();
    const back = () => router.back();
    return { back };
};

const AddTransactionForm = () => {
    const { back } = useNavigation();
    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={back}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Tambah Transaksi</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4 pb-24 animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-muted-foreground text-center p-8">Formulir akan muncul di sini.</p>
                </div>
            </div>
            <div className="bg-background/80 backdrop-blur-lg p-4 border-t shrink-0 fixed bottom-0 w-full max-w-md mx-auto">
                <Button size="lg" className="w-full">
                    Simpan Transaksi
                </Button>
            </div>
        </div>
    );
};

const TransactionListItem = ({ transaction, onEdit, onDelete }: { transaction: any; onEdit: (t: any) => void; onDelete: (t: any) => void; }) => {
    const [swipeState, setSwipeState] = useState(0);
    const itemRef = useRef<HTMLDivElement>(null);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            setSwipeState(-1);
            if(itemRef.current) itemRef.current.style.transform = `translateX(-80px)`;
        },
        onSwipedRight: () => {
             setSwipeState(1);
             if(itemRef.current) itemRef.current.style.transform = `translateX(80px)`;
        },
        onTap: () => {
             setSwipeState(0);
             if(itemRef.current) itemRef.current.style.transform = `translateX(0px)`;
        },
        trackMouse: true,
    });
    
    const { icon: CategoryIcon } = categoryDetails(transaction.category);
    const isExpense = transaction.type === 'expense';
    const { wallets } = useData();
    const wallet = wallets.find(w => w.id === transaction.walletId);
    
    return (
        <div className="relative overflow-hidden rounded-lg">
             <AnimatePresence>
                {swipeState === -1 && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 80 }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-0 h-full flex items-center justify-end"
                    >
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-full w-20 rounded-none"
                            onClick={(e) => { e.stopPropagation(); onDelete(transaction);}}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
                 {swipeState === 1 && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 80 }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-0 h-full flex items-center justify-start"
                    >
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-full w-20 rounded-none"
                            onClick={(e) => { e.stopPropagation(); onEdit(transaction);}}
                        >
                            <Edit2 className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
            <div
                ref={itemRef}
                {...handlers}
                className={cn(
                    "flex items-center gap-3 p-3 transition-transform duration-300 ease-in-out cursor-pointer relative bg-card"
                )}
                onClick={() => {
                    setSwipeState(0);
                    if(itemRef.current) itemRef.current.style.transform = `translateX(0px)`;
                }}
            >
                <div className={cn("flex-shrink-0 p-2 rounded-full", isExpense ? 'bg-rose-100 dark:bg-rose-900' : 'bg-green-100 dark:bg-green-900')}>
                    <CategoryIcon className={cn("h-5 w-5", isExpense ? 'text-rose-600' : 'text-green-600')} />
                </div>
                <div className="flex-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">{wallet?.name} &bull; {format(parseISO(transaction.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}</div>
                </div>
                <div className="text-sm font-semibold text-right">
                    <span className={isExpense ? 'text-rose-600' : 'text-green-600'}>
                        {isExpense ? '- ' : '+ '}{formatCurrency(transaction.amount)}
                    </span>
                </div>
            </div>
        </div>
    );
};


const BottomNavigation = () => {
    const { router, activePage } = useData();
    const navItems = [
        { id: 'home', icon: Home, name: 'Beranda' },
        { id: 'budgeting', icon: PiggyBank, name: 'Anggaran' },
        { id: 'add', icon: PlusCircle, name: 'Tambah', primary: true },
        { id: 'charts', icon: BarChart3, name: 'Analisis' },
        { id: 'settings', icon: Settings, name: 'Pengaturan' },
    ];

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t"
        >
            <div className="w-full max-w-md mx-auto flex h-16 items-center justify-around">
                {navItems.map(item => (
                    <Button
                        key={item.id}
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(item.id)}
                        className={cn(
                            "flex flex-col items-center justify-center h-full w-1/5 text-muted-foreground rounded-none",
                            activePage === item.id && "text-primary",
                            item.primary && "rounded-full h-12 w-12 bg-primary text-white shadow-lg -translate-y-4 hover:bg-primary/90"
                        )}
                    >
                        <item.icon className={cn("h-6 w-6", item.primary && "h-7 w-7")} />
                        {!item.primary && <span className="text-[10px] mt-1">{item.name}</span>}
                    </Button>
                ))}
            </div>
        </motion.div>
    );
};

// ============================================================================
// 5. Main App Component
// ============================================================================

function App() {
  const [activePage, setActivePage] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = {
    push: setActivePage,
    back: () => setActivePage('home'),
  };
  const showBottomNav = ['home', 'budgeting', 'charts', 'settings'].includes(activePage);

  const [userId, setUserId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);

  const getWalletCollection = useCallback(() => collection(db, `users/${userId}/wallets`), [userId]);
  const getTransactionCollection = useCallback(() => collection(db, `users/${userId}/transactions`), [userId]);
  const getBudgetCollection = useCallback(() => collection(db, `users/${userId}/budgets`), [userId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          toast.error("Gagal terhubung ke server.");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const walletsQuery = query(getWalletCollection(), orderBy("createdAt", "desc"));
    const transactionsQuery = query(getTransactionCollection(), orderBy("date", "desc"));
    const budgetsQuery = query(getBudgetCollection(), orderBy("createdAt", "desc"));

    const unsubscribeWallets = onSnapshot(walletsQuery, (snapshot) => {
      const walletsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallets(walletsData);
      setIsLoading(false);
    });

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(transactionsData);
    });

    const unsubscribeBudgets = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBudgets(budgetsData);
    });

    return () => {
      unsubscribeWallets();
      unsubscribeTransactions();
      unsubscribeBudgets();
    };
  }, [userId, getWalletCollection, getTransactionCollection, getBudgetCollection]);

  const addTransaction = useCallback(async (data: any) => {
    if (!userId) return;
    const walletRef = doc(db, getWalletCollection().path, data.walletId);
    await addDoc(getTransactionCollection(), data);
    const walletDoc = await getDoc(walletRef);
    if (walletDoc.exists()) {
      const currentBalance = walletDoc.data().balance;
      const newBalance = data.type === 'income' ? currentBalance + data.amount : currentBalance - data.amount;
      await updateDoc(walletRef, { balance: newBalance });
    }
  }, [userId, getTransactionCollection, getWalletCollection]);
  
  const addWallet = useCallback(async (walletData: any) => {
    try {
      if (!userId) throw new Error("User not authenticated.");
      await addDoc(getWalletCollection(), { ...walletData, balance: 0, createdAt: new Date().toISOString() });
      toast.success("Dompet berhasil dibuat!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding wallet:", error);
      toast.error("Gagal membuat dompet.");
    }
  }, [userId, getWalletCollection]);

  const addBudget = useCallback(async (budgetData: any) => {
    try {
      if (!userId) throw new Error("User not authenticated.");
      await addDoc(getBudgetCollection(), { ...budgetData, spent: 0, createdAt: new Date().toISOString() });
      toast.success("Anggaran berhasil dibuat!");
      setIsBudgetModalOpen(false);
    } catch (error) {
      console.error("Error adding budget:", error);
      toast.error("Gagal membuat anggaran.");
    }
  }, [userId, getBudgetCollection]);

  const deleteTransaction = useCallback(async (transaction: any) => {
    if (!userId) return;
    const transactionRef = doc(db, getTransactionCollection().path, transaction.id);
    const walletRef = doc(db, getWalletCollection().path, transaction.walletId);
    
    const originalTransaction = { ...transaction };
    // remove id from original transaction
    delete originalTransaction.id;


    const batch = writeBatch(db);

    batch.delete(transactionRef);
    
    const walletDoc = await getDoc(walletRef);
    if (walletDoc.exists()) {
      const currentBalance = walletDoc.data().balance;
      const newBalance = transaction.type === 'income'
        ? currentBalance - transaction.amount
        : currentBalance + transaction.amount;
      batch.update(walletRef, { balance: newBalance });
    }

    await batch.commit();

    toast.success("Transaksi berhasil dihapus!", {
        action: {
            label: "Urungkan",
            onClick: async () => {
                const undoBatch = writeBatch(db);
                // Use addDoc to create a new document with a new ID
                const newTransactionRef = doc(getTransactionCollection());
                undoBatch.set(newTransactionRef, originalTransaction);
                
                const walletDoc = await getDoc(walletRef);
                if (walletDoc.exists()) {
                    const currentBalance = walletDoc.data().balance;
                    const revertedBalance = originalTransaction.type === 'income'
                        ? currentBalance + originalTransaction.amount
                        : currentBalance - originalTransaction.amount;
                    undoBatch.update(walletRef, { balance: revertedBalance });
                }
                await undoBatch.commit();
                toast.success("Penghapusan berhasil diurungkan.");
            }
        }
    });
  }, [userId, getTransactionCollection, getWalletCollection]);

  const contextValue = {
    wallets,
    transactions,
    budgets,
    expenseCategories: categories.expense,
    incomeCategories: categories.income,
    addTransaction,
    deleteTransaction,
    addWallet,
    addBudget,
    isLoading,
    router,
    activePage,
  };

  const renderPage = () => {
    switch(activePage) {
      case 'home':
        return <HomePage />;
      case 'add':
        return <AddTransactionPage />;
      case 'wallets':
        return <WalletsPage onAddWallet={() => setIsModalOpen(true)} />;
      case 'charts':
        return <ChartsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'budgeting':
        return <BudgetingPage onAddBudget={() => setIsBudgetModalOpen(true)} />;
      case 'goals':
        return <GoalsPage />;
      case 'assets_liabilities':
        return <AssetsLiabilitiesPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-zinc-900 dark:text-gray-50 flex flex-col items-center p-0 md:p-8 font-sans">
        <div className="w-full max-w-md h-dvh md:h-auto md:min-h-[700px] bg-background border-border md:border md:rounded-lg md:shadow-2xl relative flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {isModalOpen && <AddWalletModal onClose={() => setIsModalOpen(false)} />}
            {isBudgetModalOpen && <AddBudgetModal onClose={() => setIsBudgetModalOpen(false)} />}
            {isDeleteModalOpen && transactionToDelete && (
              <ConfirmDeleteModal
                transaction={transactionToDelete}
                onClose={() => {
                  setIsDeleteModalOpen(false);
                  setTransactionToDelete(null);
                }}
                onConfirm={async () => {
                  try {
                    await deleteTransaction(transactionToDelete);
                  } catch (error) {
                    console.error("Gagal menghapus transaksi:", error);
                    toast.error("Gagal menghapus transaksi.");
                  } finally {
                    setIsDeleteModalOpen(false);
                    setTransactionToDelete(null);
                  }
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
      <Toaster position="top-center" richColors />
      <AnimatePresence>
        {showBottomNav && <BottomNavigation />}
      </AnimatePresence>
    </AppContext.Provider>
  );
}

// ============================================================================
// 6. Page Components
// ============================================================================

const HomePage = () => {
  const { wallets, transactions, router, deleteTransaction } = useData();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);

  const openDeleteModal = (transaction: any) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };
  
  const handleEdit = (transaction: any) => {
    toast.info("Fitur edit akan segera hadir!");
    console.log("Edit transaction:", transaction);
  }

  const handleConfirmDelete = async () => {
    if(!transactionToDelete) return;
    try {
      await deleteTransaction(transactionToDelete);
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
      toast.error("Gagal menghapus transaksi.");
    } finally {
      closeDeleteModal();
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-16">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <h1 className="text-xl font-bold">Ringkasan</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('notifications')}>
            <Bell className="h-6 w-6" strokeWidth={1.75} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push('settings')}>
            <Settings className="h-6 w-6" strokeWidth={1.75} />
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dompet Anda</h2>
            <Button onClick={() => router.push('wallets')} variant="link" size="sm">Lihat Semua</Button>
          </div>
          {wallets.length === 0 ? (
            <div className="text-muted-foreground text-sm">Anda belum memiliki dompet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {wallets.slice(0, 2).map(wallet => {
                const { Icon, color } = getWalletVisuals(wallet.icon);
                return (
                  <div key={wallet.id} className={cn("p-4 rounded-lg text-white", color)}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-medium opacity-80">{wallet.name}</span>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(wallet.balance)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
            <Button variant="link" size="sm" onClick={() => router.push('transactions')}>Lihat Semua</Button>
          </div>
          {transactions.length === 0 ? (
            <div className="text-muted-foreground text-sm text-center py-8">Tidak ada transaksi.</div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map(t => (
                <TransactionListItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={openDeleteModal} />
              ))}
            </div>
          )}
        </div>
      </main>
      <AnimatePresence>
        {isDeleteModalOpen && transactionToDelete && (
          <ConfirmDeleteModal
            transaction={transactionToDelete}
            onClose={closeDeleteModal}
            onConfirm={handleConfirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddTransactionPage = () => {
  return <AddTransactionForm />;
};

const WalletsPage = ({ onAddWallet }: { onAddWallet: () => void }) => {
  const { wallets, router } = useData();
  const { back } = router;

  return (
    <div className="flex flex-col h-full">
      <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
        <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.push('home')}>
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Button>
        <h1 className="text-xl font-bold text-center w-full">Dompet Saya</h1>
        <Button variant="ghost" size="icon" className="absolute right-4" onClick={onAddWallet}>
          <Plus className="h-6 w-6" strokeWidth={1.75} />
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {wallets.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center">
            <div className="p-3 bg-destructive/10 rounded-full mb-3">
              <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold">Tidak ada Dompet</h2>
            <p className="text-muted-foreground mt-2 mb-6">Buat dompet pertama Anda untuk memulai.</p>
            <Button onClick={onAddWallet}>
              <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
              Buat Dompet
            </Button>
          </div>
        ) : (
          wallets.map(wallet => {
            const { Icon, color } = getWalletVisuals(wallet.icon);
            return (
              <div key={wallet.id} className={cn("p-4 rounded-lg shadow-md text-white", color)}>
                <div className="flex items-center gap-4 mb-2">
                  <Icon className="h-8 w-8 opacity-80" />
                  <div className="flex-1">
                    <p className="text-sm opacity-80">{wallet.name}</p>
                    <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20">
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

const AddWalletModal = ({ onClose }: { onClose: () => void }) => {
  const { addWallet } = useData();
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName) {
      toast.error("Nama dompet tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    await addWallet({ name: walletName, icon: walletType });
    setIsSubmitting(false);
  };

  const handlers = useSwipeable({
    onSwipedDown: onClose,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit md:h-auto"
        onClick={(e) => e.stopPropagation()}
        {...handlers}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
          <h2 className="text-xl font-bold">Buat Dompet Baru</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Nama Dompet</Label>
            <Input
              id="wallet-name"
              placeholder="Contoh: Tabungan, E-Wallet"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Jenis Dompet</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(walletVisuals).map(key => {
                const { name, Icon } = getWalletVisuals(key);
                return (
                  <label key={key} htmlFor={`wallet-type-${key}`} className={cn(
                    "relative flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                    walletType === key ? 'border-primary bg-primary/5' : 'border-muted'
                  )}>
                    <input type="radio" value={key} id={`wallet-type-${key}`} name="wallet-type" className="sr-only" onChange={() => setWalletType(key)} checked={walletType === key} />
                    <Icon className={cn("h-8 w-8", walletType === key ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-medium">{name}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Simpan Dompet'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const BudgetingPage = ({ onAddBudget }: { onAddBudget: () => void }) => {
    const { back } = useNavigation();
    const { budgets } = useData();

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => useData().router.push('home')}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Anggaran</h1>
                <Button variant="ghost" size="icon" className="absolute right-4" onClick={onAddBudget}>
                    <Plus className="h-6 w-6" strokeWidth={1.75} />
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                {budgets.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-center">
                        <div className="p-3 bg-destructive/10 rounded-full mb-3">
                            <HandCoins className="h-8 w-8 text-destructive" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold">Tidak ada Anggaran</h2>
                        <p className="text-muted-foreground mt-2 mb-6">Buat anggaran pertama Anda untuk mengelola keuangan.</p>
                        <Button onClick={onAddBudget}>
                            <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                            Buat Anggaran Sekarang
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        {budgets.map(budget => (
                            <Card key={budget.id} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">{budget.name}</h3>
                                    <span className="text-sm text-muted-foreground">{formatCurrency(budget.spent)} / {formatCurrency(budget.targetAmount)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-700">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(budget.spent / budget.targetAmount) * 100}%` }}></div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {budget.categories.map((catName:string) => {
                                        const { icon: CategoryIcon } = categoryDetails(catName);
                                        return (
                                            <span key={catName} className="text-xs flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                                                <CategoryIcon className="h-3 w-3" strokeWidth={2} />
                                                {catName}
                                            </span>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const AddBudgetModal = ({ onClose }: { onClose: () => void }) => {
  const { addBudget, expenseCategories } = useData();
  const [budgetName, setBudgetName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetName || !targetAmount || selectedCategories.length === 0) {
      toast.error("Semua kolom harus diisi.");
      return;
    }
    setIsSubmitting(true);
    await addBudget({
      name: budgetName,
      targetAmount: parseInt(targetAmount.replace(/[^0-9]/g, '')),
      categories: selectedCategories,
    });
    setIsSubmitting(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9]/g, '');
      const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
      setTargetAmount(formattedValue);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
          <h2 className="text-xl font-bold">Buat Anggaran Baru</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="space-y-2">
            <Label htmlFor="budget-name">Nama Anggaran</Label>
            <Input id="budget-name" placeholder="Contoh: Belanja Bulanan" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-amount">Target Anggaran</Label>
            <Input id="target-amount" placeholder="Rp 0" value={targetAmount} onChange={handleAmountChange} required inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <div className="grid grid-cols-3 gap-2">
              {expenseCategories.map(cat => (
                <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.name)} className={cn("p-2 text-center border rounded-lg flex flex-col items-center gap-2", selectedCategories.includes(cat.name) ? 'border-primary bg-primary/10' : 'border-muted')}>
                  <cat.icon className={cn("h-6 w-6", selectedCategories.includes(cat.name) ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-xs">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Simpan Anggaran'}</Button>
        </form>
      </motion.div>
    </motion.div>
  );
};


const GoalsPage = () => {
    const { router } = useData();
    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.push('home')}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Target Keuangan</h1>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                 <div className="flex flex-col h-full items-center justify-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Target className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold">Segera Hadir</h2>
                    <p className="text-muted-foreground mt-2 mb-6">Fitur target keuangan sedang dalam pengembangan.</p>
                </div>
            </main>
        </div>
    );
};

const ChartsPage = () => {
    const { router } = useData();
    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.push('home')}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Analisis Keuangan</h1>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                 <div className="flex flex-col h-full items-center justify-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <TrendingUp className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold">Segera Hadir</h2>
                    <p className="text-muted-foreground mt-2 mb-6">Fitur analisis keuangan sedang dalam pengembangan.</p>
                </div>
            </main>
        </div>
    );
};

const SettingsPage = () => {
    const { router } = useData();
    const settingsItems = [
        { id: 'wallets', name: 'Kelola Dompet', icon: Wallet, page: 'wallets' },
        { id: 'categories', name: 'Kelola Kategori', icon: Wrench, page: 'categories' },
        { id: 'goals', name: 'Target Keuangan', icon: Target, page: 'goals' },
        { id: 'assets_liabilities', name: 'Aset & Liabilitas', icon: Landmark, page: 'assets_liabilities' },
    ];
    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                 <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.push('home')}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Pengaturan</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-2">
                {settingsItems.map(item => (
                    <button key={item.id} onClick={() => router.push(item.page)} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left">
                        <item.icon className="h-6 w-6 text-muted-foreground" />
                        <span className="font-medium flex-1">{item.name}</span>
                        <ChevronLeft className="h-5 w-5 text-muted-foreground transform rotate-180" />
                    </button>
                ))}
            </main>
        </div>
    );
};

const AssetsLiabilitiesPage = () => {
    const { router } = useData();
    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.push('settings')}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Aset & Liabilitas</h1>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="flex flex-col h-full items-center justify-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Landmark className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold">Segera Hadir</h2>
                    <p className="text-muted-foreground mt-2 mb-6">Fitur Aset & Liabilitas sedang dalam pengembangan.</p>
                </div>
            </main>
        </div>
    );
};

const ConfirmDeleteModal = ({ transaction, onClose, onConfirm }: { transaction: any; onClose: () => void; onConfirm: () => void; }) => {
    const handlers = useSwipeable({
        onSwipedDown: onClose,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });
    const { icon: CategoryIcon } = categoryDetails(transaction.category);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit md:h-auto"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
                    <h2 className="text-xl font-bold text-destructive">Konfirmasi Hapus</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className={cn("flex-shrink-0 p-2 rounded-full", transaction.type === 'expense' ? 'bg-rose-100 dark:bg-rose-900' : 'bg-green-100 dark:bg-green-900')}>
                            <CategoryIcon className={cn("h-5 w-5", transaction.type === 'expense' ? 'text-rose-600' : 'text-green-600')} />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">{transaction.category} &bull; {format(parseISO(transaction.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}</div>
                        </div>
                        <div className="text-sm font-semibold text-right">
                            <span className={transaction.type === 'expense' ? 'text-rose-600' : 'text-green-600'}>
                                {transaction.type === 'expense' ? '- ' : '+ '}{formatCurrency(transaction.amount)}
                            </span>
                        </div>
                    </div>
                    <Button onClick={onConfirm} variant="destructive" className="w-full" size="lg">
                        Hapus Transaksi
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default App;
