"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUserToken, googleSignIn } from '@/auth/AuthUtil';
import { AuthAPI } from '@/api/AuthAPI';

interface AuthWrapperProps {
    children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const [loginNeeded, setLoginNeeded] = useState<boolean | null>(null);
    const router = useRouter();

    /**
     * Verifies if the user is authenticated
     */
    const verifyAuthentication = async () => {
        // Get the user from local storage
        const user = getStoredUserToken();

        // Login is needed if the user is not in local storage
        if (!user) {
            console.log("No user or Id Token found. Login needed.");
            setLoginNeeded(true);
            return;
        }

        // The user is stored in local storage
        // Verify its token
        console.log("Verifying Id Token");
        const verificationResult = await new AuthAPI().verifyToken(user.idToken);

        // Check that the token hasn't expired
        if (verificationResult.name == "TokenExpiredError") {
            console.log("JWT Token Expired");
            // If the token has expired, you need to login
            setLoginNeeded(true);
            return;
        }

        setLoginNeeded(false);
        console.log("Token successfully verified.");
    };

    /**
     * Triggers the Google SignIn process
     */
    const triggerSignIn = () => {
        if (loginNeeded === true) googleSignIn();
    };

    useEffect(() => {
        verifyAuthentication();
    }, []);

    useEffect(() => {
        triggerSignIn();
    }, [loginNeeded]);

    // Empty screen while Google SignIn is loading
    if (loginNeeded == null) return <div></div>;

    if (loginNeeded === true) return <div></div>;

    return <>{children}</>;
}
