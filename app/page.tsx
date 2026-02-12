"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserToken, googleSignIn } from "@/auth/AuthUtil";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUserToken();
    if (user) {
      router.push("/list");
    } else {
      googleSignIn();
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Toto Suppie</h1>
        <p className="text-lg">Your smart shopping list</p>
        <p className="text-sm mt-4">Signing in with Google...</p>
      </div>
    </div>
  );
}
