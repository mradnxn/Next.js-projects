"use client";

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GoogleAuthButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });
            
            const data = await res.json();
            if (res.ok && data.success) {
                router.refresh();
                router.push('/dashboard');
            } else {
                setError(data.error || "Google Authentication Failed");
                setLoading(false);
            }
        } catch (err) {
            console.error("Auth Exception:", err);
            setError("Server connection failed.");
            setLoading(false);
        }
    };

    const handleFailure = () => {
        setError("OAuth request terminated");
    };

    // Note: the NEXT_PUBLIC_GOOGLE_CLIENT_ID must be placed in .env.local
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "PLACEHOLDER_ID_WARNING";

    return (
        <div className="w-full flex justify-center text-center flex-col items-center">
            {error && <p className="text-red-400 text-xs mb-3 font-semibold">{error}</p>}
            {loading ? (
                <div className="py-2.5 px-4 w-full bg-slate-800 rounded-xl border border-slate-700 font-medium text-slate-300 animate-pulse text-sm">
                    Synchronizing Google Vault...
                </div>
            ) : (
                <GoogleOAuthProvider clientId={clientId}>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleFailure}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        text="continue_with"
                    />
                </GoogleOAuthProvider>
            )}
        </div>
    );
}
