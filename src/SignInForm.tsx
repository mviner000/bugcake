import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

// Define a type for our testimonial data
interface Testimonial {
  name: string;
  text: string;
  image: string;
}


export function SignInForm() {
  // --- Logic from old code ---
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);

  // --- State from new design ---
  const [showPassword, setShowPassword] = useState(false);

  // --- NEW: React Router hooks for routing ---
  const location = useLocation();
  const navigate = useNavigate();

    
  // 🆕 Get the path to redirect to after successful sign-in
  // If they were trying to access a page like /sheet/123, location.state.from will contain it.
  // Default to "/" (dashboard).
  const from = location.state?.from?.pathname || "/";


  // The 'flow' state is now determined by the URL path
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");

  // State for the animated testimonial gallery
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Data for the customer testimonials
  const testimonials: Testimonial[] = [
    {
      name: "Sarah K.",
      text: '"This app is absolutely amazing! Bug tracking has never been easier."',
      image: "https://placehold.co/100x100/1e90ff/ffffff?text=SK",
    },
    {
      name: "John B.",
      text: '"An intuitive and powerful tool. It has completely streamlined our workflow."',
      image: "https://placehold.co/100x100/3cb371/ffffff?text=JB",
    },
    {
      name: "Maria L.",
      text: '"The best bug-tracking solution we\'ve ever used. The team is incredibly responsive."',
      image: "https://placehold.co/100x100/ff6347/ffffff?text=ML",
    },
  ];

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

  // Effect for the testimonial animation
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change testimonial every 4 seconds

    return () => clearInterval(testimonialInterval); // Cleanup on unmount
  }, [testimonials.length]);

  // --- Form submission handler from old code ---
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);

    signIn("password", formData)
      .then(() => {
        // ✅ SUCCESS: Navigate to the calculated 'from' path (or "/")
        navigate(from, { replace: true }); 
      })
      .catch((error) => {
        // Clean up the error message for better display
        setError(error.message.replace("Invalid credentials: ", ""));
      });
  };

  // --- Google sign-in handler ---
  const handleGoogleSignIn = () => {
    setError(null);
    signIn("google")
      .then(() => {
        // ✅ SUCCESS: Navigate to the calculated 'from' path (or "/")
        navigate(from, { replace: true });
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        {/*
         Wireframe logic applied:
         - If it's a 'signIn' flow, the form is on the left and illustration is on the right (default order).
         - If it's a 'signUp' flow, the illustration is on the left and form is on the right, achieved by flipping the grid order.
        */}
        {/* Right Side - Illustration (Now conditional on order) */}
        <div className={`hidden lg:block bg-gradient-to-br from-orange-400 to-orange-500 p-8 relative overflow-hidden ${flow === 'signUp' ? 'order-1' : 'order-2'}`}>
          {/* <img src="/bugs-rightside.png" alt="Decorative illustration of bugs" /> */}
          <div className="relative h-full flex items-center justify-center">
            {/* Bug Reports Window */}
            <div className="bg-white rounded-lg shadow-lg p-4 w-64 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-2 text-sm font-medium text-gray-700 blur-sm">Bug Reports</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 blur-sm">Bug Reports</div>
                <div className="text-sm text-gray-600 blur-sm">Bug Reports</div>
                <div className="w-16 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>

            {/* Code Editor Window */}
            <div className="absolute top-20 rotate-4 right-8 bg-gray-900 rounded-lg shadow-lg p-4 w-72 text-sm font-mono">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-2 text-sm text-white blur-sm">kekyvodts</span>
              </div>
              <div className="text-purple-400 blur-sm">astril:</div>
              <div className="text-green-400 blur-sm">string(ted{"{}"});</div>
              <div className="text-white blur-sm">
                2{"{"}
                {"{"}
              </div>
              <div className="text-white ml-4 blur-sm">4</div>
              <div className="text-orange-400 ml-4 blur-sm">bug</div>
              <div className="text-white ml-4 blur-sm">1</div>
              <div className="text-white ml-4 blur-sm">8</div>
              <div className="text-green-400 blur-sm">66om7{"}"}</div>
              <div className="text-white blur-sm">7{"}"}</div>
            </div>

            {/* Floating Bug Icon */}
            <div className="absolute top-32 left-6 bg-orange-400 rounded-lg p-3 shadow-lg rotate-6">
              <div className="w-6 h-6 text-white text-xl">✓</div>
            </div>


            {/* Floating Dialog */}
            <div className="absolute top-14 left-32 bg-white rounded-lg shadow-lg p-2 w-24 -rotate-12">
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="text-xs">•</div>
              </div>
            </div>

            {/* Notification Badge */}
            <div className="absolute top-24 right-4 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold blur-sm">3</span>
            </div>


            {/* Progress Bar Card */}
            <div className="absolute top-56 left-14 -rotate-4 bg-white rounded-lg shadow-lg p-3 w-28">
              <div className="space-y-2">
                <div className="w-full h-1 bg-gray-200 rounded">
                  <div className="w-3/4 h-1 bg-green-500 rounded"></div>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded">
                  <div className="w-1/2 h-1 bg-blue-500 rounded"></div>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded">
                  <div className="w-1/4 h-1 bg-orange-500 rounded"></div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute top-20 left-28 bg-green-500 rounded-full px-3 py-1 shadow-lg rotate-[-8deg]">
              <span className="text-white text-xs font-medium blur-sm">Active</span>
            </div>

            {/* Floating Button */}
            <div className="absolute top-40 right-20 bg-purple-500 rounded-lg px-3 py-2 shadow-lg rotate-[-12deg]">
              <span className="text-white text-xs font-medium blur-sm">Save</span>
            </div>

            {/* New Random Element 2: Mini Chart Card */}
            <div className="absolute top-1/4 right-0 bg-white rounded-lg shadow-xl p-2 w-20 rotate-[110deg] z-20">
              <div className="h-8 flex justify-around items-end">
                <div className="w-1 bg-blue-300 h-2/3 rounded-sm"></div>
                <div className="w-1 bg-green-400 h-full rounded-sm"></div>
                <div className="w-1 bg-red-300 h-1/2 rounded-sm"></div>
                <div className="w-1 bg-yellow-400 h-3/4 rounded-sm"></div>
              </div>
            </div>

            {/* New Random Element 4: Placeholder Text Block */}
            <div className="absolute top-2/3 left-10 bg-gray-100 rounded-md shadow-sm p-2 w-28 -rotate-6 z-20">
              <div className="w-3/4 h-2 bg-gray-300 rounded mb-1"></div>
              <div className="w-full h-2 bg-gray-300 rounded mb-1"></div>
              <div className="w-1/2 h-2 bg-gray-300 rounded"></div>
            </div>

            {/* Animated Customer Satisfaction Cards */}
            <div className="absolute bottom-12 left-16 w-96 h-40"> {/* Container for the animated cards */}
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`
                    absolute top-0 left-0 w-full h-full
                    bg-white rounded-lg shadow-2xl p-4 border border-gray-100
                    transition-opacity duration-1000 ease-in-out
                    ${index === currentTestimonialIndex ? 'opacity-100 z-30' : 'opacity-0 z-20'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src={testimonial.image} alt={`Avatar of ${testimonial.name}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-yellow-400">★★★★★</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">
                        {testimonial.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 font-medium">- {testimonial.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left Side - Sign In Form (Now conditional on order) */}
        <div className={`p-8 lg:p-12 flex flex-col justify-center ${flow === 'signUp' ? 'order-2' : 'order-1'}`}>
          <div className="max-w-md mx-auto w-full">
            {/* Bee Icon */}
            <div className="mb-8">
              {/* <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">🐝</div> */}
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
                  name="email" // <-- for FormData
                  type="email"
                  required
                  placeholder=""
                  className="w-full px-4 py-3 bg-orange-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500"
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
                    name="password" // <-- for FormData
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-orange-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

              {/* Error Message Display */}
              {error && (
                <div className="p-3 bg-red-100 text-red-700 text-sm font-medium rounded-lg text-center">
                  {error}
                </div>
              )}

              {/* Dynamic Sign In/Up Button */}
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full text-base font-medium"
              >
                {flow === "signIn" ? "Sign in" : "Sign up"}
              </Button>

              {/* OR Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn} // <-- functionality
                className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-900 py-3 rounded-full text-base font-medium"
              >
                Sign in with Google
              </Button>

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
                  onClick={() => {
                    // --- CHANGED: Navigate between routes instead of toggling state ---
                    navigate(flow === "signIn" ? "/signup" : "/signin");
                  }}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full text-base font-medium bg-transparent"
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
