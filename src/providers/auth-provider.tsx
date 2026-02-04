'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter as useNextRouter } from 'next/navigation';
import { useUI } from '@/components/ui-provider';
import { logActivity } from '@/lib/audit';
import type { UserProfile } from '@/types/models';

interface AuthContextType {
    user: User | null;
    userData: UserProfile | null;
    isLoading: boolean;
    handleSignOut: () => void;
    updateUserBiometricStatus: (isBiometricEnabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useNextRouter();
    const ui = useUI();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoading(false);
        };
        
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        if (!user) {
            setUserData(null);
            return;
        }

        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (data) {
                setUserData(data as UserProfile);
            } else {
                setUserData({ 
                    id: user.id,
                    email: user.email,
                    displayName: user.user_metadata?.full_name,
                    photoURL: user.user_metadata?.avatar_url
                } as UserProfile);
            }
        };

        fetchProfile();
    }, [user, supabase]);
    
    const updateUserBiometricStatus = useCallback(async (isBiometricEnabled: boolean) => {
        if (!user) throw new Error("User not authenticated.");
        await supabase.from('profiles').upsert({ id: user.id, is_biometric_enabled: isBiometricEnabled });
    }, [user, supabase]);

    const handleSignOut = useCallback(async () => {
        try {
            await logActivity({ action: 'LOGOUT', entity: 'USER' });
            await supabase.auth.signOut();
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lemon_biometric_user');
            }
            ui.showToast("Kamu berhasil keluar.", 'info');
            router.push('/');
        } catch (error) {
            ui.showToast("Gagal keluar.", 'error');
            console.error("Sign out error:", error);
        }
    }, [supabase, ui, router]);

    const contextValue = useMemo(() => ({
        user,
        userData,
        isLoading,
        handleSignOut,
        updateUserBiometricStatus
    }), [user, userData, isLoading, handleSignOut, updateUserBiometricStatus]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
