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
    updateOnboardingStatus: (status: Partial<import('@/types/models').OnboardingStatus>) => Promise<void>;
    updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
    deleteUserData: () => Promise<void>;
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
            // We use select('*') to be as resilient as possible to schema changes
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (error) {
                console.error("Error fetching profile:", error.message, error.details, error.hint);
            }
            
            if (data) {
                // Map DB columns to UserProfile interface dynamically
                // We handle both snake_case (standard) and potential camelCase or alternate names
                setUserData({
                    id: data.id,
                    email: user.email,
                    displayName: data.display_name || data.displayName || data.full_name || user.user_metadata?.full_name,
                    photoURL: data.photo_url || data.photoURL || data.avatar_url || user.user_metadata?.avatar_url,
                    isBiometricEnabled: data.is_biometric_enabled ?? data.isBiometricEnabled ?? false,
                    onboardingStatus: (data.onboarding_status || data.onboardingStatus) ? 
                        (data.onboarding_status || data.onboardingStatus) as import('@/types/models').OnboardingStatus : undefined
                } as UserProfile);
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

    const updateOnboardingStatus = useCallback(async (statusUpdate: Partial<import('@/types/models').OnboardingStatus>) => {
        if (!user || !userData) return;

        const currentStatus = userData.onboardingStatus || {
            steps: { wallet: false, transaction: false, goal: false },
            isDismissed: false
        };

        const newStatus = {
            ...currentStatus,
            ...statusUpdate,
            steps: {
                ...currentStatus.steps,
                ...statusUpdate.steps
            }
        };

        // Resilient update for onboarding status
        const { error } = await supabase
            .from('profiles')
            .update({ 
                onboarding_status: newStatus 
            })
            .eq('id', user.id);

        if (error) {
            console.warn("Onboarding status update failed (likely schema cache), attempting fallback columns:", error.message);
            
            // Fallback: Try with camelCase if snake_case fails
            const { error: fallbackError } = await supabase
                .from('profiles')
                .update({ onboardingStatus: newStatus })
                .eq('id', user.id);
            
            if (fallbackError) {
                console.error("All onboarding status update attempts failed:", fallbackError.message);
            }
        }

        // Optimistically update local state anyway
        setUserData(prev => prev ? { ...prev, onboardingStatus: newStatus } : null);
    }, [user, userData, supabase]);

    const updateProfile = useCallback(async (data: { displayName?: string; photoURL?: string }) => {
        if (!user) throw new Error("User not authenticated.");

        // 1. Update Supabase auth metadata FIRST (This is the source of truth for auth)
        const { error: authError } = await supabase.auth.updateUser({
            data: {
                full_name: data.displayName,
                avatar_url: data.photoURL
            }
        });

        if (authError) {
            console.error("Failed to update auth metadata:", authError.message);
            throw authError;
        }

        // 2. Update public.profiles table (Secondary storage/cache)
        // We attempt to update multiple common column names if display_name fails
        const updatePayload: any = {
            photo_url: data.photoURL,
            photoURL: data.photoURL,
            avatar_url: data.photoURL
        };

        // Try to determine which name column to use
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                display_name: data.displayName,
                ...updatePayload
            })
            .eq('id', user.id);

        if (profileError) {
            console.warn("Primary profile update failed, trying fallback columns:", profileError.message);
            
            // Fallback: try full_name or displayName if display_name failed
            const { error: fallbackError } = await supabase
                .from('profiles')
                .update({
                    full_name: data.displayName,
                    displayName: data.displayName,
                    ...updatePayload
                })
                .eq('id', user.id);
            
            if (fallbackError) {
                console.error("All profile table update attempts failed:", fallbackError.message);
                // We still don't throw because auth metadata was updated successfully in step 1
            }
        }

        // Optimistic refresh of local state
        setUserData(prev => prev ? { 
            ...prev, 
            displayName: data.displayName ?? prev.displayName,
            photoURL: data.photoURL ?? prev.photoURL
        } : null);

        ui.showToast("Profil berhasil diperbarui.", "success");
    }, [user, supabase, ui]);

    const handleSignOut = useCallback(async () => {
        try {
            await logActivity({ action: 'LOGOUT', entity: 'USER' });
            await supabase.auth.signOut();
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lemon_biometric_user');
                sessionStorage.clear();
            }
            ui.showToast("Kamu berhasil keluar.", 'info');
            
            // Hard Redirect to clear all React state and Next.js router cache
            window.location.href = '/';
        } catch (error) {
            ui.showToast("Gagal keluar.", 'error');
            console.error("Sign out error:", error);
        }
    }, [supabase, ui, router]);

    const deleteUserData = useCallback(async () => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.rpc('delete_user_data', { p_user_id: user.id });
        
        if (error) {
            console.error("Failed to delete user data:", error.message);
            throw error;
        }

        // After data deletion, sign out the user
        await handleSignOut();
    }, [user, supabase, handleSignOut]);

    const contextValue = useMemo(() => ({
        user,
        userData,
        isLoading,
        handleSignOut,
        updateUserBiometricStatus,
        updateOnboardingStatus,
        updateProfile,
        deleteUserData
    }), [user, userData, isLoading, handleSignOut, updateUserBiometricStatus, updateOnboardingStatus, updateProfile, deleteUserData]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
