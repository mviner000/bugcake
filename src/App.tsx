import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { api } from "../convex/_generated/api"; // Ensure API path is correct

// Import your components
import { DetailPage } from "./components/sheet/detail-page";
import { Header } from "./components/navbar/Header";
import { Dashboard } from "./components/dashboard";
import { ProfilePage } from "./components/profile/ProfilePage";
import { SignInForm } from "./components/auth/SignInForm";
import { NotFound } from "./components/NotFound";
import { RBACPage } from "./components/rbac/rbac-page";
import { VerificationStatusPage } from "./components/auth/VerificationStatusPage";

/**
 * Handles routing for users who are not logged in.
 */
function UnauthenticatedRoutes() {
  const location = useLocation();
  const state = { from: location };

  return (
    <Routes>
      <Route path="/signin" element={<SignInForm />} />
      <Route path="/signup" element={<SignInForm />} />
      <Route path="*" element={<Navigate to="/signin" state={state} replace />} />
    </Routes>
  );
}

/**
 * This new component is the gatekeeper for all authenticated users.
 * It checks verificationStatus and directs users accordingly.
 */
function AuthenticatedApp() {
  const user = useQuery(api.myFunctions.getMyProfile);
  const status = user?.verificationStatus;

  // Show a loading state while fetching the user's profile
  if (status === undefined) {
    return <div>Loading your profile...</div>;
  }

  // If the user is approved, show the full application with all routes.
  if (status === "approved") {
    return (
      <>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sheet/:sheetId" element={<DetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rbac" element={<RBACPage />} />
          {/* Redirect authenticated users away from auth pages */}
          <Route path="/signin" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          {/* An approved user trying to access /status is redirected home */}
          <Route path="/status" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    );
  }

  // For 'pending' or 'declined' users, only allow access to the status page.
  return (
    <Routes>
      <Route path="/status" element={<VerificationStatusPage status={status} />} />
      {/* Any other URL will redirect them back to their status page */}
      <Route path="*" element={<Navigate to="/status" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedRoutes />
      </Unauthenticated>
    </BrowserRouter>
  );
}