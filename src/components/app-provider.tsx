
'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, signOut, onAuthStateChanged } from 'firebase/auth';
import {
    doc,
    getDoc,
    onSnapshot,
    setDoc,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter as useNextRouter } from 'next/navigation';
import { useUI } from './ui-provider';
import type { UserProfile } from '@/types/models';

interface AppContextType {
    user: User | null;
    userData: UserProfile | null;
    updateUserBiometricStatus: (isBiometricEnabled: boolean) => Promise<void>;
    isLoading: boolean;
    handleSignOut: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useNextRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useUI();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (!user) {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setUserData(null);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userDocRef, snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.data() as Partial<UserProfile>;
                setUserData({ id: snapshot.id, ...data } as UserProfile);
            } else {
                setUserData({ id: user.uid } as UserProfile);
            }
            setIsLoading(false);
        }, error => {
            console.error("Error fetching user data:", error);
            setIsLoading(false);
        });

        return () => {
            unsubUser();
        };
    }, [user]);
    
    const updateUserBiometricStatus = useCallback(async (isBiometricEnabled: boolean) => {
        if (!user) throw new Error("User not authenticated.");
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { isBiometricEnabled }, { merge: true });
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lemon_biometric_user');
            }
            showToast("Kamu berhasil keluar.", 'info');
            router.push('/');
        } catch (error) {
            showToast("Gagal keluar.", 'error');
            console.error("Sign out error:", error);
        }
    };

    const contextValue: AppContextType = {
        user,
        userData,
        updateUserBiometricStatus,
        isLoading,
        handleSignOut,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
