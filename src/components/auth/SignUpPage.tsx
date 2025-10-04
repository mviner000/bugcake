// src/components/auth/SignUpPage.tsx

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { AuthLayout } from "./AuthLayout";
import { ErrorMessage } from "./ErrorMessage";

const signUpSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpPage() {
    const { signIn } = useAuthActions();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/";

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSubmit = async (data: SignUpFormData) => {
        if (isSubmitting) return;

        setError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.set("email", data.email);
            formData.set("password", data.password);
            formData.set("flow", "signUp");

            await signIn("password", formData);
            navigate(from, { replace: true });
        } catch (error: any) {
            setError(error.message || error.toString());
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (isGoogleLoading) return;

        setError(null);
        setIsGoogleLoading(true);

        try {
            await signIn("google");
            navigate(from, { replace: true });
        } catch (error: any) {
            setError(error.message || error.toString());
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <AuthLayout flow="signUp">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
                    Create your account
                </h1>
                <p className="text-2xl text-gray-600 text-balance">
                    Join the hive!
                </p>
            </div>

            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
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

                    <ErrorMessage
                        error={error}
                        onDismiss={() => setError(null)}
                    />

                    <LoadingButton
                        type="submit"
                        loading={isSubmitting}
                        loadingText="Creating account..."
                        spinnerColor="white"
                        className="mt-1 h-[64px] w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full text-base font-medium"
                    >
                        Sign up
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
                            Already have an account?
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting || isGoogleLoading}
                            onClick={() => navigate("/signin")}
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full text-base font-medium bg-transparent disabled:opacity-50"
                        >
                            Sign in
                        </Button>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    );
}