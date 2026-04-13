"use client";

import React, { useEffect, useState } from 'react';
import { getStoredUserToken, googleSignIn } from '@/auth/AuthUtil';

interface AuthWrapperProps {
    children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const [loginNeeded, setLoginNeeded] = useState<boolean | null>(null);

    /**
     * Checks if the user is authenticated based on local storage.
     * Token presence is sufficient to consider the user logged in.
     * Backend microservices are responsible for validating the token.
     */
    const checkAuthentication = () => {
        const user = getStoredUserToken();

        if (!user) {
            console.log("No user or Id Token found. Login needed.");
            setLoginNeeded(true);
            return;
        }

        console.log("User token found in local storage. Proceeding.");
        setLoginNeeded(false);
    };

    /**
     * Triggers the Google SignIn process
     */
    const triggerSignIn = () => {
        if (loginNeeded === true) googleSignIn();
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    useEffect(() => {
        triggerSignIn();
    }, [loginNeeded]);

    // Empty screen while checking local storage (synchronous, near-instant)
    if (loginNeeded == null) return <div></div>;

    if (loginNeeded === true) return <div></div>;

    return <>{children}</>;
}
