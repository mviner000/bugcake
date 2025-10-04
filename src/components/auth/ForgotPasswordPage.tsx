// src/components/auth/ForgotPasswordPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { MailCheck } from "lucide-react";
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

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const navigate = useNavigate();

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleSubmit = async (data: ForgotPasswordFormData) => {
        if (isSubmitting) return;

        setError(null);
        setIsSubmitting(true);
        console.log("Forgot password form submitted for:", data.email);

        // Simulate API call for demonstration purposes
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In a real application, you would handle the response here.
        // For this static placeholder, we'll just stop the loading spinner.
        console.log("Static placeholder: Email sent success state triggered.");

        setEmailSent(true);
        setIsSubmitting(false);
    };

    if (emailSent) {
        return (
            <AuthLayout flow="forgotPassword">
                <div className="space-y-8">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                            <MailCheck color="orange" size={32} />
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
                            setEmailSent(false);
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
            </AuthLayout>
        );
    }

    return (
        <AuthLayout flow="forgotPassword">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
                    Forgot Password?
                </h1>
                <p className="text-2xl text-gray-600 text-balance">
                    Let's recover your honeybee...
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
        </AuthLayout>
    );
}