'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/user-avatar';
import { useAuth } from '@/providers/auth-provider';
import { LogOut, Settings, User } from 'lucide-react';

export const UserProfileDropdown = () => {
    const router = useRouter();
    const { userData, handleSignOut } = useAuth();

    const handleLogout = async () => {
        try {
            if (handleSignOut) {
                await handleSignOut();
            }
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (!userData) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button 
                    className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Menu profil"
                >
                    <UserAvatar 
                        name={userData.displayName} 
                        src={userData.photoURL} 
                        className="h-9 w-9" 
                    />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userData.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                            {userData.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};