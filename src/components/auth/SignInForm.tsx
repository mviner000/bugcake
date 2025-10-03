// src/components/auth/SignInForm.tsx

import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Illustration } from "./Illustration";
import { ErrorMessage } from "./ErrorMessage";

// Form validation schemas
const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});


type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

type Flow = "signIn" | "signUp" | "forgotPassword";

export function SignInForm() {
    // --- Logic from old code ---
    const { signIn } = useAuthActions();
    const [error, setError] = useState<string | null>(null);

    // --- Loading states ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // --- State from new design ---
    const [showPassword, setShowPassword] = useState(false);

    // 🆕 NEW STATE: To control the success view for forgot password
    const [emailSent, setEmailSent] = useState(false);

    // --- NEW: React Router hooks for routing ---
    const location = useLocation();
    const navigate = useNavigate();

    // 🆕 Get the path to redirect to after successful sign-in
    const from = location.state?.from?.pathname || "/";

    // The 'flow' state is now determined by the URL path
    const [flow, setFlow] = useState<Flow>("signIn");

    const getResolver = (flow: Flow) => {
        switch (flow) {
            case "signUp":
                return signUpSchema;
            case "forgotPassword":
                // If the email has been sent, we don't need a resolver, but the form won't be visible anyway.
                return forgotPasswordSchema;
            default:
                return signInSchema;
        }
    }

    // Initialize form with appropriate schema based on flow
    const form = useForm<SignInFormData | SignUpFormData | ForgotPasswordFormData>({
        resolver: zodResolver(getResolver(flow)),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Effect to sync the component state with the URL
    useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath === "/signup") {
            setFlow("signUp");
        } else if (currentPath === "/forgot-password") {
            setFlow("forgotPassword");
        }
        else {
            setFlow("signIn");
        }
        setError(null); // Clear errors when the route changes
        // Reset emailSent state when navigating to forgotPassword or away from it
        setEmailSent(false); // 👈 ADDED: Reset success state on route change

        // Reset form when flow changes to clear any validation errors
        form.reset();
        // Update form resolver based on new flow
        form.clearErrors();
    }, [location.pathname, form]);

    // --- Form submission handler for Sign In / Sign Up ---
    const handleAuthSubmit = async (data: SignInFormData | SignUpFormData) => {
        // Prevent multiple submissions
        if (isSubmitting) return;

        setError(null);
        setIsSubmitting(true);

        try {
            // Create FormData to match existing API expectations
            const formData = new FormData();
            formData.set("email", data.email);
            // We know password exists for signIn/signUp flows
            if ('password' in data) {
                formData.set("password", data.password);
            }
            formData.set("flow", flow);

            await signIn("password", formData);
            // ✅ SUCCESS: Navigate to the calculated 'from' path (or "/")
            navigate(from, { replace: true });
        } catch (error: any) {
            // ✅ IMPROVED: Use the raw error message, parseConvexError will clean it up
            setError(error.message || error.toString());
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Form submission handler for Forgot Password ---
    const handleForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
        if (isSubmitting) return;

        setError(null);
        setIsSubmitting(true);
        console.log("Forgot password form submitted for:", data.email);

        // Simulate API call for demonstration purposes
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In a real application, you would handle the response here.
        // For this static placeholder, we'll just stop the loading spinner.
        console.log("Static placeholder: Email sent success state triggered.");
        
        // 🔑 KEY CHANGE: Set emailSent to true to show the success screen
        setEmailSent(true); 
        
        setIsSubmitting(false);
    }

    // --- Google sign-in handler with loading state ---
    const handleGoogleSignIn = async () => {
        // Prevent multiple submissions
        if (isGoogleLoading) return;

        setError(null);
        setIsGoogleLoading(true);

        try {
            await signIn("google");
            // ✅ SUCCESS: Navigate to the calculated 'from' path (or "/")
            navigate(from, { replace: true });
        } catch (error: any) {        // ✅ IMPROVED: Use the raw error message, parseConvexError will clean it up
            setError(error.message || error.toString());
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const onSubmit = (data: any) => {
        if (flow === 'forgotPassword') {
            handleForgotPasswordSubmit(data);
        } else {
            handleAuthSubmit(data);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
                {/* Illustration Component */}
                {/* 🔑 NOTE: The wireframe implies the new PNG is on the Illustration side for the success state, so we pass emailSent */}
                <Illustration flow={flow} /> 

                {/* Form Side */}
                <div className={`p-8 lg:p-12 flex flex-col justify-center ${flow === 'signUp' ? 'order-2' : 'order-1'}`}>
                    <div className="max-w-md mx-auto w-full">
                        {/* Bee Icon */}
                        <div className="mb-8">
                            <img src="/logo/bugcake-48x48.png" alt="Bugcake Logo" />
                        </div>

                        {/* Content varies based on flow */}
                        {flow === 'forgotPassword' ? (
                            emailSent ? ( // 🔑 KEY CHANGE: Display success state if emailSent is true
                                // Email Sent Success View
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                                            {/* Email Icon or similar, using a simple circle placeholder for now */}
                                            <MailCheck color="orange" size={32}/>
                                        </div>
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                            Email Sent!
                                        </h1>
                                        <p className="text-xl text-gray-600">
                                            Please check your inbox for instructions to reset your password.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            Didn't receive the email? Check your **spam folder**, or click the button below to resend.
                                        </p>
                                    </div>
                                    
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            // 🔑 KEY CHANGE: Go back to the form by setting emailSent to false
                                            setEmailSent(false); 
                                            // You might also want to call form.reset() to clear the email field
                                            form.reset(); 
                                        }}
                                        className="h-[64px] w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full text-base font-medium"
                                    >
                                        Resend Email
                                    </Button>

                                    <div className="text-center mt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => navigate("/signin")}
                                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full text-base font-medium bg-transparent"
                                        >
                                            Back to sign in
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // Forgot Password Form View
                                <>
                                    <div className="mb-8">
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
                                            Forgot Password?
                                        </h1>
                                        <p className="text-2xl text-gray-600 text-balance">
                                            Let's recover your honeybee...
                                        </p>
                                    </div>
                                    <Form {...form}>
                                        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-medium text-gray-700">
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="email"
                                                                disabled={isSubmitting}
                                                                placeholder="you@example.com"
                                                                className="h-[50px] w-full px-4 py-3 bg-orange-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-sm text-red-600" />
                                                    </FormItem>
                                                )}
                                            />

                                            <p className="text-xs text-gray-500 px-1">
                                                Please enter your email address, and we will send you instructions to reset your password.
                                            </p>

                                            <ErrorMessage
                                                error={error}
                                                onDismiss={() => setError(null)}
                                            />

                                            <LoadingButton
                                                type="submit"
                                                loading={isSubmitting}
                                                loadingText="Sending..."
                                                spinnerColor="white"
                                                className="mt-1 h-[64px] w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full text-base font-medium"
                                            >
                                                Continue
                                            </LoadingButton>

                                            <div className="text-center mt-4">
                                                <p className="text-gray-600 mb-4">
                                                    Already have an account?
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={isSubmitting}
                                                    onClick={() => navigate("/signin")}
                                                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full text-base font-medium bg-transparent disabled:opacity-50"
                                                >
                                                    Back to sign in
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </>
                            )
                        ) : (
                            // Sign In / Sign Up View (No changes needed here)
                            <>
                                <div className="mb-8">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
                                        {flow === 'signIn' ? "Make it more easy" : "Create your account"}
                                    </h1>
                                    <p className="text-2xl text-gray-600 text-balance">
                                        {flow === 'signIn' ? "Cake your bugs" : "Join the hive!"}
                                    </p>
                                </div>

                                <Form {...form}>
                                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Email
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            disabled={isSubmitting || isGoogleLoading}
                                                            placeholder=""
                                                            className="h-[50px] w-full px-4 py-3 bg-orange-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-sm text-red-600" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type={showPassword ? "text" : "password"}
                                                                disabled={isSubmitting || isGoogleLoading}
                                                                placeholder="••••••••••••"
                                                                className="h-[50px] w-full px-4 py-3 bg-orange-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 pr-12 disabled:opacity-50"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                disabled={isSubmitting || isGoogleLoading}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                            >
                                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-sm text-red-600" />
                                                </FormItem>
                                            )}
                                        />

                                        {flow === 'signIn' && (
                                            <div className="text-left">
                                                <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-800">
                                                    Forgot Password?
                                                </Link>
                                            </div>
                                        )}

                                        <ErrorMessage
                                            error={error}
                                            onDismiss={() => setError(null)}
                                        />

                                        <LoadingButton
                                            type="submit"
                                            loading={isSubmitting}
                                            loadingText={flow === "signIn" ? "Signing in..." : "Creating account..."}
                                            spinnerColor="white"
                                            className="mt-1 h-[64px] w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full text-base font-medium"
                                        >
                                            {flow === "signIn" ? "Sign in" : "Sign up"}
                                        </LoadingButton>

                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300" />
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-4 bg-white text-gray-500">OR</span>
                                            </div>
                                        </div>

                                        <LoadingButton
                                            type="button"
                                            loading={isGoogleLoading}
                                            loadingText="Connecting to Google..."
                                            spinnerColor="white"
                                            onClick={handleGoogleSignIn}
                                            className="w-full h-[64px] bg-gray-900 hover:bg-gray-800 text-white border-gray-900 py-3 rounded-full text-base font-medium"
                                        >
                                            Sign in with Google
                                        </LoadingButton>

                                        <div className="text-center">
                                            <p className="text-gray-600 mb-4">
                                                {flow === "signIn"
                                                    ? "Doesn't have an account?"
                                                    : "Already have an account?"}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isSubmitting || isGoogleLoading}
                                                onClick={() => {
                                                    navigate(flow === "signIn" ? "/signup" : "/signin");
                                                }}
                                                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full text-base font-medium bg-transparent disabled:opacity-50"
                                            >
                                                {flow === "signIn" ? "Sign up" : "Sign in"}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}