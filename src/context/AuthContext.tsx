import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import AuthModal from '@/components/AuthModal';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ fn: () => void } | null>(null);
    const [redirectMetadata, setRedirectMetadata] = useState<any | null>(null);

    // Initial Load & Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                await fetchAndSyncProfile(firebaseUser);

                // Redirect logic if on login/signup pages
                if (router.pathname === '/login' || router.pathname === '/signup') {
                    router.push('/');
                }
            } else {
                // User is signed out
                setUser(null);
                localStorage.removeItem('amma_user');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sync Profile Logic (Firestore)
    const fetchAndSyncProfile = async (firebaseUser: FirebaseUser) => {
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            let profileData: any = {};

            if (userDocSnap.exists()) {
                profileData = userDocSnap.data();
            } else {
                // If no profile exists (e.g. first login via Google?), create one
                // Usually signup creates it, but this is a fallback
                profileData = {
                    email: firebaseUser.email,
                    full_name: firebaseUser.displayName,
                    avatar_url: firebaseUser.photoURL,
                    created_at: new Date().toISOString()
                };
                // We typically want to write this back if it's missing, but let's just use it conceptually
                // Optionally write back:
                await setDoc(userDocRef, profileData, { merge: true });
            }

            const userData: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: profileData.full_name || firebaseUser.displayName || '',
                phone: profileData.phone || '',
                avatar_url: profileData.avatar_url || firebaseUser.photoURL || '',
                initials: (profileData.full_name || firebaseUser.displayName || firebaseUser.email || 'A').charAt(0).toUpperCase()
            };

            setUser(userData);
            localStorage.setItem('amma_user', JSON.stringify(userData));

            // Resume pending action if any
            if (pendingAction) {
                const action = pendingAction.fn;
                setPendingAction(null);
                action();
            }

        } catch (err) {
            console.error("Profile sync error:", err);
            // Fallback
            const userData: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || '',
                initials: (firebaseUser.email || 'A').charAt(0).toUpperCase()
            };
            setUser(userData);
        }
    };

    // Login Logic (Now just for compatibility/logging, real auth happens in pages)
    const login = async (userData: User) => {
        console.log("Context Login called - relying on Firebase Listener");
    };

    // Logout Logic
    const logout = async () => {
        await signOut(auth);
        router.push('/login');
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
            setPendingAction({ fn: action });
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
