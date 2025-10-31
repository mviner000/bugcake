// src/App.tsx

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { Toaster } from "@/components/ui/sonner";

import { api } from "../convex/_generated/api";

// Import your components
import { DetailPage } from "./components/sheet/detail-page";
import { ChecklistDetailPage } from "./components/checklist/ChecklistDetailPage"; // ✅ NEW: Checklist detail page
import { Header } from "./components/navbar/Header";
import { Dashboard } from "./components/dashboard";
import { ProfilePage } from "./components/profile/ProfilePage";
import { SignInPage } from "./components/auth/SignInPage";
import { SignUpPage } from "./components/auth/SignUpPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { NotFound } from "./components/NotFound";
import { RBACPage } from "./components/rbac/rbac-page";
import { VerificationStatusPage } from "./components/auth/VerificationStatusPage";
import { MultiStepFormPage } from "./components/multi-step-form-page";
import ChecklistAccessRequest from "./components/checklist/access-request";

/**
 * Handles routing for users who are not logged in.
 */
function UnauthenticatedRoutes() {
  const location = useLocation();
  const state = { from: location };

  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
  const { signOut } = useAuthActions();

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
          <Route path="/checklist/:checklistId" element={<ChecklistDetailPage />} />

          <Route 
            path="/checklist/:checklistId/request-access" 
            element={<ChecklistAccessRequest />} 
          />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rbac" element={<RBACPage />} />
          <Route path="/create-template" element={<MultiStepFormPage />} />
          {/* Redirect authenticated users away from auth pages */}
          <Route path="/signin" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/" replace />} />
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
      <Route
        path="/status"
        element={
          <VerificationStatusPage
            status={user?.verificationStatus}
            userEmail={user?.email}
            onSignOut={signOut}
          />
        }
      />

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
      <Toaster />
    </BrowserRouter>
  );
}