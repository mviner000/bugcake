import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Illustration } from "./Illustration";
import { ErrorMessage } from "./ErrorMessage";

export function SignInForm() {
  // --- Logic from old code ---
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);

  // --- Loading states ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // --- State from new design ---
  const [showPassword, setShowPassword] = useState(false);

  // --- NEW: React Router hooks for routing ---
  const location = useLocation();
  const navigate = useNavigate();

  // 🆕 Get the path to redirect to after successful sign-in
  const from = location.state?.from?.pathname || "/";

  // The 'flow' state is now determined by the URL path
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");

  // Effect to sync the component state with the URL
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === "/signup") {
      setFlow("signUp");
    } else {
      setFlow("signIn");
    }
    setError(null); // Clear errors when the route changes
  }, [location.pathname]);

  // --- Form submission handler with loading state ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
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
    } catch (error: any) {
      // ✅ IMPROVED: Use the raw error message, parseConvexError will clean it up
      setError(error.message || error.toString());
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        {/* Illustration Component */}
        <Illustration flow={flow} />

        {/* Left Side - Sign In Form */}
        <div className={`p-8 lg:p-12 flex flex-col justify-center ${flow === 'signUp' ? 'order-2' : 'order-1'}`}>
          <div className="max-w-md mx-auto w-full">
            {/* Bee Icon */}
            <div className="mb-8">
              <img src="/logo/bugcake-48x48.png" alt="" />
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
                {flow === 'signIn' ? "Make it more easy" : "Create your account"}
              </h1>
              <p className="text-2xl text-gray-600 text-balance">
                {flow === 'signIn' ? "Cake your bugs" : "Join the hive!"}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isSubmitting || isGoogleLoading}
                  placeholder=""
                  className="w-full px-4 py-3 bg-orange-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isSubmitting || isGoogleLoading}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-orange-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 pr-12 disabled:opacity-50"
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
              </div>

              {/* Forgot Password (only show on sign-in) */}
              {flow === 'signIn' && (
                <div className="text-right">
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-800">
                    Forgot Password?
                  </a>
                </div>
              )}

              {/* Enhanced ErrorMessage */}
              <ErrorMessage 
                error={error} 
                onDismiss={() => setError(null)} 
              />

              {/* Dynamic Sign In/Up Button with Loading */}
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText={flow === "signIn" ? "Signing in..." : "Creating account..."}
                spinnerColor="white"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full text-base font-medium"
              >
                {flow === "signIn" ? "Sign in" : "Sign up"}
              </LoadingButton>

              {/* OR Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Google Sign In with Loading */}
              <LoadingButton
                type="button"
                loading={isGoogleLoading}
                loadingText="Connecting to Google..."
                spinnerColor="white"
                onClick={handleGoogleSignIn}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-900 py-3 rounded-full text-base font-medium"
              >
                Sign in with Google
              </LoadingButton>

              {/* Dynamic Sign Up/In Link */}
              <div className="text-center mt-8">
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
          </div>
        </div>
      </div>
    </div>
  );
}