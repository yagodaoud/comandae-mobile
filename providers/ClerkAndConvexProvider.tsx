import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from "@/cache";
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import React from 'react'

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL!;
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!CONVEX_URL) {
    throw new Error('Missing Convex URL. Please set EXPO_PUBLIC_CONVEX_URL in your .env');
}

if (!publishableKey) {
    throw new Error(
        'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    )
}

const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
});


function ConvexProviderWrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export default function ClerkAndConvexProvider({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
                <ClerkLoaded>
                    <ConvexProviderWrapper>
                        {children}
                    </ConvexProviderWrapper>
                </ClerkLoaded>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}