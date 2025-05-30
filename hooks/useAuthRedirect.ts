import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

export const useAuthRedirect = (error: unknown) => {
    const router = useRouter();
    const { signOut } = useAuth();

    useEffect(() => {
        const handleAuthError = async () => {
            try {
                if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
                    await signOut();
                    router.replace('/(auth)/login');
                }
            } catch (e) {
                console.error('Error in useAuthRedirect:', e);
            }
        };

        handleAuthError();
    }, [error, router, signOut]);
}; 