import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import AuthModal from '@/components/AuthModal';

// Types
export interface User {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    initials?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    protectAction: (action: () => void, redirectMetadata?: any) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { supabase } from '@/lib/supabaseClient';

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ fn: () => void } | null>(null);
    const [redirectMetadata, setRedirectMetadata] = useState<any | null>(null);

    // Initial Load & Auth Listener
    useEffect(() => {
        // 1. Check active session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchAndSyncProfile(session.user);
                // Prompt: On app initialization...If session exists...Redirect away from /login to home page (/)
                if (router.pathname === '/login' || router.pathname === '/signup') {
                    router.push('/');
                }
            } else {
                setUser(null);
                // Backward compatibility: Clear legacy local storage if we want to enforce Supabase only
                // localStorage.removeItem('amma_user'); 
            }
            setIsLoading(false);
        };

        checkSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    await fetchAndSyncProfile(session.user);
                    // Redirect to home if on a public auth page, or if just signed in
                    // Note: Ideally check if query contains return path, otherwise home.
                    // But prompt asks for: On SIGNED_IN -> Redirect user to home page (/)
                    if (event === 'SIGNED_IN') {
                        router.push('/');
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setPendingAction(null);
                localStorage.removeItem('amma_user');
                router.push('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Sync Profile Logic
    const fetchAndSyncProfile = async (authUser: any) => {
        try {
            // Check if profile exists
            const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            const metaAvatar = authUser.user_metadata?.avatar_url;
            const metaName = authUser.user_metadata?.full_name;

            if (profile) {
                // SYNC: Update profile ONLY if fields are missing (never overwrite)
                const updates: any = {};
                let hasUpdates = false;

                if (!profile.avatar_url && metaAvatar) {
                    updates.avatar_url = metaAvatar;
                    hasUpdates = true;
                }
                if (!profile.full_name && metaName) {
                    updates.full_name = metaName;
                    hasUpdates = true;
                }

                if (hasUpdates) {
                    updates.updated_at = new Date().toISOString();
                    const { error: updateError } = await supabase
                        .from('user_profiles')
                        .update(updates)
                        .eq('id', authUser.id);

                    if (!updateError) {
                        // Apply updates locally so UI reflects them immediately
                        Object.assign(profile, updates);
                    }
                }

                updateUserState(authUser, profile);

            } else if ((!profile && error) || (!profile && !error)) {
                // Create new profile if not exists
                const newProfile = {
                    id: authUser.id,
                    full_name: metaName || null,
                    avatar_url: metaAvatar || null,
                    phone: null,
                    preferences: {},
                    updated_at: new Date().toISOString(),
                };

                const { data: insertedProfile, error: insertError } = await supabase
                    .from('user_profiles')
                    .insert(newProfile)
                    .select()
                    .single();

                if (insertedProfile) {
                    updateUserState(authUser, insertedProfile);
                } else {
                    // Insert returned null or error was swallowed above?
                    // Fallback to basic state
                    const fallbackProfile = {
                        full_name: metaName || authUser.user_metadata?.full_name || null,
                        phone: authUser.phone || null,
                        avatar_url: metaAvatar || null
                    };
                    updateUserState(authUser, fallbackProfile);
                }
            }
        } catch (err) {
            console.error("Profile sync error:", err);
            // FALLBACK: If profile sync fails (RLS, Network, etc), allow login with basic data
            const fallbackProfile = {
                full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                phone: authUser.user_metadata?.phone || null,
            };
            updateUserState(authUser, fallbackProfile);
        }
    };

    const updateUserState = (authUser: any, profile: any) => {
        const userData: User = {
            id: authUser.id,
            email: authUser.email,
            name: profile.full_name,
            phone: profile.phone,
            avatar_url: profile.avatar_url,
            initials: profile.full_name ? profile.full_name.charAt(0).toUpperCase() : authUser.email.charAt(0).toUpperCase()
        };
        setUser(userData);
        localStorage.setItem('amma_user', JSON.stringify(userData)); // Keep for legacy compatibility

        // Resume pending action if any
        if (pendingAction) {
            const action = pendingAction.fn;
            setPendingAction(null);
            action();
        }
    };

    // Login Logic (Now uses Supabase)
    const login = async (userData: User) => {
        // This is mainly for legacy manual override or if we want to optimistic update. 
        // But with Supabase, we rely on the listener. 
        // The Prompt implies "Single Source of Truth", so we shouldn't manually set user here without auth.
        // However, if the existing Login page calls this, we might need to update Login page too.
        // For now, let's assume 'login' in context is just a bridge.
        // Actually, we should expose signInWith... methods or let pages call Supabase directly.
        // Let's keep it simple: The pages will call supabase.auth.signIn... and the listener will handle state.
        // We can just log here.
        console.log("Context Login called - relying on Supabase Listener");
    };

    // Logout Logic
    const logout = async () => {
        await supabase.auth.signOut();
        // Listener handles the rest
    };

    /**
     * Protects an action.
     * If auth: executes action immediately.
     * If not auth: opens modal and stores intent.
     */
    const protectAction = (action: () => void, metadata?: any) => {
        if (user) {
            action();
        } else {
            setPendingAction({ fn: action }); // Storing function reference (only works for same-page actions if not reloading)
            if (metadata) {
                setRedirectMetadata(metadata);
                // Persist for cross-page redirects (e.g. login page redirect)
                sessionStorage.setItem('auth_redirect', JSON.stringify(metadata));
                sessionStorage.setItem('auth_return_path', router.asPath);
            }
            setIsModalOpen(true);
        }
    };

    // Handle Login Navigation from Modal
    const handleLoginNavigation = () => {
        setIsModalOpen(false);
        // If we have metadata (like page path), we might want to pass it to login page?
        // But for now we rely on sessionStorage 'auth_redirect' checked by Login page logic
        router.push('/login');
    };

    const handleSignupNavigation = () => {
        setIsModalOpen(false);
        router.push('/signup');
    };

    // Expose Context
    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            protectAction,
            isAuthenticated: !!user
        }}>
            {children}
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLogin={handleLoginNavigation}
                onSignup={handleSignupNavigation}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
