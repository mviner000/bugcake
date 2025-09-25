// src/App.tsx

import { Authenticated, Unauthenticated } from "convex/react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { DetailPage } from "./sheet/detail-page";
import { Header } from "./Header";
import { SignInForm } from "./SignInForm";
import { Dashboard } from "./Dashboard";
import { ProfilePage } from "./ProfilePage";
import { RBACPage } from "./rbac-page";

function UnauthenticatedRoutes() {
  const location = useLocation();

  // If the user tries to access the dashboard or any other protected route while unauthenticated,
  // we record the path and redirect them to /signin.
  // The 'from' state can be used later to send them back after sign-in.
  const state = { from: location };

  return (
    <Routes>
      <Route path="/signin" element={<SignInForm />} />
      <Route path="/signup" element={<SignInForm />} />
      {/* 🆕 Redirect any other unauthenticated path to sign-in */}
      <Route path="*" element={<Navigate to="/signin" state={state} replace />} />
    </Routes>
  );
}

// 🆕 New component to handle authenticated redirection
function AuthenticationGuard() {
  const location = useLocation();
  
  // Use 'state.from' to redirect to the page they originally wanted (e.g., /sheet/123)
  // or default to the dashboard ("/").
  const from = location.state?.from?.pathname || "/";
  
  // If the user is on /signin or /signup while *authenticated*, redirect them to the dashboard.
  if (location.pathname === "/signin" || location.pathname === "/signup") {
    return <Navigate to={from} replace />;
  }
  
  // Otherwise, render the app's protected routes normally.
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sheet/:sheetId" element={<DetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/rbac" element={<RBACPage />} />
        {/* Fallback for protected routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Authenticated>
        {/* Use the guard component for all authenticated routes */}
        <AuthenticationGuard />
      </Authenticated>
      <Unauthenticated>
        {/* Use the routes component for all unauthenticated routes */}
        <UnauthenticatedRoutes />
      </Unauthenticated>
    </BrowserRouter>
  );
}