// src/components/auth/AuthLayout.tsx

import { ReactNode } from "react";
import { Illustration } from "./Illustration";

interface AuthLayoutProps {
    flow: "signIn" | "signUp" | "forgotPassword";
    children: ReactNode;
}

export function AuthLayout({ flow, children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
                {/* Illustration Component */}
                <Illustration flow={flow} />

                {/* Form Side */}
                <div className={`p-8 lg:p-12 flex flex-col justify-center ${flow === 'signUp' ? 'order-2' : 'order-1'}`}>
                    <div className="max-w-md mx-auto w-full">
                        {/* Bee Icon */}
                        <div className="mb-8">
                            <img src="/logo/bugcake-48x48.png" alt="Bugcake Logo" />
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}