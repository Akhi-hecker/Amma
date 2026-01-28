import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export const useGuestMigration = () => {
    const { user } = useAuth();

    useEffect(() => {
        const migrateGuestData = async () => {
            if (!user) return;

            // --- 1. Migrate Shopping Bag (amma_guest_bag) ---
            const guestBagJSON = localStorage.getItem('amma_guest_bag');
            if (guestBagJSON) {
                try {
                    const guestItems = JSON.parse(guestBagJSON);
                    if (Array.isArray(guestItems) && guestItems.length > 0) {
                        const draftsRef = collection(db, 'users', user.id, 'drafts');

                        await Promise.all(guestItems.map(async (item) => {
                            // Remove guest-specific ID and display details before saving
                            const { id, _displayDetails, ...dataToSave } = item;
                            await addDoc(draftsRef, dataToSave);
                        }));

                        // Clear local storage after successful migration
                        localStorage.removeItem('amma_guest_bag');
                        // Dispatch event to update navbar count
                        window.dispatchEvent(new Event('bagUpdated'));
                    }
                } catch (e) {
                    console.error("Cart migration failed", e);
                }
            }

            // --- 2. Migrate Wishlist (user_wishlist) ---
            const guestWishlistJSON = localStorage.getItem('user_wishlist');
            if (guestWishlistJSON) {
                try {
                    const guestWishlistIds = JSON.parse(guestWishlistJSON);
                    if (Array.isArray(guestWishlistIds) && guestWishlistIds.length > 0) {

                        // Check each ID
                        await Promise.all(guestWishlistIds.map(async (designId: string) => {
                            // Fetch design details first (since we only stored ID locally)
                            // Ideally, we replicate the logic of saving full design object as per designs.tsx
                            try {
                                const designRef = doc(db, 'designs', designId);
                                const designSnap = await getDoc(designRef);

                                if (designSnap.exists()) {
                                    const designData = designSnap.data();
                                    const userWishlistRef = doc(db, 'users', user.id, 'wishlist', designId);

                                    // Save to user's wishlist
                                    await setDoc(userWishlistRef, {
                                        id: designId,
                                        ...designData,
                                        saved_at: new Date().toISOString()
                                    });
                                }
                            } catch (itemErr) {
                                console.error(`Failed to migrate wishlist item ${designId}`, itemErr);
                            }
                        }));

                        // Clear local storage after migration attempt
                        localStorage.removeItem('user_wishlist');
                        // Dispatch event update if needed, though Navbar doesn't track wishlist count currently
                    }
                } catch (e) {
                    console.error("Wishlist migration failed", e);
                }
            }
        };

        migrateGuestData();
    }, [user]); // Runs whenever user logs in
};
